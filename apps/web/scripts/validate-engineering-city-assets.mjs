#!/usr/bin/env node

/**
 * Validates the public Engineering City landmark manifest and its GLB outputs.
 *
 * The manifest is deliberately a static TypeScript array so the navigator can
 * consume it directly. This script uses the already-installed TypeScript parser
 * (no runtime loader or new dependency) to read CITY_ASSETS safely without
 * executing application code.
 */
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from '../node_modules/typescript/lib/typescript.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const appDirectory = path.resolve(scriptDirectory, '..');
const publicDirectory = path.join(appDirectory, 'public');
const defaultManifestPath = path.join(appDirectory, 'modules/experience/data/city-assets.ts');

const LANDMARK_LIMITS = {
  lod0Triangles: 18_000,
  lod1Triangles: 5_000,
  initialCityBytes: 8 * 1024 * 1024,
};

function usage() {
  return [
    'Usage: node scripts/validate-engineering-city-assets.mjs [--manifest <path>]',
    '',
    'Validates CITY_ASSETS metadata, public GLB paths, LOD triangle budgets and',
    'redistribution metadata. Defaults to modules/experience/data/city-assets.ts.',
  ].join('\n');
}

function parseArguments(argumentsList) {
  let manifestPath = defaultManifestPath;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--help' || argument === '-h') return { help: true };
    if (argument === '--manifest') {
      const value = argumentsList[index + 1];
      if (!value) throw new Error('--manifest requires a path.');
      manifestPath = path.resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  return { manifestPath };
}

function staticValue(node) {
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isParenthesizedExpression(node)) {
    return staticValue(node.expression);
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node)) {
    const value = staticValue(node.operand);
    if (typeof value !== 'number') throw new Error('Unary expression must contain a number.');
    return node.operator === ts.SyntaxKind.MinusToken ? -value : value;
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(staticValue);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties.map((property) => {
        if (!ts.isPropertyAssignment(property) || !property.name) {
          throw new Error('CITY_ASSETS only supports static property assignments.');
        }
        if (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name)) {
          throw new Error('CITY_ASSETS property names must be static.');
        }
        return [property.name.text, staticValue(property.initializer)];
      }),
    );
  }
  throw new Error(`Unsupported dynamic expression in CITY_ASSETS: ${ts.SyntaxKind[node.kind]}.`);
}

async function readCityAssets(manifestPath) {
  const source = await readFile(manifestPath, 'utf8');
  const sourceFile = ts.createSourceFile(manifestPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (sourceFile.parseDiagnostics.length) {
    throw new Error(`TypeScript parse error in ${manifestPath}.`);
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      if (declaration.name.text !== 'CITY_ASSETS') continue;
      const assets = staticValue(declaration.initializer);
      if (!Array.isArray(assets)) throw new Error('CITY_ASSETS must be an array.');
      return assets;
    }
  }

  throw new Error(`Could not find a static CITY_ASSETS export in ${manifestPath}.`);
}

function errorFor(errors, assetId, message) {
  errors.push(`${assetId}: ${message}`);
}

function validVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((component) => Number.isFinite(component));
}

function validateDistrictLayout(asset, errors) {
  const id = asset.id ?? '<missing id>';
  for (const field of ['id', 'projectId', 'label', 'version']) {
    if (typeof asset[field] !== 'string' || asset[field].trim() === '') errorFor(errors, id, `missing ${field} metadata`);
  }
  if (asset.projectId !== asset.id) errorFor(errors, id, 'projectId must match id for a district landmark');
  if (!validVector3(asset.position)) errorFor(errors, id, 'position must be a finite [x, y, z] vector');
  if (!validVector3(asset.scale) || asset.scale.some((component) => component <= 0)) {
    errorFor(errors, id, 'scale must be a positive finite [x, y, z] vector');
  }

  const { motion } = asset;
  if (!motion || typeof motion !== 'object') {
    errorFor(errors, id, 'motion profile is required for every district');
  } else {
    if (!Number.isFinite(motion.pulsePeriodSeconds) || motion.pulsePeriodSeconds <= 0) {
      errorFor(errors, id, 'motion.pulsePeriodSeconds must be a positive finite number');
    }
  }
}

function validHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function publicFileFor(webPath) {
  if (typeof webPath !== 'string' || !webPath.startsWith('/models/') || !webPath.endsWith('.glb')) {
    return null;
  }
  const relativePath = webPath.slice(1);
  if (relativePath.split('/').includes('..') || relativePath.includes('\\') || webPath.includes('?')) return null;
  const filePath = path.resolve(publicDirectory, relativePath);
  return filePath.startsWith(`${publicDirectory}${path.sep}`) ? filePath : null;
}

