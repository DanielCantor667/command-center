import { beforeEach, describe, expect, it } from 'vitest';
import { sceneSchema } from '@command-center/ai-renderer';
import { readFileSync } from 'node:fs';
import { deleteStoredScene, listStoredScenes, loadStoredScene, saveStoredScene } from '../lib/scene-storage';

const scene = sceneSchema.parse({ version: 1, id: 'stored-scene', metadata: { name: 'Saved Office' }, objects: [] });

describe('scene storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('saves, lists, loads and deletes a valid scene', () => {
    saveStoredScene(scene);
    expect(listStoredScenes()).toMatchObject([{ id: 'stored-scene', name: 'Saved Office', objectCount: 0 }]);
    expect(loadStoredScene('stored-scene')).toEqual(scene);

    deleteStoredScene('stored-scene');
    expect(listStoredScenes()).toEqual([]);
    expect(loadStoredScene('stored-scene')).toBeNull();
  });

  it('accepts the Blender starter scene as an import-compatible contract', () => {
    const starter = JSON.parse(readFileSync('../../blender/scenes/starter-office.json', 'utf8'));
    expect(sceneSchema.parse(starter).id).toBe('starter-office');
  });
});
