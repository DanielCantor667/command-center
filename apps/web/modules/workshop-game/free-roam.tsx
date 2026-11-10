'use client';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Euler, Vector3 } from 'three';
import { EYE_HEIGHT, nearestFree, slide, spotInView, walkInput, type WalkSpot } from './free-walk';

const SPEED = 2.1, SENSITIVITY = .0022, PITCH_LIMIT = 1.35;
const KEYS: Record<string, ['forward' | 'strafe', number]> = {
  KeyW: ['forward', 1], ArrowUp: ['forward', 1], KeyS: ['forward', -1], ArrowDown: ['forward', -1],
  KeyD: ['strafe', 1], ArrowRight: ['strafe', 1], KeyA: ['strafe', -1], ArrowLeft: ['strafe', -1],
};

/** The free walk: first-person camera, pointer lock and the "what am I looking at" check. Renders nothing. */
export function FreeRoam<T>({ spots, onExit, onSpot, onSelect }: { spots: readonly WalkSpot<T>[]; onExit: () => void; onSpot: (spot: T | null) => void; onSelect: (spot: T) => void }) {
  const { camera, gl, invalidate } = useThree();
  const look = useRef(new Euler(0, 0, 0, 'YXZ'));
  const current = useRef<T | null>(null);
  const handlers = useRef({ onExit, onSpot, onSelect }); handlers.current = { onExit, onSpot, onSelect };
  useEffect(() => {
    const canvas = gl.domElement;
    look.current.setFromQuaternion(camera.quaternion);
    look.current.x = 0;
    const [x, z] = nearestFree(camera.position.x, camera.position.z);
    camera.position.set(x, EYE_HEIGHT, z);
    Object.assign(walkInput, { forward: 0, strafe: 0, yaw: 0, pitch: 0 });
    const pressed = new Set<string>();
    const update = () => {
      walkInput.forward = walkInput.strafe = 0;
      pressed.forEach(code => { const [axis, sign] = KEYS[code]!; walkInput[axis] += sign; });
    };
    let dragging = false, moved = false, startX = 0, startY = 0, lastX = 0, lastY = 0;
    const reset = () => {
      pressed.clear();
      dragging = false; moved = false;
      Object.assign(walkInput, { forward: 0, strafe: 0, yaw: 0, pitch: 0 });
    };
    const select = () => { if (current.current) handlers.current.onSelect(current.current); };
    const keydown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') { handlers.current.onExit(); return; }
      const target = event.target;
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        (target instanceof Element && target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))) return;
      if (event.code === 'KeyE' || event.code === 'Enter') { select(); return; }
      if (KEYS[event.code]) { event.preventDefault(); pressed.add(event.code); update(); }
    };
    const keyup = (event: KeyboardEvent) => { pressed.delete(event.code); update(); };
    // Without pointer lock, a short click selects and a drag rotates the view.
    const mousedown = (event: MouseEvent) => {
      if (event.button !== 0 || document.pointerLockElement === canvas) return;
      dragging = true; moved = false; startX = lastX = event.clientX; startY = lastY = event.clientY;
    };
    const mouseup = () => { dragging = false; };
    const mousemove = (event: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        walkInput.yaw += event.movementX || 0; walkInput.pitch += event.movementY || 0;
      } else if (dragging && event.buttons) {
        if (Math.hypot(event.clientX - startX, event.clientY - startY) >= 5) moved = true;
        walkInput.yaw += event.clientX - lastX; walkInput.pitch += event.clientY - lastY;
        lastX = event.clientX; lastY = event.clientY;
      }
    };
    let locked = false;
    const lockChange = () => {
      const now = document.pointerLockElement === canvas;
      if (locked && !now) handlers.current.onExit(); // Esc under pointer lock never reaches keydown
      locked = now;
    };
    const click = (event: MouseEvent) => { if (event.button === 0 && (locked || !moved)) select(); };
    const visibility = () => { if (document.hidden) reset(); };
    if (!matchMedia('(pointer: coarse)').matches && typeof canvas.requestPointerLock === 'function') {
      try { Promise.resolve(canvas.requestPointerLock()).catch(() => { /* drag to look */ }); }
      catch { /* browsers may throw synchronously */ }
    }
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup); window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', visibility); document.addEventListener('pointerlockchange', lockChange);
    canvas.addEventListener('mousedown', mousedown); canvas.addEventListener('click', click);
    invalidate();
    return () => {
      window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup); window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', visibility); document.removeEventListener('pointerlockchange', lockChange);
      canvas.removeEventListener('mousedown', mousedown); canvas.removeEventListener('click', click);
      reset();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      handlers.current.onSpot(null);
    };
  }, [camera, gl, invalidate]);
  const forward = useRef(new Vector3());
  useFrame((_, delta) => {
    invalidate(); // the demand loop stops otherwise; only this mode draws continuously for the camera
    const view = look.current;
    view.y -= walkInput.yaw * SENSITIVITY;
    view.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, view.x - walkInput.pitch * SENSITIVITY));
    walkInput.yaw = walkInput.pitch = 0;
    camera.quaternion.setFromEuler(view);
    const step = Math.min(delta, .05) * SPEED, sin = Math.sin(view.y), cos = Math.cos(view.y);
    const size = Math.hypot(walkInput.forward, walkInput.strafe) || 1, f = walkInput.forward / size * step, s = walkInput.strafe / size * step;
    const [x, z] = slide(camera.position.x, camera.position.z, -sin * f + cos * s, -cos * f - sin * s);
    camera.position.set(x, EYE_HEIGHT, z);
    camera.getWorldDirection(forward.current);
    const seen = spotInView(spots, x, z, forward.current.x, forward.current.z, forward.current.y);
    if (seen !== current.current) { current.current = seen; handlers.current.onSpot(seen); }
  });
  return null;
}
