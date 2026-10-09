import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(app, '../..');
const manifest = JSON.parse(await readFile(path.join(repo, 'docs/product/workshop-game-stations/manifest.json'), 'utf8'));
const buffer = await readFile(path.join(app, 'public', manifest.model.url));
const hash = value => createHash('sha256').update(value).digest('hex');
assert.equal(buffer.toString('ascii', 0, 4), 'glTF');
assert.equal(buffer.readUInt32LE(4), 2); assert.equal(buffer.readUInt32LE(8), buffer.length);
assert.equal(buffer.readUInt32LE(16), 0x4e4f534a);
const gltf = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString('utf8'));
assert.equal(hash(buffer), manifest.stats.sha256); assert.equal(buffer.length, manifest.stats.bytes);
for (const resource of [...gltf.images, ...gltf.buffers]) assert.ok(!resource.uri, 'embedded resources only');
let triangles = 0, primitives = 0;
for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
  assert.equal(primitive.mode ?? 4, 4);
  for (const name of ['POSITION', 'NORMAL', 'TEXCOORD_0']) assert.ok(primitive.attributes[name] !== undefined, name);
  const positions = gltf.accessors[primitive.attributes.POSITION];
  assert.ok([...positions.min, ...positions.max].every(Number.isFinite));
  triangles += gltf.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3; primitives++;
}
assert.equal(triangles, manifest.stats.triangles); assert.equal(primitives, manifest.stats.primitives);
assert.ok(buffer.length <= manifest.budget.kitBytes && triangles < manifest.budget.kitTrianglesExclusive && primitives <= manifest.budget.kitPrimitives);
assert.ok(gltf.materials.every(material => (material.alphaMode ?? 'OPAQUE') === 'OPAQUE'));
assert.equal(gltf.materials.filter(material => material.normalTexture).length, manifest.stats.normalMappedMaterials);
for (const id of ['technologies', 'trajectory', 'contact']) {
  assert.equal(gltf.nodes.filter(node => node.name === `stationhit__${id}` && node.mesh !== undefined).length, 1, id);
  assert.equal(manifest.stations[id].position[1], 1.65);
}
let coreBytes = buffer.length;
for (const url of ['workshop-shell-v2.glb', 'workshop-door-v1.glb']) coreBytes += (await readFile(path.join(app, 'public/models/workshop-game', url))).length;
assert.equal(coreBytes, manifest.totalEssentialBytes); assert.ok(coreBytes <= manifest.budget.totalEssentialBytes);
for (const [key, filename] of Object.entries({ generator: manifest.generator, blend: manifest.source })) assert.equal(hash(await readFile(path.join(repo, filename))), manifest.sha256[key], filename);
for (const [filename, expected] of Object.entries(manifest.preservedPhase72And73Sha256)) assert.equal(hash(await readFile(path.join(repo, filename))), expected, filename);
console.log(JSON.stringify({ passed: true, kitBytes: buffer.length, coreBytes, triangles, primitives, previousHashesPreserved: Object.keys(manifest.preservedPhase72And73Sha256).length }, null, 2));
