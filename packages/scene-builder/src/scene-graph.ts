import { getAssetMetadata, type Scene } from '@command-center/ai-renderer';
import { resolveSceneObject, type ResolvedSceneObject } from './resolved-scene-object';

export interface SceneGraph {
  id: string;
  objects: ResolvedSceneObject[];
}

export function buildSceneGraph(scene: Scene): SceneGraph {
  return {
    id: scene.id,
    objects: scene.objects.map((object) => resolveSceneObject(object, getAssetMetadata(object.asset))),
  };
}
