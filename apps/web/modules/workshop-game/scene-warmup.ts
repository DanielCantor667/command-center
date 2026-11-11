import { Texture, type Camera, type Material, type Object3D, type WebGLRenderer } from 'three';

/**
 * P.1 (specs/workshop-performance.md): upload every texture and compile every material, including the ones off
 * camera, while the loading panel is still up, so the first seconds of the tour do not stutter. Never throws: if the
 * warm-up fails the world simply compiles on first use, as before.
 */
export async function warmUpScene(gl: Pick<WebGLRenderer, 'initTexture' | 'compileAsync'>, scene: Object3D, camera: Camera) {
  try {
    const textures = new Set<Texture>();
    scene.traverse(object => {
      const material = (object as Object3D & { material?: Material | Material[] }).material;
      for (const item of Array.isArray(material) ? material : material ? [material] : []) {
        for (const value of Object.values(item)) if (value instanceof Texture) textures.add(value);
      }
    });
    textures.forEach(texture => gl.initTexture(texture));
    await gl.compileAsync(scene, camera);
  } catch { /* compile on first use */ }
}
