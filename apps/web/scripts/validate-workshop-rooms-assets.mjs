import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(app, '../..');
const manifest = JSON.parse(await readFile(path.join(repo, 'docs/product/workshop-game-rooms/manifest.json'), 'utf8'));
const summaries = [];
for (const [id, definition] of [['shell', manifest.shell], ...Object.entries(manifest.rooms)]) {
  const buffer = await readFile(path.join(app, 'public', definition.url));
  assert.equal(buffer.toString('ascii', 0, 4), 'glTF'); assert.equal(buffer.readUInt32LE(4), 2); assert.equal(buffer.readUInt32LE(8), buffer.length);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a);
  const json = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString('utf8'));
  const expected = manifest.stats[id];
  assert.equal(createHash('sha256').update(buffer).digest('hex'), expected.sha256, `${id}: immutable export hash`);
  assert.equal(buffer.length, expected.bytes);
  for (const asset of [...(json.images ?? []), ...(json.buffers ?? [])]) assert.ok(!asset.uri, `${id}: no external resources`);
  let triangles = 0, primitives = 0;
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) {
    assert.equal(primitive.mode ?? 4, 4); assert.ok(primitive.attributes.TEXCOORD_0 !== undefined, `${id}: retained UV`);
    triangles += json.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3; primitives++;
  }
  assert.equal(triangles, expected.triangles); assert.equal(primitives, expected.primitives);
  assert.equal(json.materials.filter(material => material.normalTexture).length, expected.normalMappedMaterials, `${id}: retained normal maps`);
  const names = json.nodes.filter(node => node.mesh !== undefined).map(node => node.name);
  if (id === 'shell') {
    assert.ok(triangles < 80000);
    for (const room of Object.keys(manifest.rooms)) assert.ok(names.includes(`roomgate__${room}`), `${room}: separate gate`);
  } else {
    assert.ok(buffer.length < 2000000 && triangles < 25000 && primitives <= 12, `${id}: room budgets`);
    assert.ok(names.every(name => name.startsWith(`room__${id}__`)), `${id}: isolated meshes`);
    assert.equal(manifest.rooms[id].position[1], 1.65);
  }
  summaries.push({ id, bytes: buffer.length, triangles, primitives, embeddedImages: json.images.length });
}
const door = await readFile(path.join(app, 'public', manifest.door.url));
assert.equal(createHash('sha256').update(door).digest('hex'), manifest.doorStats.sha256);
assert.ok(manifest.stats.shell.bytes + door.length <= 5000000);
for (const [key, filename] of Object.entries({ generator: manifest.generator, blend: manifest.source })) {
  const buffer = await readFile(path.join(repo, filename));
  assert.equal(createHash('sha256').update(buffer).digest('hex'), manifest.sha256[key]);
}
const preserved = { generator: 'blender/generate_workshop_game.py', blend: 'blender/scenes/workshop-game-v1.blend', shell: 'apps/web/public/models/workshop-game/workshop-shell-v1.glb', door: 'apps/web/public/models/workshop-game/workshop-door-v1.glb' };
for (const [key, filename] of Object.entries(preserved)) {
  const buffer = await readFile(path.join(repo, filename));
  assert.equal(createHash('sha256').update(buffer).digest('hex'), manifest.preservedPhase72Sha256[key], `${key}: Phase7.2 preserved`);
}
console.log(JSON.stringify({ passed: true, preservedPhase72: true, coreBytes: manifest.stats.shell.bytes + door.length, assets: summaries }, null, 2));
