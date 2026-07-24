import { create } from 'zustand';
import type { AssetId, Scene } from '@command-center/ai-renderer';
import { saveStoredScene } from '../lib/scene-storage';
import type { SceneEditorState } from './types';

function updateScene(set: (partial: Partial<SceneEditorState>) => void, get: () => SceneEditorState, update: (scene: Scene) => Scene): void {
  const { scene, past } = get();
  set({ scene: update(scene), past: [...past, scene], future: [] });
}

function snap(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function createSceneEditorStore(initialScene: Scene) {
  return create<SceneEditorState>((set, get) => ({
    scene: initialScene,
    past: [],
    future: [],
    selectedId: null,

    loadScene: (scene) => set({ scene, past: [], future: [], selectedId: null }),

    moveObject: (objectId, position) => {
      updateScene(set, get, (scene) => ({
        ...scene,
        objects: scene.objects.map((object) =>
          object.id === objectId
            ? { ...object, transform: { ...object.transform, position: { x: snap(position.x, 0.5), y: position.y, z: snap(position.z, 0.5) } } }
            : object,
        ),
      }));
    },

    addObject: (asset: AssetId) => {
      const { scene } = get();
      const sameAssetCount = scene.objects.filter((object) => object.asset === asset).length;
      const id = `${asset}-${sameAssetCount + 1}`;
      const index = scene.objects.length;
      const position = { x: snap((index % 6) * 1.5 - 3.75, 0.5), y: 0, z: snap(Math.floor(index / 6) * 1.5 + 5, 0.5) };
      updateScene(set, get, (currentScene) => ({
        ...currentScene,
        objects: [...currentScene.objects, {
          id,
          asset,
          transform: { position, rotation: { x: 0, y: 0, z: 0 }, scale: 1 },
          properties: {},
        }],
      }));
      set({ selectedId: id });
    },

    rotateObject: (objectId, rotationY) => updateScene(set, get, (scene) => ({
      ...scene,
      objects: scene.objects.map((object) => object.id === objectId
        ? { ...object, transform: { ...object.transform, rotation: { ...object.transform.rotation, y: rotationY } } }
        : object),
    })),

    scaleObject: (objectId, scale) => updateScene(set, get, (scene) => ({
      ...scene,
      objects: scene.objects.map((object) => object.id === objectId
        ? { ...object, transform: { ...object.transform, scale: Math.max(0.25, Math.min(scale, 4)) } }
        : object),
    })),

    duplicateObject: (objectId) => updateScene(set, get, (scene) => {
      const original = scene.objects.find((object) => object.id === objectId);
      if (!original) return scene;
      const copyNumber = scene.objects.filter((object) => object.id.startsWith(`${objectId}-copy`)).length + 1;
      return {
        ...scene,
        objects: [...scene.objects, {
          ...original,
          id: `${objectId}-copy-${copyNumber}`,
          transform: { ...original.transform, position: { ...original.transform.position, x: original.transform.position.x + 1, z: original.transform.position.z + 1 } },
        }],
      };
    }),

    deleteObject: (objectId) => {
      updateScene(set, get, (scene) => ({ ...scene, objects: scene.objects.filter((object) => object.id !== objectId) }));
      if (get().selectedId === objectId) set({ selectedId: null });
    },

    snapObject: (objectId, increment = 0.5) => updateScene(set, get, (scene) => ({
      ...scene,
      objects: scene.objects.map((object) => object.id === objectId
        ? { ...object, transform: { ...object.transform, position: { x: snap(object.transform.position.x, increment), y: object.transform.position.y, z: snap(object.transform.position.z, increment) } } }
        : object),
    })),

    select: (objectId) => set({ selectedId: objectId }),
    clearSelection: () => set({ selectedId: null }),

    undo: () => {
      const { past, future, scene } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      if (!previous) return;
      set({ scene: previous, past: past.slice(0, -1), future: [scene, ...future] });
    },

    redo: () => {
      const { past, future, scene } = get();
      if (future.length === 0) return;
      const next = future[0];
      if (!next) return;
      set({ scene: next, past: [...past, scene], future: future.slice(1) });
    },

    save: () => {
      if (typeof window === 'undefined') return;
      const { scene } = get();
      saveStoredScene(scene);
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
  }));
}
