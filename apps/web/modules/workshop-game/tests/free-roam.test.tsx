import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PerspectiveCamera } from 'three';
import { FreeRoam } from '../free-roam';
import { walkInput } from '../free-walk';

const renderer = vi.hoisted(() => ({ current: {} as Record<string, unknown>, frame: (() => {}) as () => void }));
vi.mock('@react-three/fiber', () => ({
  useThree: () => renderer.current,
  useFrame: (callback: (state: unknown, delta: number) => void) => { renderer.frame = () => callback({}, .016); },
}));

function mount(requestLock?: () => void | Promise<void>) {
  const canvas = document.createElement('canvas');
  if (requestLock) Object.defineProperty(canvas, 'requestPointerLock', { value: requestLock });
  else Object.defineProperty(canvas, 'requestPointerLock', { value: undefined });
  document.body.appendChild(canvas);
  const camera = new PerspectiveCamera();
  camera.position.set(0, 1.6, 1);
  renderer.current = { camera, gl: { domElement: canvas }, invalidate: vi.fn() };
  const onSelect = vi.fn(), onExit = vi.fn();
  const view = render(<FreeRoam spots={[{ at: [0, 1.6, 0], item: 'spot' }]} onExit={onExit} onSpot={() => {}} onSelect={onSelect} />);
  act(() => renderer.frame());
  return { canvas, onSelect, onExit, view };
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  Object.defineProperty(document, 'pointerLockElement', { configurable: true, value: null });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); document.querySelectorAll('canvas').forEach(canvas => canvas.remove()); });

describe('free walk input', () => {
  it.each([undefined, () => { throw new Error('denied'); }])('falls back when pointer lock is unavailable or throws synchronously', requestLock => {
    const { canvas, onSelect } = mount(requestLock);
    fireEvent.mouseDown(canvas, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseUp(canvas, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.click(canvas, { button: 0, clientX: 10, clientY: 10 });
    expect(onSelect).toHaveBeenCalledWith('spot');
  });

  it('does not select when a drag ends with a click', () => {
    const { canvas, onSelect } = mount(() => Promise.reject(new Error('denied')));
    fireEvent.mouseDown(canvas, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { buttons: 1, clientX: 30, clientY: 10, movementX: 20 });
    fireEvent.mouseUp(canvas, { button: 0, clientX: 30, clientY: 10 });
    expect(walkInput.yaw).toBe(20);
    fireEvent.click(canvas, { button: 0, clientX: 30, clientY: 10 });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.mouseDown(canvas, { button: 0, clientX: 30, clientY: 10 });
    fireEvent.mouseUp(canvas, { button: 0, clientX: 30, clientY: 10 });
    fireEvent.click(canvas, { button: 0, clientX: 30, clientY: 10 });
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('selects while locked and exits when the lock is released', () => {
    const { canvas, onSelect, onExit } = mount(() => {});
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, value: canvas });
    fireEvent(document, new Event('pointerlockchange'));
    fireEvent.click(canvas, { button: 0 });
    expect(onSelect).toHaveBeenCalledWith('spot');
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, value: null });
    fireEvent(document, new Event('pointerlockchange'));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('clears stuck movement and look input on blur or a hidden tab', () => {
    mount(() => {});
    fireEvent.keyDown(window, { code: 'KeyW' });
    walkInput.yaw = 12;
    fireEvent.blur(window);
    expect(walkInput).toMatchObject({ forward: 0, strafe: 0, yaw: 0, pitch: 0 });
    fireEvent.keyDown(window, { code: 'KeyD' });
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(walkInput).toMatchObject({ forward: 0, strafe: 0, yaw: 0, pitch: 0 });
  });

  it('does not hijack keys from controls or modifier shortcuts, while Escape still exits', () => {
    const { onSelect, onExit } = mount(() => {});
    const button = document.createElement('button');
    document.body.appendChild(button);
    fireEvent.keyDown(button, { code: 'Enter' });
    fireEvent.keyDown(button, { code: 'KeyW' });
    fireEvent.keyDown(window, { code: 'KeyE', ctrlKey: true });
    fireEvent.keyDown(window, { code: 'KeyD', metaKey: true });
    expect(onSelect).not.toHaveBeenCalled();
    expect(walkInput.forward).toBe(0);
    expect(walkInput.strafe).toBe(0);
    fireEvent.keyDown(button, { code: 'Escape' });
    expect(onExit).toHaveBeenCalledOnce();
    button.remove();
  });
});
