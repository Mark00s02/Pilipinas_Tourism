/* Downloaded 3D models (Poly Pizza, CC0 / CC-BY), loaded on demand.
   Each assets/models/<name>.glb.js is a classic script holding the GLB as base64, so it also works from file://.
   PH.loadModels(names) -> Promise   load + parse once; templates are normalised: centred, standing on y = 0
   PH.modelClone(name, fit, tint)    a placeable copy; fit = { height } or { length } (largest horizontal extent), world units
   PH.modelInstances(name, placements, fit, tint)   many static copies as InstancedMeshes; placements = [{ pos, yaw, scale? }] */
(function () {
  'use strict';
  const PH = (window.PH = window.PH || {});
  const pending = {}, templates = {};

  function addScript(name) {
    if (window.PH_MODELS && window.PH_MODELS[name]) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `assets/models/${name}.glb.js`;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`model ${name} failed to load`));
      document.head.appendChild(s);
    });
  }

  function parse(name) {
    const bytes = Uint8Array.from(atob(window.PH_MODELS[name]), c => c.charCodeAt(0));
    return new Promise((resolve, reject) => new THREE.GLTFLoader().parse(bytes.buffer, '', g => resolve(g.scene), reject));
  }

  // Rigged meshes only look right through their skeleton; bake the rest pose into plain geometry so they can be
  // instanced and cloned like everything else.
  function bakeSkins(scene) {
    scene.updateMatrixWorld(true);
    const skinned = [];
    scene.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); });
    const v = new THREE.Vector3();
    for (const sm of skinned) {
      sm.skeleton.update();
      const g = sm.geometry.clone(), pos = g.attributes.position, out = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        sm.boneTransform(i, v.fromBufferAttribute(pos, i)); // skinned rest position, already back in mesh space (r149)
        out.set([v.x, v.y, v.z], i * 3);
      }
      g.setAttribute('position', new THREE.BufferAttribute(out, 3));
      g.deleteAttribute('skinIndex'); g.deleteAttribute('skinWeight');
      g.deleteAttribute('normal'); g.deleteAttribute('tangent'); // rebuild as plain floats; the quantized originals do not survive the bake
      g.computeVertexNormals();
      g.computeBoundingBox(); g.computeBoundingSphere(); // the clone carried the bind-space bounds, which made the mesh get culled
      const mesh = new THREE.Mesh(g, sm.material);
      mesh.name = sm.name; mesh.matrix.copy(sm.matrix); mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      sm.parent.add(mesh); sm.parent.remove(sm);
    }
  }

  // Centre on x/z, stand on y = 0, and make materials matte: there is no environment map, so metal reads as black.
  function normalise(scene) {
    bakeSkins(scene);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene), c = box.getCenter(new THREE.Vector3());
    scene.position.set(-c.x, -box.min.y, -c.z);
    const wrap = new THREE.Group();
    wrap.add(scene);
    wrap.updateMatrixWorld(true);
    wrap.userData.size = box.getSize(new THREE.Vector3());
    wrap.traverse(o => {
      if (!o.isMesh) return;
      for (const m of [].concat(o.material)) if ('metalness' in m) { m.metalness = 0; m.roughness = Math.max(m.roughness, .85); }
    });
    return wrap;
  }

  PH.loadModels = names => Promise.all([...new Set(names)].map(n => pending[n] || (pending[n] = addScript(n)
    .then(() => parse(n))
    .then(scene => { templates[n] = normalise(scene); })
    .catch(e => { delete pending[n]; throw e; }))));

  const model = name => {
    if (!templates[name]) throw new Error(`model ${name} is not loaded`);
    return templates[name];
  };
  const scaleFor = (name, fit) => {
    const s = model(name).userData.size;
    return fit.height ? fit.height / s.y : fit.length / Math.max(s.x, s.z);
  };
  const tinted = (material, tint) => [].concat(material).map(m => { const t = m.clone(); t.color.set(tint); return t; });

  PH.modelClone = (name, fit, tint) => {
    const g = model(name).clone(true);
    g.scale.setScalar(scaleFor(name, fit));
    if (tint) g.traverse(o => { if (o.isMesh) { const t = tinted(o.material, tint); o.material = t.length > 1 ? t : t[0]; } });
    return g;
  };

  PH.modelInstances = (name, placements, fit, tint) => {
    const group = new THREE.Group(), t = model(name), base = scaleFor(name, fit);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    t.traverse(o => {
      if (!o.isMesh) return;
      const mats = tint ? tinted(o.material, tint) : [].concat(o.material);
      const im = new THREE.InstancedMesh(o.geometry, mats.length > 1 ? mats : mats[0], Math.max(1, placements.length));
      im.count = placements.length;
      placements.forEach((p, i) => {
        q.setFromAxisAngle(up, p.yaw || 0);
        const k = base * (p.scale || 1);
        im.setMatrixAt(i, m4.compose(p.pos, q, s3.set(k, k, k)).multiply(o.matrixWorld));
      });
      group.add(im);
    });
    return group;
  };
})();
