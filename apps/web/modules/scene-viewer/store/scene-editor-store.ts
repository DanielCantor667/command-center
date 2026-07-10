import { create } from 'zustand';
import type { Scene } from '@command-center/ai-renderer';
import type { SceneEditorState } from './types';

function storageKey(sceneId: string): string {
  return `command-center:scene:${sceneId}`;
}

export function createSceneEditorStore(initialScene: Scene) {
  return create<SceneEditorState>((set, get) => ({
    scene: initialScene,
    past: [],
    future: [],
    selectedId: null,

    loadScene: (scene) => set({ scene, past: [], future: [], selectedId: null }),

    moveObject: (objectId, position) => {
      const { scene, past } = get();
      const nextScene: Scene = {
        ...scene,
        objects: scene.objects.map((object) =>
          object.id === objectId
            ? { ...object, transform: { ...object.transform, position } }
            : object,
        ),
      };
      set({ scene: nextScene, past: [...past, scene], future: [] });
    },

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
      window.localStorage.setItem(storageKey(scene.id), JSON.stringify(scene));
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
  }));
}
