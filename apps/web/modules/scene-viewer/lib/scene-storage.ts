import { sceneSchema, type Scene } from '@command-center/ai-renderer';

const INDEX_KEY = 'command-center:scene-index';

export interface StoredSceneSummary {
  id: string;
  name: string;
  savedAt: string;
  objectCount: number;
}

function sceneKey(id: string): string {
  return `command-center:scene:${id}`;
}

function readIndex(): StoredSceneSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(INDEX_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isStoredSceneSummary) : [];
  } catch {
    return [];
  }
}

function isStoredSceneSummary(value: unknown): value is StoredSceneSummary {
  return typeof value === 'object' && value !== null
    && 'id' in value && typeof value.id === 'string'
    && 'name' in value && typeof value.name === 'string'
    && 'savedAt' in value && typeof value.savedAt === 'string'
    && 'objectCount' in value && typeof value.objectCount === 'number';
}

export function listStoredScenes(): StoredSceneSummary[] {
  return readIndex().sort((left, right) => right.savedAt.localeCompare(left.savedAt));
}

export function saveStoredScene(scene: Scene): StoredSceneSummary {
  const summary: StoredSceneSummary = {
    id: scene.id,
    name: scene.metadata.name ?? scene.id,
    savedAt: new Date().toISOString(),
    objectCount: scene.objects.length,
  };
  const index = readIndex().filter((item) => item.id !== scene.id);
  window.localStorage.setItem(sceneKey(scene.id), JSON.stringify(scene));
  window.localStorage.setItem(INDEX_KEY, JSON.stringify([summary, ...index]));
  window.dispatchEvent(new Event('command-center:scene-saved'));
  return summary;
}

export function loadStoredScene(id: string): Scene | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(sceneKey(id));
    return raw ? sceneSchema.parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function deleteStoredScene(id: string): void {
  const index = readIndex().filter((item) => item.id !== id);
  window.localStorage.removeItem(sceneKey(id));
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  window.dispatchEvent(new Event('command-center:scene-saved'));
}
