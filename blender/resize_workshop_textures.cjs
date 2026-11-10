#!/usr/bin/env node
'use strict';

// Invoked through `npx --package=@gltf-transform/cli@4.5.1 -- node ...`.
// Resolve the CLI's own dependencies from its executable, not a machine-specific npm cache.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const [input, output, sizeText] = process.argv.slice(2);
const size = Number(sizeText);
if (!input || !output || !Number.isInteger(size) || size < 1 || path.resolve(input) === path.resolve(output)) {
  throw new Error('Usage: resize_workshop_textures.cjs INPUT.glb OUTPUT.glb DETAIL_SIZE (different paths)');
}
const executable = process.env.PATH.split(path.delimiter)
  .map(dir => path.join(dir, process.platform === 'win32' ? 'gltf-transform.cmd' : 'gltf-transform'))
  .find(file => fs.existsSync(file));
if (!executable) throw new Error('Run via npx --package=@gltf-transform/cli@4.5.1 -- node ...');
const cli = fs.realpathSync(executable);
const cliVersion = JSON.parse(fs.readFileSync(path.join(path.dirname(cli), '..', 'package.json'), 'utf8')).version;
if (cliVersion !== '4.5.1') throw new Error(`Expected glTF Transform CLI 4.5.1, found ${cliVersion}`);
const fromCli = createRequire(cli);
const { NodeIO } = fromCli('@gltf-transform/core');
const { ALL_EXTENSIONS } = fromCli('@gltf-transform/extensions');
const sharp = fromCli('sharp');

async function main() {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(input);
  const textures = doc.getRoot().listTextures();
  const expected = new Map([['lab-architecture', 8192], ['lab-props', 4096]]);
  const protectedImages = new Map();
  for (const [name, dimension] of expected) {
    const found = textures.filter(texture => texture.getName() === name);
    if (found.length !== 1 || !found[0].getImage()) throw new Error(`Expected exactly one embedded ${name} lightmap`);
    const bytes = found[0].getImage();
    const { width, height } = await sharp(bytes).metadata();
    if (width !== dimension || height !== dimension) throw new Error(`${name}: expected ${dimension}x${dimension}, got ${width}x${height}`);
    protectedImages.set(found[0], Buffer.from(bytes));
  }
  let resized = 0;
  for (const texture of textures) {
    if (protectedImages.has(texture)) continue;
    const bytes = texture.getImage();
    if (!bytes) throw new Error(`Texture ${texture.getName() || '(unnamed)'} has no embedded image`);
    const { width, height } = await sharp(bytes).metadata();
    if (!width || !height) throw new Error(`Cannot read dimensions for texture ${texture.getName() || '(unnamed)'}`);
    if (width > size || height > size) {
      texture.setImage(await sharp(bytes).resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true }).toBuffer());
      resized++;
    }
  }
  for (const [texture, original] of protectedImages) {
    if (!Buffer.from(texture.getImage()).equals(original)) throw new Error(`Lightmap changed: ${texture.getName()}`);
  }
  await io.write(output, doc);
  console.log(`Detail textures resized: ${resized}; maximum ${size}px. Lightmaps preserved byte-for-byte (8192 / 4096).`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
