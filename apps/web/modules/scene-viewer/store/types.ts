import type { AssetId, Scene, Vector3 } from '@command-center/ai-renderer';

export interface SceneEditorState {
  scene: Scene;
  past: Scene[];
  future: Scene[];
  selectedId: string | null;
  loadScene: (scene: Scene) => void;
  moveObject: (objectId: string, position: Vector3) => void;
  addObject: (asset: AssetId) => void;
  rotateObject: (objectId: string, rotationY: number) => void;
  scaleObject: (objectId: string, scale: number) => void;
  duplicateObject: (objectId: string) => void;
  deleteObject: (objectId: string) => void;
  snapObject: (objectId: string, increment?: number) => void;
  select: (objectId: string) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
