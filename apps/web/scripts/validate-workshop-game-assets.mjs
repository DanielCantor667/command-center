#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['workshop-shell-v1.glb', 'workshop-door-v1.glb'];
const results = [];
for (const filename of files) {
  const filepath = path.join(app, 'public/models/workshop-game', filename);
  const buffer = await readFile(filepath);
  assert.equal(buffer.toString('ascii', 0, 4), 'glTF', `${filename}: GLB magic`);
  assert.equal(buffer.readUInt32LE(4), 2, `${filename}: version`);
  assert.equal(buffer.readUInt32LE(8), buffer.length, `${filename}: declared bytes`);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a, `${filename}: JSON chunk`);
  const json = JSON.parse(buffer.toString('utf8', 20, 20 + buffer.readUInt32LE(12)).trim());
  assert.ok(json.meshes?.length && json.materials?.length, `${filename}: real geometry/materials`);
  for (const asset of [...(json.buffers ?? []), ...(json.images ?? [])]) {
    assert.ok(!asset.uri || asset.uri.startsWith('data:'), `${filename}: unexpected external asset ${asset.uri}`);
  }
  let triangles = 0; let primitives = 0;
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) {
    assert.equal(primitive.mode ?? 4, 4, `${filename}: triangle topology`);
    const accessor = json.accessors[primitive.indices ?? primitive.attributes.POSITION];
    assert.ok(accessor?.count > 0, `${filename}: primitive data`);
    triangles += accessor.count / 3;
    primitives += 1;
  }
  assert.ok(triangles > 0 && triangles <= 80_000, `${filename}: triangle budget ${triangles}`);
  if (filename.includes('door')) assert.ok(buffer.length < 100_000, 'Door must stay below 100 KB');
  results.push({ filename, bytes: buffer.length, triangles, primitives, materials: json.materials.length, embeddedImages: json.images?.length ?? 0, normalMappedMaterials: json.materials.filter(material => material.normalTexture).length });
}
const totalBytes = results.reduce((sum, asset) => sum + asset.bytes, 0);
assert.ok(totalBytes <= 5_000_000, `Mobile essential asset budget: ${totalBytes} bytes`);
assert.ok(results[0].embeddedImages > 0, 'Workshop materials must retain their authored textures in web export');
assert.ok(results[0].normalMappedMaterials >= 2, 'Concrete and oak must retain their authored normal maps');
await stat(path.resolve(app, '../../blender/scenes/workshop-game-v1.blend'));
console.log(JSON.stringify({ passed: true, totalBytes, assets: results }, null, 2));
