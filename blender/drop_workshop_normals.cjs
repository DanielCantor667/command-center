#!/usr/bin/env node
'use strict';

// P.2 (specs/workshop-performance.md): the low tier draws the room unlit (MeshBasicMaterial in lab-scene.tsx), so its
// normals are never read. Invoked like resize_workshop_textures.cjs, through the pinned glTF Transform CLI.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const [input, output] = process.argv.slice(2);
if (!input || !output || path.resolve(input) === path.resolve(output)) throw new Error('Usage: drop_workshop_normals.cjs INPUT.glb OUTPUT.glb');
const executable = process.env.PATH.split(path.delimiter).map(dir => path.join(dir, 'gltf-transform')).find(file => fs.existsSync(file));
if (!executable) throw new Error('Run via npx --package=@gltf-transform/cli@4.5.1 -- node ...');
const fromCli = createRequire(fs.realpathSync(executable));
const { NodeIO } = fromCli('@gltf-transform/core');
const { ALL_EXTENSIONS } = fromCli('@gltf-transform/extensions');
const { prune } = fromCli('@gltf-transform/functions');

(async () => {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(input);
  let dropped = 0;
  for (const mesh of doc.getRoot().listMeshes()) for (const primitive of mesh.listPrimitives()) {
    if (primitive.getAttribute('NORMAL')) { primitive.setAttribute('NORMAL', null); dropped++; }
  }
  await doc.transform(prune());
  await io.write(output, doc);
  console.log(`Normals dropped from ${dropped} primitives.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
