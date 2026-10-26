import { act, fireEvent, render } from '@testing-library/react';
import { useImperativeHandle, type ReactNode, type Ref } from 'react';
import { Group, OrthographicCamera, Vector3 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KliniuSequenceScene } from './kliniu-sequence-scene';

const renderer = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
  suspend: true,
  pending: new Promise<never>(() => {}),
  frame: undefined as ((state: unknown, delta: number) => void) | undefined,
}));
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  useThree: () => renderer.current,
  useFrame: (frame: (state: unknown, delta: number) => void) => { renderer.frame = frame; },
}));
vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  Lightformer: () => null,
  OrbitControls: ({ ref }: { ref: Ref<unknown> }) => {
    useImperativeHandle(ref, () => ({
      target: new Vector3(0, 0.7, 0),
      minAzimuthAngle: -0.8,
      maxAzimuthAngle: 1.3,
      minPolarAngle: 0.35,
      maxPolarAngle: 1.42,
      update() {},
    }));
    return null;
  },
  useGLTF: () => {
    if (renderer.suspend) throw renderer.pending;
    return { scene: new Group() };
  },
}));

let canvas: HTMLCanvasElement;
let contextLost: boolean;
let camera: OrthographicCamera;
beforeEach(() => {
  // The hook harness renders Three host nodes as SVG; only their GPU shadow props lack DOM equivalents.
  const report = console.error;
  vi.spyOn(console, 'error').mockImplementation((message, ...details) => {
    if (typeof message === 'string' && message.startsWith('React does not recognize the `%s` prop') && ['castShadow', 'receiveShadow', 'shadow-mapSize', 'shadow-normalBias'].includes(details[0] as string)) return;
    report(message, ...details);
  });
  renderer.suspend = true;
  contextLost = false;
  canvas = document.createElement('canvas');
  camera = new OrthographicCamera();
  camera.position.set(2.8, 2.1, 5);
  renderer.current = {
    camera, size: { width: 390, height: 480 }, invalidate: vi.fn(),
    gl: { domElement: canvas, getContext: () => ({ isContextLost: () => contextLost }) },
  };
});
afterEach(() => { vi.restoreAllMocks(); });
const base = { stage: 'plan' as const, revision: 0, reducedMotion: true };

describe('Kliniu scene lifecycle', () => {
  it('reports context loss while the model is suspended and removes the listener on unmount', () => {
    const failed = vi.fn();
    const ready = vi.fn();
    const { unmount } = render(<KliniuSequenceScene {...base} onReady={ready} onError={failed} />);
    const lost = new Event('webglcontextlost', { cancelable: true });
    fireEvent(canvas, lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(failed).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalled();
    unmount();
    const lateLoss = new Event('webglcontextlost', { cancelable: true });
    fireEvent(canvas, lateLoss);
    expect(lateLoss.defaultPrevented).toBe(false);
    expect(failed).toHaveBeenCalledOnce();
  });

  it.each([true, false])('reports an already lost context without marking the scene ready (model suspended: %s)', suspended => {
    renderer.suspend = suspended;
    contextLost = true;
    const failed = vi.fn();
    const ready = vi.fn();
    render(<KliniuSequenceScene {...base} onReady={ready} onError={failed} />);
    expect(failed).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalled();
  });

  it('makes the canvas focusable and turns the camera with the keyboard', () => {
    renderer.suspend = false;
    render(<KliniuSequenceScene {...base} onReady={vi.fn()} onError={vi.fn()} />);
    expect(canvas.tabIndex).toBe(0);
    expect(canvas.getAttribute('aria-label')).toContain('Flechas');
    act(() => renderer.frame?.({}, 1 / 60));
    const before = camera.position.clone();
    act(() => { fireEvent.keyDown(canvas, { key: 'ArrowRight' }); });
    expect(camera.position.distanceTo(before)).toBeGreaterThan(0.01);
    act(() => {
      fireEvent.keyDown(canvas, { key: 'Home' });
      renderer.frame?.({}, 1 / 60);
    });
    expect(camera.position.toArray()).toEqual([3, 3.6, 5]);
  });
});
