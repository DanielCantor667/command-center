import { Mesh, type Object3D } from 'three';
/** Instance owns transforms; GLTF cache retains shared geometry/materials. */
export function cloneWorkshopModel(source: Object3D) {
  const clone = source.clone(true);
  clone.traverse(object => {
    if (object instanceof Mesh) {
      object.castShadow = ![object.material].flat().some(material => material.transparent);
      object.receiveShadow = true;
    }
  });
  return clone;
}
