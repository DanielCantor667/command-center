import { beforeEach, describe, expect, it } from 'vitest';
import { sceneSchema } from '@command-center/ai-renderer';
import { createSceneEditorStore } from '../store/scene-editor-store';

function makeScene() {
  return sceneSchema.parse({
    version: 1,
    id: 'editor-scene',
    objects: [
      { id: 'desk-1', asset: 'desk', transform: { position: { x: 0, y: 0, z: 0 } } },
    ],
  });
}

describe('scene editor store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('moves an object and records history', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().moveObject('desk-1', { x: 5, y: 0, z: 2 });

    const { scene, past } = useStore.getState();
    expect(scene.objects[0]?.transform.position).toEqual({ x: 5, y: 0, z: 2 });
    expect(past).toHaveLength(1);
  });

  it('undoes and redoes a move', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().moveObject('desk-1', { x: 5, y: 0, z: 2 });
    useStore.getState().undo();

    expect(useStore.getState().scene.objects[0]?.transform.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(useStore.getState().canRedo()).toBe(true);

    useStore.getState().redo();
    expect(useStore.getState().scene.objects[0]?.transform.position).toEqual({ x: 5, y: 0, z: 2 });
  });

  it('clears the redo stack on a new move after undo', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().moveObject('desk-1', { x: 5, y: 0, z: 2 });
    useStore.getState().undo();
    useStore.getState().moveObject('desk-1', { x: 1, y: 0, z: 1 });

    expect(useStore.getState().canRedo()).toBe(false);
  });

  it('does nothing when undo/redo is called with empty history', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().undo();
    useStore.getState().redo();

    expect(useStore.getState().scene.objects[0]?.transform.position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('saves the scene to localStorage', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().save();

    const stored = window.localStorage.getItem('command-center:scene:editor-scene');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).id).toBe('editor-scene');
  });

  it('tracks selection', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().select('desk-1');
    expect(useStore.getState().selectedId).toBe('desk-1');

    useStore.getState().clearSelection();
    expect(useStore.getState().selectedId).toBeNull();
  });

  it('supports spatial editing operations', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().rotateObject('desk-1', Math.PI / 2);
    useStore.getState().scaleObject('desk-1', 1.5);
    useStore.getState().duplicateObject('desk-1');

    expect(useStore.getState().scene.objects).toHaveLength(2);
    expect(useStore.getState().scene.objects[0]?.transform.rotation.y).toBe(Math.PI / 2);
    expect(useStore.getState().scene.objects[0]?.transform.scale).toBe(1.5);
    expect(useStore.getState().scene.objects[1]?.id).toBe('desk-1-copy-1');

    useStore.getState().deleteObject('desk-1-copy-1');
    expect(useStore.getState().scene.objects).toHaveLength(1);
  });

  it('adds a catalog asset on the editing grid and selects it', () => {
    const useStore = createSceneEditorStore(makeScene());

    useStore.getState().addObject('tree');

    const added = useStore.getState().scene.objects[1];
    expect(added).toMatchObject({ id: 'tree-1', asset: 'tree', transform: { position: { x: -2, y: 0, z: 5 } } });
    expect(useStore.getState().selectedId).toBe('tree-1');
  });
});
