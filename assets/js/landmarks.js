/* Low-poly landmark builders: PH.landmarks[kind](spec, ctx) -> THREE.Object3D.
   ctx: { geo(lat, lon, altM?) -> Vector3 (altM omitted = ground), sample(area, count, minM, maxM) -> [{lat, lon, h}],
          unitsPerM (world units per metre, horizontal), rnd(), glow (sprite texture) }.
   An object may set userData.tick = (t, dt, night) => {} for per-frame animation. */
(function () {
  'use strict';
  const PH = (window.PH = window.PH || {});
  const C = h => new THREE.Color(h);
  const lambert = (color, extra) => new THREE.MeshLambertMaterial(Object.assign({ color, flatShading: true }, extra));

  // Minimal GLB reader: first mesh's primitives (position, normal, indices) plus material names.
  // shortcut: ignores node transforms, textures and interleaved buffers, fine for this single-node model; use GLTFLoader for anything richer.
  async function loadGLB(src) { // src: a URL, or the file's bytes as an ArrayBuffer
    let buf = src;
    if (typeof src === 'string') {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
      buf = await res.arrayBuffer();
    }
    const dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('eagle model is not a GLB file');
    const jsonLen = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen)));
    const bin = 20 + jsonLen + 8;
    const TYPES = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }, SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
    const read = i => {
      const a = json.accessors[i], v = json.bufferViews[a.bufferView], T = TYPES[a.componentType], n = a.count * SIZE[a.type];
      if (!T || (v.byteStride && v.byteStride !== SIZE[a.type] * T.BYTES_PER_ELEMENT)) throw new Error('unsupported GLB accessor layout');
      const start = bin + (v.byteOffset || 0) + (a.byteOffset || 0);
      return new T(buf.slice(start, start + n * T.BYTES_PER_ELEMENT));
    };
    return json.meshes[0].primitives.map(p => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(read(p.attributes.POSITION), 3));
      if (p.attributes.NORMAL != null) g.setAttribute('normal', new THREE.BufferAttribute(read(p.attributes.NORMAL), 3));
      if (p.indices != null) g.setIndex(new THREE.BufferAttribute(read(p.indices), 1));
      return { geometry: g, name: json.materials?.[p.material]?.name || '' };
    });
  }

  // Shared scatter helper: one InstancedMesh per part, each instance placed on the ground with a random yaw.
  function scatter(points, parts, ctx, scaleFn) {
    const group = new THREE.Group(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s3 = new THREE.Vector3();
    for (const [geo, mat] of parts) {
      const im = new THREE.InstancedMesh(geo, mat, Math.max(1, points.length));
      im.count = points.length;
      points.forEach((p, i) => {
        e.set(0, p.yaw ?? ctx.rnd() * 6.28, 0); q.setFromEuler(e);
        const s = scaleFn ? scaleFn(i) : 1;
        im.setMatrixAt(i, m4.compose(ctx.geo(p.lat, p.lon, p.alt), q, s3.set(s, s, s)));
      });
      group.add(im);
    }
    return group;
  }

  const FROND = (() => {
    const g = new THREE.BufferGeometry(), v = [], n = 6, L = 3.2;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, w0 = Math.sin(t0 * Math.PI) * .45 + .05, w1 = Math.sin(t1 * Math.PI) * .45 + .05;
      const y0 = -1.6 * t0 * t0, y1 = -1.6 * t1 * t1, x0 = t0 * L, x1 = t1 * L;
      v.push(x0, y0, -w0, x1, y1, -w1, x1, y1 + .08, 0, x0, y0, -w0, x1, y1 + .08, 0, x0, y0 + .08, 0,
             x0, y0 + .08, 0, x1, y1 + .08, 0, x1, y1, w1, x0, y0 + .08, 0, x1, y1, w1, x0, y0, w0);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  })();

  const L = (PH.landmarks = {});

  // { area:[s,w,n,e], count, maxM? } palms on low land
  L.palms = (spec, ctx) => {
    const spots = ctx.sample(spec.area, spec.count || 150, 0.5, spec.maxM ?? 40);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.11, .2, 1, 5).translate(0, .5, 0), lambert(0x4a3a2c), Math.max(1, spots.length));
    const fronds = new THREE.InstancedMesh(FROND, lambert(0x2f5a2a, { side: THREE.DoubleSide }), Math.max(1, spots.length * 7));
    trunks.count = spots.length; fronds.count = spots.length * 7;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
    spots.forEach((s, i) => {
      const base = ctx.geo(s.lat, s.lon).add(p3.set(0, -.2, 0)).clone();
      const tall = 3.5 + ctx.rnd() * 3.5, lean = (ctx.rnd() - .5) * .35;
      e.set(0, ctx.rnd() * 6.28, lean); q.setFromEuler(e);
      trunks.setMatrixAt(i, m4.compose(base, q, s3.set(1, tall, 1)));
      const top = new THREE.Vector3(0, tall, 0).applyQuaternion(q).add(base);
      for (let k = 0; k < 7; k++) {
        e.set((ctx.rnd() - .5) * .3, k / 7 * 6.28 + ctx.rnd() * .4, .25 + ctx.rnd() * .3); q.setFromEuler(e);
        const sc = .7 + ctx.rnd() * .4;
        fronds.setMatrixAt(i * 7 + k, m4.compose(top, q, s3.set(sc, sc, sc)));
      }
    });
    const g = new THREE.Group(); g.add(trunks, fronds); return g;
  };

  // { area, count, maxM } warm lights on low land that brighten at night
  L.cityLights = (spec, ctx) => {
    const spots = ctx.sample(spec.area, spec.count || 2000, 0.3, spec.maxM ?? 120), lp = [], lc = [];
    const warm = ['#ffcf80', '#ffdca8', '#ff9d4d', '#fff1d6', '#ffb35c'].map(C);
    for (const s of spots) {
      const p = ctx.geo(s.lat, s.lon); lp.push(p.x, p.y + .35, p.z);
      warm[(ctx.rnd() * warm.length) | 0].toArray(lc, lc.length);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(lc, 3));
    const mat = new THREE.PointsMaterial({ size: .9, map: ctx.glow, vertexColors: true, transparent: true, opacity: .15, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    pts.userData.tick = (t, dt, night) => { mat.opacity = PH_CORE.lerp(.12, 1, night) * (.92 + Math.sin(t * 7) * .04); };
    return pts;
  };

  // { at:[lat,lon], altM, radiusM, count } clouds orbiting a summit
  L.clouds = (spec, ctx) => {
    const mat = lambert(0xf3e3d6, { emissive: 0x8a5a48, transparent: true, opacity: .7 });
    const centre = ctx.geo(spec.at[0], spec.at[1], spec.altM), group = new THREE.Group(), u = ctx.unitsPerM;
    for (let i = 0; i < (spec.count || 12); i++) {
      const g = new THREE.Group();
      for (let k = 0; k < 4; k++) {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat);
        m.position.set((k - 1.5) * 2.2 + ctx.rnd(), ctx.rnd() * .8, (ctx.rnd() - .5) * 2);
        m.scale.set(2.2 + ctx.rnd() * 2, 1 + ctx.rnd() * .6, 1.8 + ctx.rnd());
        g.add(m);
      }
      g.userData = { r: (spec.radiusM || 6000) * u * (.6 + ctx.rnd() * .8), a: ctx.rnd() * 6.28, y: centre.y + (ctx.rnd() - .3) * 14, s: (.01 + ctx.rnd() * .015) * (i % 2 ? 1 : -1) };
      group.add(g);
    }
    group.userData.tick = (t, dt, night) => {
      mat.color.setHSL(.06, .4, PH_CORE.lerp(.85, .4, night));
      mat.emissive.setHSL(.04, .35, PH_CORE.lerp(.32, .06, night));
      group.children.forEach(g => { const d = g.userData; d.a += d.s * dt; g.position.set(centre.x + Math.cos(d.a) * d.r, d.y, centre.z + Math.sin(d.a) * d.r); g.rotation.y = -d.a; });
    };
    return group;
  };

  // { at:[lat,lon], altM, radiusM } the Philippine eagle circling; engine's follow camera tracks userData.follow
  L.eagle = (spec, ctx) => {
    const eagle = new THREE.Group();
    const brown = lambert(0x5a3e28, { side: THREE.DoubleSide }), cream = lambert(0xe9dcc4);
    const body = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), cream); body.scale.set(.5, .45, 1.8);
    const head = new THREE.Mesh(new THREE.OctahedronGeometry(.45, 0), cream); head.position.set(0, .2, 1.7);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(.14, .5, 4).rotateX(Math.PI / 2), lambert(0x3d4148)); beak.position.set(0, .12, 2.2);
    const wingShape = new THREE.BufferGeometry();
    wingShape.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .7, 1.9, .1, .45, 0, 0, -.8, 1.9, .1, .45, 4, .25, -.4, 0, 0, -.8, 1.9, .1, .45, 3.6, .2, .3, 4, .25, -.4], 3));
    wingShape.computeVertexNormals();
    const wingL = new THREE.Mesh(wingShape, brown), wingR = new THREE.Mesh(wingShape, brown); wingR.scale.x = -1;
    const pivotL = new THREE.Group(), pivotR = new THREE.Group(); pivotL.add(wingL); pivotR.add(wingR);
    pivotL.position.x = .3; pivotR.position.x = -.3;
    const tail = new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -1.4, -.7, 0, -2.8, .7, 0, -2.8], 3)), brown);
    tail.geometry.computeVertexNormals();
    eagle.add(body, head, beak, pivotL, pivotR, tail); eagle.scale.setScalar(1.8);

    // Swap in the eagle model when it loads, recoloured to Philippine eagle tones; the wings flap in the vertex shader.
    const flapU = { value: 0 };
    const src = window.EAGLE_GLB_BASE64 ? Uint8Array.from(atob(window.EAGLE_GLB_BASE64), c => c.charCodeAt(0)).buffer : 'assets/models/eagle.glb';
    loadGLB(src).then(parts => {
      const COLORS = { eagle_head: 0xd8c39a, eagle_body: 0x3f2c1e, eagle_tail: 0x5b4331, eagle_beak: 0x5f6b78 };
      const model = new THREE.Group();
      for (const { geometry, name } of parts) {
        geometry.translate(0, -30, -40); geometry.rotateY(Math.PI); // centre it; the model's beak faces -z, lookAt() aims +z
        const mat = lambert(COLORS[name] ?? 0x5a3e28, { side: THREE.DoubleSide });
        if (name === 'eagle_body') mat.onBeforeCompile = sh => {
          sh.uniforms.uFlap = flapU;
          sh.vertexShader = 'uniform float uFlap;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
            float ax = abs(transformed.x);
            if (ax > 14.) {
              float d = ax - 14.;
              float ang = uFlap * smoothstep(0., 26., d) * (.7 + .3 * clamp(d / 116., 0., 1.));
              vec2 r = vec2(d * cos(ang) - transformed.y * sin(ang), d * sin(ang) + transformed.y * cos(ang));
              transformed.x = sign(transformed.x) * (14. + r.x); transformed.y = r.y;
            }`);
        };
        model.add(new THREE.Mesh(geometry, mat));
      }
      model.scale.setScalar(16 / 260 / 1.8); // ~16-unit wingspan inside the group's 1.8 scale
      eagle.remove(...eagle.children); eagle.add(model);
    }).catch(err => console.warn('eagle.glb not loaded; keeping the built-in eagle.', err));

    const c = ctx.geo(spec.at[0], spec.at[1], spec.altM), R = (spec.radiusM || 4000) * ctx.unitsPerM;
    eagle.position.set(c.x + R, c.y, c.z);
    eagle.userData.follow = true;
    eagle.userData.tick = (t, dt, night, reduce) => {
      if (reduce) return;
      const a = t * .22;
      eagle.position.set(c.x + Math.cos(a) * R, c.y + Math.sin(t * .5) * 2, c.z + Math.sin(a) * R);
      eagle.lookAt(c.x + Math.cos(a + .1) * R, eagle.position.y, c.z + Math.sin(a + .1) * R);
      eagle.rotateZ(.35); // bank into the turn
      const flap = Math.sin(t * 5) * .5 * PH_CORE.smooth(.2, .8, Math.sin(t * .6));
      pivotL.rotation.z = flap + .08; pivotR.rotation.z = -flap - .08;
      flapU.value = flap * 1.2 + .08;
    };
    return eagle;
  };

  PH.loadGLB = loadGLB;
  PH.scatter = scatter;
  PH.lambert = lambert;
})();
