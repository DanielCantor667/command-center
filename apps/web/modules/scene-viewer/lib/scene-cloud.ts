import { sceneSchema, type Scene } from '@command-center/ai-renderer';
import { getSupabaseBrowserClient } from '../../../core/supabase';

export interface CloudProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  revisionCount: number;
  scene: Scene;
}

export interface CloudRenderJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  glbPath: string | null;
  pngPath: string | null;
  error: string | null;
}

export interface CloudRevision {
  id: string;
  revisionNumber: number;
  createdAt: string;
  scene: Scene;
}

async function accessToken(): Promise<string> {
  const { data } = await getSupabaseBrowserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Inicia sesión para guardar proyectos.');
  return token;
}

async function cloudFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await accessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

function toSummary(project: {
  id: string;
  name: string;
  updatedAt: string;
  currentRevision: { sceneJson: unknown } | null;
  _count?: { revisions: number };
}): CloudProjectSummary | null {
  if (!project.currentRevision) return null;
  return {
    id: project.id,
    name: project.name,
    updatedAt: project.updatedAt,
    revisionCount: project._count?.revisions ?? 1,
    scene: sceneSchema.parse(project.currentRevision.sceneJson),
  };
}

export async function listCloudProjects(): Promise<CloudProjectSummary[]> {
  const { projects } = await cloudFetch<{ projects: Parameters<typeof toSummary>[0][] }>('/api/scene-projects');
  return projects.map(toSummary).filter((project): project is CloudProjectSummary => project !== null);
}

export async function createCloudProject(scene: Scene): Promise<CloudProjectSummary> {
  const { project } = await cloudFetch<{ project: Parameters<typeof toSummary>[0] }>('/api/scene-projects', {
    method: 'POST',
    body: JSON.stringify({ name: scene.metadata.name ?? scene.id, scene }),
  });
  const summary = toSummary(project);
  if (!summary) throw new Error('El proyecto se creó sin una revisión válida.');
  return summary;
}

export async function saveCloudRevision(projectId: string, scene: Scene): Promise<void> {
  await cloudFetch(`/api/scene-projects/${projectId}/revisions`, {
    method: 'POST',
    body: JSON.stringify({ scene, source: 'editor' }),
  });
}

export async function deleteCloudProject(projectId: string): Promise<void> {
  await cloudFetch(`/api/scene-projects/${projectId}`, { method: 'DELETE' });
}

export async function requestCloudRender(projectId: string): Promise<CloudRenderJob> {
  const { job } = await cloudFetch<{ job: CloudRenderJob }>(`/api/scene-projects/${projectId}/render-jobs`, {
    method: 'POST',
    body: '{}',
  });
  return job;
}

export async function getCloudRenderJob(jobId: string): Promise<CloudRenderJob> {
  const { job } = await cloudFetch<{ job: CloudRenderJob }>(`/api/render-jobs/${jobId}`);
  return job;
}

export async function listCloudRevisions(projectId: string): Promise<CloudRevision[]> {
  const { revisions } = await cloudFetch<{ revisions: Array<{
    id: string;
    revisionNumber: number;
    createdAt: string;
    sceneJson: unknown;
  }> }>(`/api/scene-projects/${projectId}/revisions`);
  return revisions.map((revision) => ({
    id: revision.id,
    revisionNumber: revision.revisionNumber,
    createdAt: revision.createdAt,
    scene: sceneSchema.parse(revision.sceneJson),
  }));
}
