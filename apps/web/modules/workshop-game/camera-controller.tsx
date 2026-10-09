'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type MutableRefObject } from 'react';
import { Vector3 } from 'three';
import { WORLD_VIEWS, type WorldCameraSnapshot, type WorldPoint } from './world-state';
import { cameraPath } from './world-path';

export interface WorldCameraHandle { capture(): WorldCameraSnapshot }
export function CameraController({ point, moving, token, initialCamera, reducedMotion, onArrived, cameraHandle, suspended }: {
  point: WorldPoint; moving: boolean; token: number; initialCamera: WorldCameraSnapshot | null;
  reducedMotion: boolean; onArrived: (token: number) => void; cameraHandle: MutableRefObject<WorldCameraHandle | null>; suspended: boolean;
}) {
  const { camera, gl, invalidate } = useThree();
  const paused = useRef(suspended); paused.current = suspended;
  const target = useRef(new Vector3(...(initialCamera ?? WORLD_VIEWS.entrance).target));
  const destination = useRef({ position: new Vector3(), target: new Vector3() });
  const travelling = useRef(false);
  const callback = useRef(onArrived);
  callback.current = onArrived;
  const currentToken = useRef(token);
  const initialized = useRef(false);
  const savedInitial = useRef(initialCamera);
  const journey = useRef({ points: [] as Vector3[], length: 0, progress: 0, target: new Vector3() });

  useEffect(() => {
    if (!initialized.current) {
      const view = savedInitial.current ?? (moving ? WORLD_VIEWS.entrance : WORLD_VIEWS[point]);
      camera.position.set(...view.position);
      target.current.set(...view.target);
      camera.lookAt(target.current);
      initialized.current = true;
    }
    currentToken.current = token;
    const view = WORLD_VIEWS[point];
    destination.current.position.set(...view.position);
    destination.current.target.set(...view.target);
    travelling.current = moving;
    if (moving) {
      const points = [camera.position.clone(), ...cameraPath(camera.position.toArray() as [number, number, number], view.position).map(p => new Vector3(...p))];
      journey.current = { points, length: points.slice(1).reduce((sum, p, i) => sum + p.distanceTo(points[i]!), 0), progress: 0, target: target.current.clone() };
    }
    // A cancelled trip snaps to its stable destination. Restored camera stays exact on mount.
    if (!moving && !savedInitial.current) {
      camera.position.copy(destination.current.position);
      target.current.copy(destination.current.target);
      camera.lookAt(target.current);
    }
    savedInitial.current = null;
    invalidate();
  }, [camera, invalidate, moving, point, token]);

  useEffect(() => {
    const handle: WorldCameraHandle = { capture: () => ({ position: camera.position.toArray() as [number, number, number], target: target.current.toArray() as [number, number, number] }) };
    cameraHandle.current = handle;
    return () => { if (cameraHandle.current === handle) cameraHandle.current = null; };
  }, [camera, cameraHandle]);

  useEffect(() => {
    const canvas = gl.domElement;
    let drag: { x: number; y: number; base: Vector3 } | null = null;
    const down = (event: PointerEvent) => {
      if (paused.current || travelling.current || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, base: target.current.clone().sub(camera.position) };
    };
    const move = (event: PointerEvent) => {
      if (paused.current || !drag || travelling.current) return;
      const yaw = Math.max(-1.05, Math.min(1.05, (event.clientX - drag.x) * -.003));
      const pitch = Math.max(-.42, Math.min(.42, (event.clientY - drag.y) * .002));
      const offset = drag.base.clone().applyAxisAngle(new Vector3(0, 1, 0), yaw);
      offset.y = drag.base.y + pitch * Math.hypot(offset.x, offset.z);
      target.current.copy(camera.position).add(offset);
      camera.lookAt(target.current);
      invalidate();
    };
    const up = () => { drag = null; };
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, [camera, gl, invalidate]);

  useFrame((_, delta) => {
    if (paused.current || !travelling.current) return;
    const trip = journey.current;
    trip.progress = reducedMotion ? 1 : Math.min(1, trip.progress + Math.min(delta, .06) / 1.6);
    const step = trip.progress * trip.progress * (3 - 2 * trip.progress);
    let remaining = step * trip.length;
    for (let i = 1; i < trip.points.length; i++) {
      const from = trip.points[i - 1]!;
      const to = trip.points[i]!;
      const length = to.distanceTo(from);
      if (remaining <= length || i === trip.points.length - 1) {
        camera.position.copy(from).lerp(to, length ? Math.min(1, remaining / length) : 1);
        break;
      }
      remaining -= length;
    }
    target.current.copy(trip.target).lerp(destination.current.target, step);
    camera.lookAt(target.current);
    if (trip.progress === 1) {
      camera.position.copy(destination.current.position);
      target.current.copy(destination.current.target);
      camera.lookAt(target.current);
      travelling.current = false;
      callback.current(currentToken.current);
    }
    invalidate();
  });
  return null;
}
