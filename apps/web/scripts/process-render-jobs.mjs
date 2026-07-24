import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const webRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(webRoot, '../..');

function blenderBinary() {
  if (process.env.BLENDER_BIN) return process.env.BLENDER_BIN;
  const macPath = '/Applications/Blender.app/Contents/MacOS/Blender';
  return existsSync(macPath) ? macPath : 'blender';
}

async function claimJob() {
  const candidate = await prisma.renderJob.findFirst({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
    include: { revision: true },
  });
  if (!candidate) return null;
  const claimed = await prisma.renderJob.updateMany({
    where: { id: candidate.id, status: 'queued' },
    data: { status: 'processing', startedAt: new Date(), error: null },
  });
  return claimed.count === 1 ? candidate : null;
}

async function processOne() {
  const job = await claimJob();
  if (!job) {
    console.log('No queued render jobs.');
    return false;
  }

  const tempDirectory = mkdtempSync(join(tmpdir(), 'command-center-render-'));
  const scenePath = join(tempDirectory, 'scene.json');
  const outputDirectory = join(webRoot, 'public', 'renders', job.id);
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(scenePath, JSON.stringify(job.revision.sceneJson));

  try {
    const result = spawnSync(blenderBinary(), [
      '--background',
      '--python-exit-code', '1',
      join(repoRoot, 'blender', 'templates', 'base.blend'),
      '--python', join(repoRoot, 'blender', 'render.py'),
      '--',
      scenePath,
      join(webRoot, 'public', 'models'),
      outputDirectory,
    ], { cwd: repoRoot, encoding: 'utf8' });
    if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'Blender failed').slice(-2000));
    const sceneId = job.revision.sceneJson.id;
    await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        glbPath: `/renders/${job.id}/${sceneId}.glb`,
        pngPath: `/renders/${job.id}/${sceneId}.png`,
        completedAt: new Date(),
      },
    });
    console.log(`Render job completed: ${job.id}`);
    return true;
  } catch (error) {
    await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });
    throw error;
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
}

try {
  await processOne();
} finally {
  await prisma.$disconnect();
}
