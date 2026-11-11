import { describe, expect, it, vi } from 'vitest';
import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Texture, BoxGeometry } from 'three';
import { warmUpScene } from '../scene-warmup';

function scene() {
  const map = new Texture(), lightMap = new Texture();
  const root = new Scene();
  root.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial({ map })));
  root.add(new Mesh(new BoxGeometry(), [new MeshBasicMaterial({ map, lightMap }), new MeshBasicMaterial()]));
  return { root, map, lightMap };
}

describe('scene warm-up', () => {
  it('uploads each texture once and then compiles the whole scene', async () => {
    const { root, map, lightMap } = scene();
    const order: string[] = [];
    const gl = { initTexture: vi.fn<(texture: Texture) => void>(() => { order.push('texture'); }), compileAsync: vi.fn(async () => { order.push('compile'); return root; }) };
    await warmUpScene(gl, root, new PerspectiveCamera());
    expect(gl.initTexture.mock.calls.map(([texture]) => texture)).toEqual([map, lightMap]);
    expect(gl.compileAsync).toHaveBeenCalledWith(root, expect.any(PerspectiveCamera));
    expect(order).toEqual(['texture', 'texture', 'compile']);
  });
  it('resolves when compiling fails, so the world still opens', async () => {
    const { root } = scene();
    const gl = { initTexture: vi.fn(), compileAsync: vi.fn(async () => { throw new Error('context lost'); }) };
    await expect(warmUpScene(gl, root, new PerspectiveCamera())).resolves.toBeUndefined();
  });
});
