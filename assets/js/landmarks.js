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

  const L = (PH.landmarks = {});

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

  // Same swell as the water shader in engine.js, so floating things ride the waves.
  const waveY = (x, z, t) => Math.sin(x * .09 + t * .9) * .32 + Math.cos(z * .11 + t * .7) * .28 + Math.sin((x + z) * .23 + t * 1.6) * .1;
  const deg = d => d * Math.PI / 180;
  const floaters = (group, items, lift = 0) => {
    group.userData.tick = (t, dt, night, reduce) => {
      if (reduce) return;
      for (const o of items) { o.position.y = waveY(o.position.x, o.position.z, t) + lift; o.rotation.z = Math.sin(t * 1.3 + o.position.x) * .06; }
    };
  };
  // Water spots near a point or in an area: { at:[lat,lon], spreadM } or { area }.
  const waterSpots = (spec, ctx, count) => {
    if (spec.area) return ctx.sample(spec.area, count, -400, -.5);
    const d = (spec.spreadM || 300) / 111320;
    return ctx.sample([spec.at[0] - d, spec.at[1] - d, spec.at[0] + d, spec.at[1] + d], count, -400, -.2);
  };

  // { at, altM } a faint red glow at an active summit, brighter after dark (Mayon)
  L.summitGlow = (spec, ctx) => {
    const p = ctx.geo(spec.at[0], spec.at[1], spec.altM);
    const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([p.x, p.y, p.z], 3));
    const mat = new THREE.PointsMaterial({ size: 26, map: ctx.glow, color: 0xff5a2a, transparent: true, opacity: .2, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    pts.userData.tick = (t, dt, night) => { mat.opacity = (.18 + night * .7) * (.85 + .15 * Math.sin(t * 1.7)); };
    return pts;
  };

  /* ---------------------------------------------------------------- downloaded models (see assets/js/models.js)
     Each builder lists the models it needs in .models; the engine loads them before building the scene.
     Sizes are in world units and deliberately larger than life so landmarks read at island scale. */
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const on = (ctx, lat, lon, sink = .15) => ctx.geo(lat, lon).add(V3(0, -sink, 0));
  const scatterPoints = (ctx, area, count, minM, maxM, sizeJitter = .4) =>
    ctx.sample(area, count, minM, maxM).map(s => ({ pos: on(ctx, s.lat, s.lon), yaw: ctx.rnd() * 6.28, scale: 1 - sizeJitter / 2 + ctx.rnd() * sizeJitter }));
  const def = (kind, models, build) => { L[kind] = build; L[kind].models = models; };

  // Boats and swimmers riding the swell: one clone each so they can bob independently.
  function floating(spec, ctx, make, lift) {
    const group = new THREE.Group(), items = [];
    for (const s of waterSpots(spec, ctx, spec.count || 5)) {
      const o = make();
      const p = ctx.geo(s.lat, s.lon, 0);
      o.position.set(p.x, lift, p.z); o.rotation.y = ctx.rnd() * 6.28;
      group.add(o); items.push(o);
    }
    floaters(group, items, lift);
    return group;
  }

  // { area:[s,w,n,e], count, maxM? } coconut palms on low land
  def('palms', ['palm'], (spec, ctx) =>
    PH.modelInstances('palm', scatterPoints(ctx, spec.area, spec.count || 150, .5, spec.maxM ?? 40), { height: 5.5 }));

  // { area | at, count, scale } outrigger boats (a downloaded canoe stands in for the bangka)
  def('bangka', ['canoe'], (spec, ctx) => floating(spec, ctx, () => PH.modelClone('canoe', { length: 3.4 * (spec.scale || 1) }), -.15));

  // { area | at, count } paraw sailboats (Boracay)
  def('paraw', ['sailboat'], (spec, ctx) => floating(spec, ctx, () => PH.modelClone('sailboat', { height: 6.5 * (spec.scale || 1) }), -.25));

  // { at, count, spreadM, scale } surfers standing on boards
  def('surfer', ['surfer', 'surfboard'], (spec, ctx) => floating(spec, ctx, () => {
    const g = new THREE.Group(), k = spec.scale || 1;
    const board = PH.modelClone('surfboard', { height: 2.3 * k }); // modelled standing on its tail: lay it flat
    board.rotation.x = Math.PI / 2; board.position.set(0, .05, -1.15 * k);
    const rider = PH.modelClone('surfer', { height: 1.8 * k }); rider.position.y = .1;
    g.add(board, rider);
    return g;
  }, 0));

  // { at, heading, ruin, scale } stone bell tower; with a church beside it unless it is a ruin (Cagsawa)
  def('belfry', ['stonetower', 'church'], (spec, ctx) => {
    const g = new THREE.Group(), k = spec.scale || 1;
    g.add(PH.modelClone('stonetower', { height: 6.5 * k }, spec.ruin ? '#9b9387' : null));
    if (!spec.ruin) { const church = PH.modelClone('church', { height: 5 * k }); church.position.set(-4 * k, 0, 1 * k); g.add(church); }
    g.position.copy(on(ctx, spec.at[0], spec.at[1], .3)); g.rotation.y = deg(spec.heading || 0);
    return g;
  });

  // { at, heading (deg, 0 = north), length } jetty from the shoreline out to a viewing pavilion (Cloud 9)
  def('boardwalk', ['dock', 'gazebo'], (spec, ctx) => {
    const hd = deg(spec.heading ?? 90), step = 40 / 111320;
    let [lat, lon] = spec.at;
    for (let i = 0; i < 100 && ctx.heightAt(lat, lon) > 0; i++) { lat += Math.cos(hd) * step; lon += Math.sin(hd) * step / Math.cos(lat * Math.PI / 180); }
    const g = new THREE.Group(), len = spec.length || 12, seg = 3, n = Math.max(1, Math.round(len / seg)); g.name = 'boardwalk';
    for (let i = 0; i < n; i++) {
      const d = PH.modelClone('dock', { length: seg });
      const sz = new THREE.Box3().setFromObject(d).getSize(V3());
      if (sz.x > sz.z) d.rotation.y = Math.PI / 2; // run the planks along local z
      d.position.set(0, -.2, -(i + .5) * seg); g.add(d);
    }
    const tower = PH.modelClone('gazebo', { height: 3.8 }); tower.position.set(0, .2, -n * seg - 1.6); g.add(tower);
    const p = ctx.geo(lat, lon, 0); g.position.set(p.x, 0, p.z);
    g.rotation.y = -hd; // local -z points along the compass heading (0 = north, 90 = east)
    return g;
  });

  // { area, count, minM, maxM, scale } thatched huts (Ifugao)
  def('huts', ['hut'], (spec, ctx) =>
    PH.modelInstances('hut', scatterPoints(ctx, spec.area, spec.count || 20, spec.minM ?? 0, spec.maxM ?? 9000, .2), { height: 2.6 * (spec.scale || 1) }));

  // { at, heading, count, spacingM, style } houses facing each other along a street, or { area, count, style } scattered
  // style 'stone' = Ivatan-style stone houses (Batanes); otherwise two-storey town houses (Vigan)
  def('houses', ['townhouse', 'stonehouse'], (spec, ctx) => {
    const name = spec.style === 'stone' ? 'stonehouse' : 'townhouse', fit = { height: (spec.style === 'stone' ? 1.6 : 2.2) * (spec.scale || 1) };
    let pts;
    if (spec.at) {
      const hd = deg(spec.heading || 0), n = spec.count || 16, gap = (spec.spacingM || 60) / 111320;
      pts = [];
      for (let i = 0; i < n; i++) {
        const along = (Math.floor(i / 2) - n / 4) * gap, side = (i % 2 ? 1 : -1) * gap * 1.2; // two facing rows with a street between
        const lat = spec.at[0] + Math.cos(hd) * along - Math.sin(hd) * side;
        const lon = spec.at[1] + (Math.sin(hd) * along + Math.cos(hd) * side) / Math.cos(spec.at[0] * Math.PI / 180);
        pts.push({ pos: on(ctx, lat, lon), yaw: -hd + (i % 2 ? -Math.PI / 2 : Math.PI / 2) });
      }
    } else pts = scatterPoints(ctx, spec.area, spec.count || 20, 1, spec.maxM ?? 400, .2);
    return PH.modelInstances(name, pts, fit);
  });

  // { at, heading, scale } a horse-drawn kalesa
  def('kalesa', ['horse', 'cart'], (spec, ctx) => {
    const g = new THREE.Group(), k = spec.scale || 1;
    const horse = PH.modelClone('horse', { height: 1.3 * k }); horse.position.z = 1.1 * k;
    const cart = PH.modelClone('cart', { length: 1.7 * k });
    const sz = new THREE.Box3().setFromObject(cart).getSize(V3());
    if (sz.x > sz.z) cart.rotation.y = Math.PI / 2;
    cart.position.z = -.6 * k;
    g.add(horse, cart);
    g.position.copy(on(ctx, spec.at[0], spec.at[1], .05)); g.rotation.y = -deg(spec.heading || 0) + Math.PI;
    return g;
  });

  // { at, scale } open pavilion standing in for the kiosk of Magellan's Cross
  def('kiosk', ['gazebo'], (spec, ctx) => {
    const g = PH.modelClone('gazebo', { height: 4 * (spec.scale || 1) });
    g.position.copy(on(ctx, spec.at[0], spec.at[1]));
    return g;
  });

  // { at, count, spreadM, scale } whale sharks circling just under the surface (a recoloured shark model)
  def('whaleShark', ['shark'], (spec, ctx) => {
    const group = new THREE.Group(), items = [];
    for (const s of waterSpots(spec, ctx, spec.count || 3)) {
      const f = PH.modelClone('shark', { length: 6 * (spec.scale || 1) }, '#53687a');
      const p = ctx.geo(s.lat, s.lon, 0);
      f.userData = { cx: p.x, cz: p.z, r: 3 + ctx.rnd() * 4, a: ctx.rnd() * 6.28, s: (.08 + ctx.rnd() * .05) * (ctx.rnd() < .5 ? 1 : -1) };
      f.position.set(p.x, -.9 * (spec.scale || 1), p.z);
      group.add(f); items.push(f);
    }
    group.userData.tick = (t, dt, night, reduce) => {
      if (reduce) return;
      for (const f of items) {
        const u = f.userData; u.a += u.s * dt;
        f.position.x = u.cx + Math.cos(u.a) * u.r; f.position.z = u.cz + Math.sin(u.a) * u.r;
        f.rotation.y = -u.a + (u.s > 0 ? 0 : Math.PI); // nose along the direction of travel
      }
    };
    return group;
  });

  // { at, scale } lighthouse whose lamp glows after dark (Basco, Naidi Hills)
  def('lighthouse', ['lighthouse'], (spec, ctx) => {
    const k = spec.scale || 1, h = 7.5 * k, g = new THREE.Group();
    g.add(PH.modelClone('lighthouse', { height: h }));
    const lampMat = new THREE.PointsMaterial({ size: 9, map: ctx.glow, color: 0xffd98a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    g.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, h * .86, 0], 3)), lampMat));
    g.position.copy(on(ctx, spec.at[0], spec.at[1], .1));
    g.userData.tick = (t, dt, night) => { lampMat.opacity = night * (.75 + .25 * Math.sin(t * 2)); };
    return g;
  });

  // { at, heading, scale } the Philippine tarsier (no free tarsier model exists; a small-primate model stands in)
  def('tarsier', ['monkey'], (spec, ctx) => {
    const g = PH.modelClone('monkey', { height: 4.5 * (spec.scale || 1) }); g.name = 'tarsier';
    g.position.copy(on(ctx, spec.at[0], spec.at[1], .1)); g.rotation.y = -deg(spec.heading || 0) + Math.PI;
    return g;
  });

  // { area, count, maxM } cattle grazing on open pasture (Batanes)
  def('cattle', ['cow'], (spec, ctx) =>
    PH.modelInstances('cow', scatterPoints(ctx, spec.area, spec.count || 20, 5, spec.maxM ?? 400, .2), { height: 1 }));

  PH.waveY = waveY;
  PH.loadGLB = loadGLB;
  PH.lambert = lambert;
})();
