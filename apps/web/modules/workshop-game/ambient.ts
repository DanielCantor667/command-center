import { Mesh, type Material, type Object3D } from 'three';

/** Shared clock for ambient motion. `enabled` is false under reduced motion or while paused. */
export const ambient = { enabled: false, time: { value: 0 } };

const LEAF = /__leaf(light)?$/;

/**
 * Plants are merged into one mesh per scene, so they sway in the vertex shader:
 * displacement grows with height, which keeps pots and trunks still.
 */
function swayMaterial(material: Material) {
  if (material.userData.sway) return;
  material.userData.sway = true;
  const previous = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.uniforms.uTime = ambient.time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float swayAmount = clamp(position.y, 0.0, 3.0) * 0.016;
        transformed.x += sin(uTime * 1.1 + position.x * 1.7 + position.z * 1.3) * swayAmount;
        transformed.z += cos(uTime * 0.9 + position.z * 1.5 + position.x * 0.8) * swayAmount * 0.8;`);
  };
  material.customProgramCacheKey = () => 'leaf-sway';
  material.needsUpdate = true;
}

export function applyLeafSway(root: Object3D) {
  root.traverse(object => {
    if (object instanceof Mesh && LEAF.test(object.name)) [object.material].flat().forEach(swayMaterial);
  });
}
