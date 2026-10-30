'use client';

import { addAfterEffect, Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { NoToneMapping } from 'three';
import { useGLTF } from '@react-three/drei';
import { CameraController, type WorldCameraHandle } from './camera-controller';
import { DomScreenLayer } from './dom-screens';
import { labEssentialUrls } from './lab';
import type { LabFocus } from './lab-focus';
import { LabScene } from './lab-scene';
import { WORLD_VIEWS, type WorldCameraSnapshot, type WorldPoint } from './world-state';
import { WorkshopLighting } from './workshop-lighting';
import { AmbientLife } from './workshop-life';
import { WorkshopPostprocessing } from './workshop-postprocessing';

export function resetWorkshopResource() { useGLTF.clear(labEssentialUrls()); }

export interface WorldSceneProps {
  suspended: boolean; point: WorldPoint; moving: boolean; token: number; reducedMotion: boolean;
  initialCamera: WorldCameraSnapshot | null; cameraHandle: MutableRefObject<WorldCameraHandle | null>;
  onReady: (token: number) => void; onArrived: (token: number) => void; onError: (token: number) => void;
  onGo: (point: WorldPoint) => void; onOpenCase: (id: string) => void; onTechnology: (technologyId: string) => void; onPreparing: () => void;
  focus: LabFocus; onFocus: (focus: LabFocus) => void;
  closeUp: boolean; onCloseUp: () => void; onComputer: () => void;
}
function SceneLifecycle({ token, onReady, onError, onPreparing }: Pick<WorldSceneProps, 'token' | 'onReady' | 'onError' | 'onPreparing'>) {
  const { gl, invalidate } = useThree();
  const loadToken = useRef(token);
  const callbacks = useRef({ onReady, onError, onPreparing, token });
  callbacks.current = { onReady, onError, onPreparing, token };
  useEffect(() => {
    callbacks.current.onPreparing();
    const before = gl.info.render.frame;
    let delivered = false;
    const removeAfterEffect = addAfterEffect(() => {
      if (!delivered && !gl.getContext().isContextLost() && gl.info.render.frame > before) {
        delivered = true;
        callbacks.current.onReady(loadToken.current);
      }
    });
    invalidate();
    return () => {
      removeAfterEffect();
    };
  }, [gl, invalidate]);
  return null;
}

function RendererLifecycle({ token, onError, suspended }: Pick<WorldSceneProps, 'token' | 'onError' | 'suspended'>) {
  const { gl, invalidate, set } = useThree();
  const paused = useRef(suspended); paused.current = suspended;
  useEffect(() => { set({ frameloop: suspended || document.hidden ? 'never' : 'demand' }); if (!suspended && !document.hidden) invalidate(); }, [suspended, set, invalidate]);
  const error = useRef({ token, onError });
  error.current = { token, onError };
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); error.current.onError(error.current.token); };
    const visibility = () => { set({ frameloop: paused.current || document.hidden ? 'never' : 'demand' }); if (!paused.current && !document.hidden) invalidate(); };
    canvas.addEventListener('webglcontextlost', lost);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [gl, invalidate, set]);
  return null;
}

export function WorldScene(props: WorldSceneProps) {
  const [dpr, setDpr] = useState(1);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    const update = () => setDpr(window.innerWidth <= 700 ? 1 : Math.min(window.devicePixelRatio, 2));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const start = props.initialCamera ?? WORLD_VIEWS[props.moving ? 'entrance' : props.point];
  // Canvas reapplies its props after resize; keep visibility in the declarative pause too.
  // No tone mapping: the baked lightmaps already carry the Blender view transform.
  // Alpha: the DOM screens show through holes in the canvas (dom-screens.tsx); isolation keeps their layer inside the canvas box.
  return <Canvas style={{ isolation: 'isolate' }} frameloop={props.suspended || hidden ? 'never' : 'demand'} dpr={dpr} camera={{ fov: 54, near: .05, far: 40, position: start.position }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: NoToneMapping }}>
    <color attach="background" args={['#05090b']} />
    <RendererLifecycle token={props.token} onError={props.onError} suspended={props.suspended} />
    <DomScreenLayer />
    <Suspense fallback={null}>
      <WorkshopLighting />
      <AmbientLife reducedMotion={props.reducedMotion} suspended={props.suspended} />
      <WorkshopPostprocessing />
      <LabScene point={props.point} focus={props.focus} onFocus={props.onFocus} onGo={props.onGo} onOpenCase={props.onOpenCase} onTechnology={props.onTechnology} onComputer={props.onComputer} />
      <CameraController point={props.point} moving={props.moving} token={props.token} initialCamera={props.initialCamera} reducedMotion={props.reducedMotion} onArrived={props.onArrived} cameraHandle={props.cameraHandle} suspended={props.suspended} closeUp={props.closeUp} onCloseUp={props.onCloseUp} />
      <SceneLifecycle token={props.token} onReady={props.onReady} onError={props.onError} onPreparing={props.onPreparing} />
    </Suspense>
  </Canvas>;
}
