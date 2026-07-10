import { Euler, Vector3 } from 'three';
import type { AssetMetadata } from '@command-center/ai-renderer';
import type { SceneObject } from '@command-center/ai-renderer';

export interface ResolvedSceneObject {
  id: string;
  asset: SceneObject['asset'];
  metadata: AssetMetadata;
  position: Vector3;
  rotation: Euler;
  scale: number;
}

export function resolveSceneObject(object: SceneObject, metadata: AssetMetadata): ResolvedSceneObject {
  return {
    id: object.id,
    asset: object.asset,
    metadata,
    position: new Vector3(object.transform.position.x, object.transform.position.y, object.transform.position.z),
    rotation: new Euler(object.transform.rotation.x, object.transform.rotation.y, object.transform.rotation.z),
    scale: object.transform.scale,
  };
}
