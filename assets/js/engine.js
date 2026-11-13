/* Shared 3D engine: one renderer for the session, one destination world at a time.
   PH.Engine.create(canvas) -> engine | null (no WebGL)
   engine.load(desc) -> Promise<boolean> (false if superseded by unload/load), engine.unload(), engine.setProgress(p), engine.info() */
(function () {
  'use strict';
  const PH = (window.PH = window.PH || {});
  const { clamp, smooth, lerp, decodeTerrain, geoToGrid, applyTouchups, mulberry32 } = PH_CORE;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OVERVIEW = /[?&]overview=1(&|$)/.test(location.search); // dev view: straight down over the whole area, no haze
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const WORLD = 380; // world units across a destination's box
  const FOG_FAR = 900; // far enough to see the real surroundings fade into haze
  const C = h => new THREE.Color(h);
  const UW_FOG = new THREE.Color('#0d5560'), UW_LIGHT = new THREE.Color('#8fe0dc');

  function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }

  const DEFAULT_PAL = {
    top: ['#11162c', '#03050c'], mid: ['#b4552f', '#0d1626'], bot: ['#1c1418', '#03060a'],
    sun: ['#ffa04f', '#e9dfc8'], fog: ['#3b2a32', '#060b14'], water: ['#0c2a35', '#071520'],
    hemiSky: ['#e0a080', '#33415e'], hemiGround: ['#14200f', '#04070a'],
  };
  const DEFAULT_COLORS = {
    greens: ['#142e1b', '#1d4223', '#284f27', '#33592b'], sand: '#a8905e', rock: '#5a5048', summit: '#8d856c',
    seabed: '#13231f', reef: '#2d7a70', cone: '#7d6a3e', terrace: '#7c9a3a',
  };

  // Models a destination's landmarks need, from each builder's .models list (assets/js/landmarks.js).
  const modelsFor = desc => (desc.landmarks || []).flatMap(s => (PH.landmarks[s.kind] && PH.landmarks[s.kind].models) || []);
  PH.modelsFor = modelsFor;

  function create(canvas) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !COARSE, powerPreference: 'high-performance' });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, COARSE ? 1.25 : 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const camera = new THREE.PerspectiveCamera(42, 1, .5, 4000);
    const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < .8 ? 58 : 42; camera.updateProjectionMatrix(); };
    addEventListener('resize', resize); resize();
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });

    let world = null, token = 0, target = 0, onFirstFrame = null;
    const clock = new THREE.Clock();
    const tPos = new THREE.Vector3(), tLook = new THREE.Vector3(), eagleCam = new THREE.Vector3(), eagleLook = new THREE.Vector3();
    const EAGLE_OFFSET = new THREE.Vector3(10, 2, 34), EAGLE_AIM = new THREE.Vector3(0, -9, 0);

    function frame() {
      requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
      if (!world) return;
      const W = world, K = W.keys;
      W.sp = lerp(W.sp, target, REDUCE ? 1 : 1 - Math.pow(.02, dt));
      const i = Math.min(Math.floor(W.sp), K.length - 2), f = smooth(0, 1, W.sp - i);
      tPos.lerpVectors(K[i][0], K[i + 1][0], f); tLook.lerpVectors(K[i][1], K[i + 1][1], f);
      // A section with follow:'eagle' rides alongside the bird, aiming below it so it sits high in the frame.
      let ew = 0;
      if (W.follow && W.followKey >= 0) {
        ew = 1 - smooth(0, .7, Math.abs(W.sp - W.followKey));
        if (ew > 0) {
          tPos.lerp(eagleCam.copy(W.follow.position).add(EAGLE_OFFSET), ew);
          tLook.lerp(eagleLook.copy(W.follow.position).add(EAGLE_AIM), ew);
        }
      }
      mouse.sx = lerp(mouse.sx, mouse.x, .05); mouse.sy = lerp(mouse.sy, mouse.y, .05);
      if (!REDUCE) { tPos.x += mouse.sx * 4; tPos.y -= mouse.sy * 2; tPos.y += Math.sin(t * .3) * .3; }
      const k = REDUCE || W.fresh ? 1 : 1 - Math.pow(lerp(.006, .0002, ew), dt); // frame-rate independent; tighter while tracking
      W.fresh = false;
      W.camPos.lerp(tPos, k); W.camLook.lerp(tLook, k);
      camera.position.copy(W.camPos); camera.lookAt(W.camLook);
      if (OVERVIEW) { camera.position.set(0, 1500, .01); camera.lookAt(0, 0, 0); }

      const night = smooth(W.night[0], W.night[1], W.sp), P = W.PAL;
      W.skyU.uTop.value.lerpColors(P.top[0], P.top[1], night);
      W.skyU.uMid.value.lerpColors(P.mid[0], P.mid[1], night);
      W.skyU.uBot.value.lerpColors(P.bot[0], P.bot[1], night);
      W.skyU.uSun.value.lerpColors(P.sun[0], P.sun[1], night);
      W.skyU.uNight.value = night;
      W.scene.fog.color.lerpColors(P.fog[0], P.fog[1], night);
      W.hemi.color.lerpColors(P.hemiSky[0], P.hemiSky[1], night);
      W.hemi.groundColor.lerpColors(P.hemiGround[0], P.hemiGround[1], night);
      W.hemi.intensity = lerp(.62, .35, night);
      W.sunLight.intensity = lerp(1.2, .18, night);
      W.waterMat.color.lerpColors(P.water[0], P.water[1], night);
      W.stars.material.opacity = night * .9;
      W.sky.position.copy(camera.position); W.stars.position.copy(camera.position);
      // Below the surface: blue-green haze closes in, the sky goes away and the light turns aquamarine.
      const uw = smooth(.1, -1.1, camera.position.y);
      if (uw > 0) {
        W.scene.fog.color.lerp(UW_FOG, uw);
        W.hemi.color.lerp(UW_LIGHT, uw);
        W.sunLight.intensity *= 1 - uw * .45;
      }
      W.scene.fog.near = lerp(70, 1, uw); W.scene.fog.far = OVERVIEW ? 1e6 : lerp(FOG_FAR, 42, uw);
      W.sky.visible = W.stars.visible = uw < .5;
      W.scene.background = uw >= .5 ? W.scene.fog.color : null;
      if (!REDUCE) W.waterU.uTime.value = t;
      for (const fn of W.ticks) fn(t, dt, night, REDUCE);

      renderer.render(W.scene, camera);
      if (onFirstFrame) { const cb = onFirstFrame; onFirstFrame = null; cb(true); }
    }
    requestAnimationFrame(frame);

    function dispose(scene) {
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of mats) { for (const v of Object.values(m)) if (v && v.isTexture) v.dispose(); m.dispose(); }
      });
    }

    return {
      renderer,
      load(desc) {
        const my = ++token;
        if (world) { dispose(world.scene); world = null; }
        if (onFirstFrame) { onFirstFrame(false); onFirstFrame = null; }
        return new Promise((resolve, reject) => setTimeout(async () => {
          if (my !== token) return resolve(false);
          // Fetch this destination's 3D models first; a model that fails just leaves its landmark out.
          // Fetch this destination's 3D models and satellite imagery first; anything that fails is simply left out.
          const [, sat] = await Promise.all([
            PH.loadModels(modelsFor(desc)).catch(e => console.warn('some 3D models did not load', e)),
            PH.loadSatellite(desc.id).catch(e => { console.warn('no satellite imagery; using plain colours', e); return null; }),
          ]);
          if (my !== token) return resolve(false);
          try { world = buildWorld(desc, sat && sat.inner, renderer, sat && sat.outer); } catch (e) { world = null; return reject(e); } // caller hides the loader; the text page stays usable
          world.sp = target; world.fresh = true;
          onFirstFrame = resolve;
        }, 30));
      },
      unload() {
        token++;
        if (world) { dispose(world.scene); world = null; }
        if (onFirstFrame) { onFirstFrame(false); onFirstFrame = null; }
        renderer.clear();
      },
      setProgress(p) { target = p; },
      info: () => ({ geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }),
      get world() { return world; },
    };
  }

  function buildWorld(desc, satImage, renderer, outerSat) {
    const T = desc.terrain || {}, entry = window.PH_TERRAIN && window.PH_TERRAIN[desc.id];
    if (!entry) throw new Error(`no baked terrain for ${desc.id}`);
    const grid = applyTouchups(decodeTerrain(entry), T.touchups, desc.seed || 1);
    const { w, h, data } = grid, spanM = grid.cellM * w, U = WORLD / spanM, V = T.vScale || 2.5;
    const worldY = m => (m > 0 ? .9 + m * U * V : -.5 - Math.min(7, -m * U * V * 3));
    const heightM = (gx, gy) => {
      gx = clamp(gx, 0, w - 1); gy = clamp(gy, 0, h - 1);
      const x0 = Math.floor(gx), y0 = Math.floor(gy), x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1), fx = gx - x0, fy = gy - y0;
      const a = data[y0 * w + x0], b = data[y0 * w + x1], c = data[y1 * w + x0], d = data[y1 * w + x1];
      return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
    };
    const geo = (lat, lon, altM) => {
      const { gx, gy } = geoToGrid(grid, lat, lon);
      return new THREE.Vector3((gx / (w - 1) - .5) * WORLD, altM == null ? worldY(heightM(gx, gy)) : worldY(altM), (gy / (h - 1) - .5) * WORLD);
    };
    const rnd = mulberry32((desc.seed || 1) * 7919);
    const [S, Wb, N, E] = grid.bbox;
    const sample = (area, count, minM, maxM) => {
      const [s, wv, n, e] = area || [S, Wb, N, E], out = [];
      for (let i = 0; i < count * 30 && out.length < count; i++) {
        const lat = lerp(s, n, rnd()), lon = lerp(wv, e, rnd()), g = geoToGrid(grid, lat, lon), hm = heightM(g.gx, g.gy);
        if (hm > minM && hm < maxM) out.push({ lat, lon, h: hm });
      }
      return out;
    };

    const scene = new THREE.Scene();
    const PAL = {};
    for (const [k, v] of Object.entries(Object.assign({}, DEFAULT_PAL, desc.palette))) PAL[k] = v.map(C);
    const SUN_DIR = new THREE.Vector3(...(desc.sunDir || [-.42, .1, -1])).normalize();

    // Sky dome
    const skyU = { uTop: { value: PAL.top[0].clone() }, uMid: { value: PAL.mid[0].clone() }, uBot: { value: PAL.bot[0].clone() }, uSunDir: { value: SUN_DIR }, uSun: { value: PAL.sun[0].clone() }, uNight: { value: 0 } };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 uTop,uMid,uBot,uSun,uSunDir; uniform float uNight; varying vec3 vDir;
        void main(){ vec3 d = normalize(vDir); float h = d.y;
          vec3 c = mix(uMid, uTop, smoothstep(-.02,.5,h)); c = mix(c, uBot, smoothstep(0.,-.25,h));
          float s = max(dot(d, normalize(uSunDir)), 0.);
          c += uSun * (pow(s, 10.)*.45*(1.-uNight*.6) + pow(s, 120.)*.5);
          float disc = smoothstep(.9984, .999, s);
          vec3 discCol = mix(uSun*1.3, uSun*.92, uNight);
          c = mix(c, discCol, disc);
          gl_FragColor = vec4(c, 1.); }`,
    }));
    sky.renderOrder = -1;
    scene.add(sky);

    // Stars
    const starGeo = new THREE.BufferGeometry(), sp = [];
    for (let i = 0; i < 1400; i++) { const t = rnd() * Math.PI * 2, y = .08 + rnd() * .92, r = Math.sqrt(1 - y * y); sp.push(Math.cos(t) * r * 800, y * 800, Math.sin(t) * r * 800); }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    scene.add(stars);

    scene.fog = new THREE.Fog(PAL.fog[0].clone(), 70, FOG_FAR);
    const hemi = new THREE.HemisphereLight(PAL.hemiSky[0].clone(), PAL.hemiGround[0].clone(), .85);
    const sunLight = new THREE.DirectionalLight(0xffb27a, 1.5);
    sunLight.position.copy(SUN_DIR).multiplyScalar(200);
    scene.add(hemi, sunLight);

    // Terrain from the baked grid (flat-shaded, coloured per face by real metres and slope)
    const indexed = new THREE.PlaneGeometry(WORLD, WORLD, w - 1, h - 1);
    indexed.rotateX(-Math.PI / 2); // plane row 0 (top) becomes north (-z), matching grid row 0
    const ip = indexed.attributes.position;
    for (let i = 0; i < ip.count; i++) ip.setY(i, worldY(data[i]));
    const terr = indexed.toNonIndexed(), idx = indexed.index.array;
    const metres = new Float32Array(idx.length), marked = new Uint8Array(idx.length); // per non-indexed vertex, for colouring
    for (let i = 0; i < idx.length; i++) { metres[i] = data[idx[i]]; if (grid.mark) marked[i] = grid.mark[idx[i]]; }
    indexed.dispose();
    terr.computeVertexNormals();
    const pos = terr.attributes.position, nrm = terr.attributes.normal;
    const COL = Object.assign({}, DEFAULT_COLORS, T.colors);
    const G = COL.greens.map(C), SAND = C(COL.sand), ROCK = C(COL.rock), SUMMIT = C(COL.summit), SEABED = C(COL.seabed), REEF = C(COL.reef), CONE = C(COL.cone), TERRACE = C(COL.terrace);
    const beachM = T.beachM ?? 6, rockM = T.rockM ?? 1800, summitM = T.summitM ?? Infinity, steep = T.steep ?? .62;
    const cols = new Float32Array(pos.count * 3), tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i += 3) {
      const m = (metres[i] + metres[i + 1] + metres[i + 2]) / 3, x = pos.getX(i), z = pos.getZ(i), ny = nrm.getY(i);
      if (m <= 0) tmp.copy(m > -12 ? REEF : SEABED);
      else if (marked[i] === 1 && marked[i + 1] === 1 || marked[i] === 1 && marked[i + 2] === 1 || marked[i + 1] === 1 && marked[i + 2] === 1) tmp.copy(CONE).offsetHSL(0, 0, (hash(z, x) - .5) * .08);
      else if (marked[i] === 2 && ny > .55) tmp.copy(TERRACE).offsetHSL(0, 0, (hash(z, x) - .5) * .1); // flat terrace treads; risers stay as land
      else if (m < beachM && ny > .8) tmp.copy(SAND);
      else if (m > summitM) tmp.copy(SUMMIT);
      else if (m > rockM || ny < steep) tmp.copy(ROCK).lerp(G[0], clamp((rockM - m) / rockM, 0, .5));
      else tmp.copy(G[Math.floor(hash(Math.floor(x * .15), Math.floor(z * .15)) * 4) % 4]);
      tmp.offsetHSL(0, 0, (hash(x, z) - .5) * .04);
      for (let k = 0; k < 3; k++) tmp.toArray(cols, (i + k) * 3);
    }
    terr.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    // Real satellite imagery draped over the real heights when we have it; the height/slope colours otherwise.
    let terrMat;
    if (satImage) {
      const tex = new THREE.Texture(satImage);
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); tex.needsUpdate = true;
      terrMat = new THREE.MeshLambertMaterial({ map: tex, flatShading: true, color: new THREE.Color(1.3, 1.3, 1.25) }); // >1 lifts the photo under dusk light
    } else terrMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    scene.add(new THREE.Mesh(terr, terrMat));

    // The real surroundings, coarse and six times wider, so mainland places do not end in a fake coastline.
    // Where the detailed square sits, the ring tucks underneath: just below it near the seam, far below inside.
    const outerEntry = window.PH_TERRAIN[`${desc.id}:outer`];
    if (outerEntry) {
      const og = decodeTerrain(outerEntry), OW = WORLD * (og.cellM * og.w) / spanM, half = WORLD / 2, step = OW / (og.w - 1);
      const ring = new THREE.PlaneGeometry(OW, OW, og.w - 1, og.h - 1);
      ring.rotateX(-Math.PI / 2);
      const rp = ring.attributes.position;
      for (let i = 0; i < rp.count; i++) {
        const x = rp.getX(i), z = rp.getZ(i), inside = Math.max(Math.abs(x), Math.abs(z)) < half;
        let y = worldY(og.data[i]);
        if (inside) {
          const nearSeam = Math.max(Math.abs(x), Math.abs(z)) > half - step * 1.5;
          y = nearSeam ? worldY(heightM((x / WORLD + .5) * (w - 1), (z / WORLD + .5) * (h - 1))) - .8 : -14;
        }
        rp.setY(i, y);
      }
      const ringFlat = ring.toNonIndexed(); ring.dispose();
      ringFlat.computeVertexNormals();
      let ringMat;
      if (satImage && outerSat) {
        const t2 = new THREE.Texture(outerSat); t2.encoding = THREE.sRGBEncoding; t2.needsUpdate = true;
        ringMat = new THREE.MeshLambertMaterial({ map: t2, flatShading: true, color: new THREE.Color(1.3, 1.3, 1.25) });
      } else ringMat = new THREE.MeshLambertMaterial({ color: COL.greens[1], flatShading: true });
      scene.add(new THREE.Mesh(ringFlat, ringMat));
    }

    // Water with GPU waves (flat shading derives normals from the displaced surface)
    const waterU = { uTime: { value: 0 } };
    // 1700 reaches the haze on every side; a 2356-wide plane drew a translucent band across the sky (seen on Dabaw), so stay below that.
    const waterGeo = new THREE.PlaneGeometry(1700, 1700, 200, 200); waterGeo.rotateX(-Math.PI / 2);
    // Thinner over satellite imagery so real reefs and shallows show; double-sided so dives see the surface from below.
    const waterMat = new THREE.MeshPhongMaterial({ color: PAL.water[0].clone(), specular: 0xffc590, shininess: 70, flatShading: true, transparent: true, opacity: T.waterOpacity ?? (satImage ? .62 : .86), side: THREE.DoubleSide });
    waterMat.onBeforeCompile = sh => {
      sh.uniforms.uTime = waterU.uTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.y += sin(position.x*.09 + uTime*.9)*.32 + cos(position.z*.11 + uTime*.7)*.28 + sin((position.x+position.z)*.23 + uTime*1.6)*.1;`);
    };
    if (T.water !== false) scene.add(new THREE.Mesh(waterGeo, waterMat)); // inland places (Banaue) have no sea

    // Glow sprite shared by light-type landmarks
    const glow = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
    })();

    const heightAt = (lat, lon) => { const g = geoToGrid(grid, lat, lon); return heightM(g.gx, g.gy); };
    const ctx = { geo, sample, heightAt, rnd, glow, unitsPerM: U, vScale: V, worldY, bbox: grid.bbox };
    const ticks = [];
    let follow = null;
    for (const spec of desc.landmarks || []) {
      const build = PH.landmarks[spec.kind];
      if (!build) { console.warn(`unknown landmark: ${spec.kind}`); continue; }
      let obj;
      try { obj = build(spec, ctx); } catch (e) { console.warn(`landmark ${spec.kind} skipped`, e); continue; }
      scene.add(obj);
      if (obj.userData.tick) ticks.push(obj.userData.tick);
      if (obj.userData.follow) follow = obj;
    }

    const cams = [desc.hero.cam, ...desc.sections.map(s => s.cam), desc.finale.cam];
    // Keep every camera clear of the ground: real terrain is easy to misjudge from coordinates alone.
    const clear = v => { const g = geoToGrid(grid, ...[(.5 - v.z / WORLD) * (N - S) + S, (v.x / WORLD + .5) * (E - Wb) + Wb]); v.y = Math.max(v.y, worldY(heightM(g.gx, g.gy)) + 2.5); return v; };
    const keys = cams.map(c => [c.pos[2] < 0 ? geo(...c.pos) : clear(geo(...c.pos)), geo(...c.look)]); // negative altitude = a deliberate dive
    const followKey = desc.sections.findIndex(s => s.follow === 'eagle');
    const K = keys.length;
    return {
      id: desc.id, scene, sky, skyU, stars, PAL, hemi, sunLight, waterMat, waterU, ticks, keys, geo,
      follow, followKey: followKey < 0 ? -1 : followKey + 1,
      night: desc.night || [K - 2.2, K - 1], // dusk lasts until the closing section unless a page asks otherwise
      camPos: keys[0][0].clone(), camLook: keys[0][1].clone(), sp: 0,
    };
  }

  PH.Engine = { create };
})();
