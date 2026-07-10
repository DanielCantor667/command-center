import type { Scene, Vector3 } from '@command-center/ai-renderer';

export interface SceneEditorState {
  scene: Scene;
  past: Scene[];
  future: Scene[];
  selectedId: string | null;
  loadScene: (scene: Scene) => void;
  moveObject: (objectId: string, position: Vector3) => void;
  select: (objectId: string) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
