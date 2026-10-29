'use client';
import { addAfterEffect, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { NoBlending, Scene } from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { LabAnchor } from './lab-anchors';

/**
 * DOM screens (the halloween.dev technique): real HTML laid on the 3D screens by a CSS3D layer behind the canvas.
 * Each screen mesh writes alpha 0, so the canvas shows the HTML through it and whatever passes in front still covers it.
 * The canvas needs `alpha: true`, and the bloom must leave alpha alone (workshop-postprocessing.tsx).
 */
const screens = new Scene();

export function DomScreenLayer() {
  const { gl, camera, size } = useThree();
  const renderer = useMemo(() => new CSS3DRenderer(), []);
  useLayoutEffect(() => {
    const element = renderer.domElement;
    Object.assign(element.style, { position: 'absolute', inset: '0', zIndex: '-1', pointerEvents: 'none' });
    // Decoration: the same content is in the panels, readers must not hear it twice.
    element.setAttribute('aria-hidden', 'true');
    gl.domElement.before(element);
    return () => element.remove();
  }, [gl, renderer]);
  useEffect(() => renderer.setSize(size.width, size.height), [renderer, size.width, size.height]);
  // After the frame's render, so the HTML follows the camera of that same frame (no one-frame lag while it moves).
  useEffect(() => addAfterEffect(() => renderer.render(screens, camera)), [renderer, camera]);
  return null;
}

type ScreenEvents = {
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
};

/** One HTML screen `width` CSS px wide on an anchor; `brightness` (0–1) dims it like the textured screens. */
export function DomScreen({ anchor, width, brightness, className, children, ...events }: ScreenEvents & {
  anchor: LabAnchor; width: number; brightness?: { current: number }; className?: string; children: ReactNode;
}) {
  const [x, y, z] = anchor.position;
  const height = Math.round(width * anchor.size[1] / anchor.size[0]);
  const object = useMemo(() => new CSS3DObject(document.createElement('div')), []);
  const root = useRef<Root | null>(null);
  useLayoutEffect(() => {
    Object.assign(object.element.style, { width: `${width}px`, height: `${height}px`, overflow: 'hidden' });
    object.position.set(x, y, z);
    object.rotation.set(0, anchor.rotationY, 0);
    object.scale.setScalar(anchor.size[0] / width);
    screens.add(object);
    return () => { screens.remove(object); };
  }, [object, x, y, z, anchor.rotationY, anchor.size, width, height]);
  useLayoutEffect(() => {
    // A fresh host per root: a remount (StrictMode) must not share a container with the root still unmounting.
    const host = object.element.appendChild(document.createElement('div'));
    host.style.cssText = 'width:100%;height:100%;box-sizing:border-box';
    host.className = className ?? '';
    const current = root.current = createRoot(host);
    // Deferred: unmounting a root synchronously while React renders the scene warns.
    return () => { root.current = null; queueMicrotask(() => { current.unmount(); host.remove(); }); };
  }, [object, className]);
  useLayoutEffect(() => { root.current?.render(children); }, [children, className]);
  useFrame(() => {
    const filter = brightness && brightness.current < .999 ? `brightness(${brightness.current.toFixed(3)})` : '';
    if (object.element.style.filter !== filter) object.element.style.filter = filter;
  });
  return <mesh position={anchor.position} rotation={[0, anchor.rotationY, 0]} {...events}>
    <planeGeometry args={anchor.size} />
    <meshBasicMaterial color="black" transparent opacity={0} blending={NoBlending} />
  </mesh>;
}
