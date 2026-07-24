import { Prisma } from '@prisma/client';
import { sceneSchema, type Scene } from '@command-center/ai-renderer';
import { db } from '../../core/db';

export interface CreateProjectInput {
  name: string;
  scene: Scene;
  source?: string;
}

const projectInclude = {
  currentRevision: true,
  _count: { select: { revisions: true } },
} satisfies Prisma.SceneProjectInclude;

export function listSceneProjects(ownerId: string) {
  return db.sceneProject.findMany({
    where: { ownerId },
    include: projectInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

export function getSceneProject(ownerId: string, id: string) {
  return db.sceneProject.findFirst({
    where: { id, ownerId },
    include: {
      currentRevision: true,
      revisions: { orderBy: { revisionNumber: 'desc' } },
    },
  });
}

export async function createSceneProject(ownerId: string, input: CreateProjectInput) {
  const scene = sceneSchema.parse(input.scene);
  return db.$transaction(async (tx) => {
    const project = await tx.sceneProject.create({
      data: { name: input.name.trim() || scene.metadata.name || scene.id, ownerId },
    });
    const revision = await tx.sceneRevision.create({
      data: {
        projectId: project.id,
        revisionNumber: 1,
        sceneVersion: scene.version,
        sceneJson: scene,
        source: input.source ?? 'editor',
        createdBy: ownerId,
      },
    });
    return tx.sceneProject.update({
      where: { id: project.id },
      data: { currentRevisionId: revision.id },
      include: projectInclude,
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function createSceneRevision(ownerId: string, projectId: string, sceneInput: Scene, source = 'editor') {
  const scene = sceneSchema.parse(sceneInput);
  return db.$transaction(async (tx) => {
    const project = await tx.sceneProject.findFirst({ where: { id: projectId, ownerId } });
    if (!project) return null;
    const latest = await tx.sceneRevision.aggregate({
      where: { projectId },
      _max: { revisionNumber: true },
    });
    const revision = await tx.sceneRevision.create({
      data: {
        projectId,
        revisionNumber: (latest._max.revisionNumber ?? 0) + 1,
        sceneVersion: scene.version,
        sceneJson: scene,
        source,
        createdBy: ownerId,
      },
    });
    await tx.sceneProject.update({
      where: { id: projectId },
      data: { currentRevisionId: revision.id, name: scene.metadata.name ?? project.name },
    });
    return revision;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export function deleteSceneProject(ownerId: string, id: string) {
  return db.sceneProject.deleteMany({ where: { id, ownerId } });
}

export async function createRenderJob(ownerId: string, projectId: string, revisionId?: string) {
  const project = await db.sceneProject.findFirst({ where: { id: projectId, ownerId } });
  const targetRevisionId = revisionId ?? project?.currentRevisionId;
  if (!project || !targetRevisionId) return null;
  const revision = await db.sceneRevision.findFirst({ where: { id: targetRevisionId, projectId } });
  if (!revision) return null;
  return db.renderJob.create({
    data: { revisionId: revision.id, requestedBy: ownerId },
  });
}

export function getRenderJob(ownerId: string, id: string) {
  return db.renderJob.findFirst({
    where: { id, revision: { project: { ownerId } } },
  });
}
