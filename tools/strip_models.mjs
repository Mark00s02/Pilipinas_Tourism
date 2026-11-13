// Drop animations and skins from optimized models (the site shows them static), then prune what is left unused.
// Run after `gltf-transform optimize`; needs the libraries installed in tools/.cache/gt:
//   cd tools/.cache/gt && npm install @gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4
// node tools/strip_models.mjs tools/.cache/models/*.opt.glb   (writes <name>.final.glb beside each)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '.cache', 'gt', 'package.json'));
const { NodeIO } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { prune, dedup } = require('@gltf-transform/functions');

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const file of process.argv.slice(2)) {
  const doc = await io.read(file);
  const root = doc.getRoot();
  root.listAnimations().forEach(a => { a.listSamplers().forEach(s => s.dispose()); a.listChannels().forEach(c => c.dispose()); a.dispose(); });
  // Skins stay: rigged meshes are stored in bind space and only look right through their skeleton.
  // assets/js/models.js bakes that rest pose into static geometry when the model loads.
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    prim.listTargets().forEach(t => { prim.removeTarget(t); t.dispose(); }); // morph targets (face shapes) are never posed here
  }
  for (const mesh of root.listMeshes()) mesh.setWeights([]);
  // Keyframe data from the removed animations can linger as accessors only the root still lists.
  root.listAccessors().forEach(a => { if (a.listParents().every(p => p === root)) a.dispose(); });
  await doc.transform(prune(), dedup());
  const out = file.replace(/\.opt\.glb$/, '.final.glb');
  await io.write(out, doc);
  console.log(out);
}
