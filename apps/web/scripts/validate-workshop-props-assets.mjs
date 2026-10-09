#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(app, '../..');
const manifest = JSON.parse(await readFile(path.join(repo, 'docs/product/workshop-game-props/manifest.json'), 'utf8'));
const { budgets } = manifest;
const summaries = [];
let total = 0;
for (const [id, definition] of Object.entries(manifest.props)) {
  const buffer = await readFile(path.join(app, 'public', definition.url));
  assert.equal(buffer.toString('ascii', 0, 4), 'glTF'); assert.equal(buffer.readUInt32LE(4), 2); assert.equal(buffer.readUInt32LE(8), buffer.length);
  assert.equal(createHash('sha256').update(buffer).digest('hex'), definition.sha256, `${id}: export hash`);
  const json = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString('utf8'));
  for (const asset of [...(json.images ?? []), ...(json.buffers ?? [])]) assert.ok(!asset.uri, `${id}: no external resources`);
  let triangles = 0, primitives = 0;
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) {
    assert.equal(primitive.mode ?? 4, 4);
    triangles += json.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3; primitives++;
  }
  assert.equal(triangles, definition.triangles);
  assert.ok(buffer.length <= budgets.propBytes && triangles <= budgets.propTriangles && primitives <= budgets.propPrimitives, `${id}: prop budgets`);
  assert.deepEqual(json.nodes.filter(node => node.mesh !== undefined).map(node => node.name), [`prop__${id}`], `${id}: single named mesh`);
  for (const field of ['origin', 'engine', 'generated', 'credits']) assert.ok(definition[field], `${id}: provenance ${field}`);
  assert.ok(definition.prompt || definition.reference, `${id}: provenance prompt or reference`);
  total += buffer.length;
  summaries.push({ id, bytes: buffer.length, triangles, primitives });
}
assert.ok(total <= budgets.totalPropBytes, `Total prop budget: ${total} bytes`);
for (const [id, definition] of Object.entries(manifest.art)) {
  const buffer = await readFile(path.join(app, 'public', definition.url));
  assert.equal(createHash('sha256').update(buffer).digest('hex'), definition.sha256, `${id}: art hash`);
  assert.ok(buffer.length <= budgets.artBytes, `${id}: art budget`);
  assert.ok(definition.origin && definition.prompt, `${id}: art provenance`);
}
// Every asset the web places must be registered here, and nothing registered may be orphaned.
const placements = await readFile(path.join(app, 'modules/workshop-game/props.ts'), 'utf8');
const placed = [...placements.matchAll(/prop\('([a-z-]+)'/g)].map(match => match[1]);
assert.deepEqual([...new Set(placed)].sort(), Object.keys(manifest.props).sort(), 'props.ts and manifest list the same props');
const placedArt = [...placements.matchAll(/url: '([^']+)'/g)].map(match => match[1]);
assert.deepEqual(placedArt.sort(), Object.values(manifest.art).map(definition => definition.url).sort(), 'props.ts and manifest list the same art');
assert.ok(manifest.license?.summary && manifest.license.checked, 'License note recorded');
console.log(JSON.stringify({ passed: true, totalPropBytes: total, props: summaries, art: Object.keys(manifest.art) }, null, 2));
