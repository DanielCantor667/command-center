import { Mesh, type Object3D } from 'three';
import { applyLeafSway } from './ambient';
/** Instance owns transforms; GLTF cache retains shared geometry/materials. */
export function cloneWorkshopModel(source: Object3D) {
  const clone = source.clone(true);
  applyLeafSway(clone);
  clone.traverse(object => {
    if (object instanceof Mesh) {
      object.castShadow = ![object.material].flat().some(material => material.transparent);
      object.receiveShadow = true;
    }
  });
  return clone;
}