function triangleCountFromGlb(buffer) {
  if (buffer.length < 20 || buffer.readUInt32LE(0) !== 0x46546c67 || buffer.readUInt32LE(4) !== 2) {
    throw new Error('not a GLB 2.0 file');
  }

  let offset = 12;
  let gltf;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    offset += 8;
    if (offset + chunkLength > buffer.length) throw new Error('truncated GLB chunk');
    if (chunkType === 0x4e4f534a) {
      gltf = JSON.parse(buffer.subarray(offset, offset + chunkLength).toString('utf8').trim());
      break;
    }
    offset += chunkLength;
  }
  if (!gltf?.meshes || !gltf?.accessors) throw new Error('GLB has no mesh/accessor data');

  return gltf.meshes.reduce((total, mesh) => total + mesh.primitives.reduce((meshTotal, primitive) => {
    const accessorIndex = primitive.indices ?? primitive.attributes?.POSITION;
    const vertexCount = gltf.accessors[accessorIndex]?.count;
    if (!Number.isInteger(vertexCount)) throw new Error('primitive has no valid index/POSITION accessor');
    const mode = primitive.mode ?? 4;
    if (mode === 4) return meshTotal + Math.floor(vertexCount / 3);
    if (mode === 5 || mode === 6) return meshTotal + Math.max(0, vertexCount - 2);
    return meshTotal;
  }, 0), 0);
}

async function inspectGlb(webPath) {
  const filePath = publicFileFor(webPath);
  if (!filePath) return { error: 'must be a /models/... .glb public path' };
  try {
    const [fileInfo, fileBuffer] = await Promise.all([stat(filePath), readFile(filePath)]);
    if (!fileInfo.isFile()) return { error: 'does not resolve to a file' };
    return {
      bytes: fileInfo.size,
      triangles: triangleCountFromGlb(fileBuffer),
      sha256: createHash('sha256').update(fileBuffer).digest('hex'),
    };
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : String(cause) };
  }
}

function validateMetadata(asset, errors) {
  const id = asset.id ?? '<missing id>';
  if (!asset.transform || typeof asset.transform !== 'object') {
    errorFor(errors, id, 'published landmark requires a transform for the city navigator');
  } else {
    for (const field of ['position', 'rotation', 'scale']) {
      if (!validVector3(asset.transform[field])) {
        errorFor(errors, id, `transform.${field} must be a finite [x, y, z] vector`);
      }
    }
    if (validVector3(asset.transform.scale) && asset.transform.scale.some((component) => component <= 0)) {
      errorFor(errors, id, 'transform.scale must contain only positive values');
    }
  }

  const { source, license, dimensions, triangleBudget } = asset;
  if (!source || typeof source !== 'object') errorFor(errors, id, 'missing source provenance');
  else {
    if (!['original', 'cc0', 'commercial'].includes(source.kind)) errorFor(errors, id, 'source.kind must be original, cc0, or commercial');
    if (typeof source.name !== 'string' || source.name.trim() === '') errorFor(errors, id, 'source.name is required');
    if (source.kind !== 'original' && !validHttpUrl(source.url)) errorFor(errors, id, 'third-party source.url must be an http(s) URL');
    if (source.kind === 'original' && typeof source.author !== 'string') errorFor(errors, id, 'original assets require source.author');
    if (typeof source.createdAt !== 'string' || Number.isNaN(Date.parse(source.createdAt))) errorFor(errors, id, 'source.createdAt must be an ISO date');
    if (source.sha256 !== undefined && (typeof source.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(source.sha256))) {
      errorFor(errors, id, 'source.sha256 must be a SHA-256 hex digest when provided');
    }
    if (source.kind !== 'original' && source.sha256 === undefined) {
      errorFor(errors, id, 'third-party assets require source.sha256 provenance metadata');
    }
  }

  if (!license || typeof license !== 'object') errorFor(errors, id, 'missing license metadata');
  else {
    if (typeof license.id !== 'string' || license.id.trim() === '') errorFor(errors, id, 'license.id is required');
    if (license.redistributable !== true) errorFor(errors, id, 'license.redistributable must be true for public GLBs');
    if (license.url !== undefined && typeof license.url !== 'string') errorFor(errors, id, 'license.url must be a string when provided');
  }

  if (!dimensions || typeof dimensions !== 'object') errorFor(errors, id, 'missing dimensions metadata');
  else {
    for (const dimension of ['width', 'height', 'depth']) {
      if (!Number.isFinite(dimensions[dimension]) || dimensions[dimension] <= 0) {
        errorFor(errors, id, `dimensions.${dimension} must be a positive number`);
      }
    }
    if (dimensions.unit !== 'm') errorFor(errors, id, 'dimensions.unit must be m');
  }

  if (!triangleBudget || typeof triangleBudget !== 'object') errorFor(errors, id, 'missing triangleBudget metadata');
  else {
    for (const lod of ['lod0', 'lod1']) {
      if (!Number.isInteger(triangleBudget[lod]) || triangleBudget[lod] <= 0) {
        errorFor(errors, id, `triangleBudget.${lod} must be a positive integer`);
      }
    }
    if (triangleBudget.lod0 > LANDMARK_LIMITS.lod0Triangles) errorFor(errors, id, `triangleBudget.lod0 exceeds ${LANDMARK_LIMITS.lod0Triangles}`);
    if (triangleBudget.lod1 > LANDMARK_LIMITS.lod1Triangles) errorFor(errors, id, `triangleBudget.lod1 exceeds ${LANDMARK_LIMITS.lod1Triangles}`);
  }
}

async function validate() {
  const errors = [];
  const assets = await readCityAssets(options.manifestPath);
  const ids = new Set();
  let initialCityBytes = 0;
  const details = [];

  for (const asset of assets) {
    const id = typeof asset.id === 'string' ? asset.id : '<missing id>';
    if (ids.has(id)) errorFor(errors, id, 'duplicate asset id');
    ids.add(id);
    validateDistrictLayout(asset, errors);

    const hasLod0 = asset.lod0Path !== null && asset.lod0Path !== undefined;
    const hasLod1 = asset.lod1Path !== null && asset.lod1Path !== undefined;
    if (!hasLod0 && !hasLod1) continue; // Explicit future-district placeholder.
    if (!hasLod0 || !hasLod1) {
      errorFor(errors, id, 'both lod0Path and lod1Path are required for a published landmark');
      continue;
    }

    validateMetadata(asset, errors);
    if (asset.lod0Path === asset.lod1Path) errorFor(errors, id, 'LOD0 and LOD1 must be separate files');
    const [lod0, lod1] = await Promise.all([inspectGlb(asset.lod0Path), inspectGlb(asset.lod1Path)]);
    for (const [lod, inspected] of [['lod0', lod0], ['lod1', lod1]]) {
      if (inspected.error) errorFor(errors, id, `${lod} ${inspected.error}`);
    }
    if (lod0.bytes) initialCityBytes += lod0.bytes;
    if (lod0.triangles !== undefined && asset.triangleBudget?.lod0 !== undefined && lod0.triangles > asset.triangleBudget.lod0) {
      errorFor(errors, id, `LOD0 has ${lod0.triangles} triangles; budget is ${asset.triangleBudget.lod0}`);
    }
    if (lod0.sha256 && asset.source?.sha256 && lod0.sha256 !== asset.source.sha256) {
      errorFor(errors, id, 'LOD0 SHA-256 does not match source.sha256 provenance metadata');
    }
    if (lod1.triangles !== undefined && asset.triangleBudget?.lod1 !== undefined && lod1.triangles > asset.triangleBudget.lod1) {
      errorFor(errors, id, `LOD1 has ${lod1.triangles} triangles; budget is ${asset.triangleBudget.lod1}`);
    }
    if (lod0.triangles !== undefined && lod1.triangles !== undefined && lod1.triangles > lod0.triangles) {
      errorFor(errors, id, 'LOD1 triangle count cannot exceed LOD0');
    }
    details.push({ id, lod0, lod1 });
  }

  if (initialCityBytes > LANDMARK_LIMITS.initialCityBytes) {
    errors.push(`initial city LOD0 payload is ${initialCityBytes} B; limit is ${LANDMARK_LIMITS.initialCityBytes} B`);
  }

  return { errors, assets, details, initialCityBytes };
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }
  const report = await validate();
  for (const detail of report.details) {
    console.log(`${detail.id}: LOD0 ${detail.lod0.triangles} tris / ${detail.lod0.bytes} B; LOD1 ${detail.lod1.triangles} tris / ${detail.lod1.bytes} B`);
  }
  console.log(`Initial city LOD0 payload: ${report.initialCityBytes} B / ${LANDMARK_LIMITS.initialCityBytes} B`);
  if (report.errors.length) {
    console.error('\nEngineering City asset validation failed:');
    for (const error of report.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`Validated ${report.assets.length} district entries successfully.`);
  }
} catch (cause) {
  console.error(`Engineering City asset validation failed: ${cause instanceof Error ? cause.message : String(cause)}`);
  process.exitCode = 1;
}
