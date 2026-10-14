'use client';

import { addAfterEffect, Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { CameraController, type WorldCameraHandle } from './camera-controller';
import { WorkshopGeometry } from './workshop-geometry';
import { WORLD_VIEWS, type WorldCameraSnapshot, type WorldPoint } from './world-state';
import { useGLTF } from '@react-three/drei';
import { WORKSHOP_RESOURCE_URLS } from './workshop-assets';
import { RoomContent } from './room-content';
import { WORKSHOP_ROOMS, type RoomId } from './rooms';
import { WorkshopLighting } from './workshop-lighting';
import { AmbientLife } from './workshop-life';
import { WorkshopBackdrop } from './workshop-backdrop';
import { WorkshopPostprocessing } from './workshop-postprocessing';
import { HUB_ART, HUB_PROPS } from './props';
import { WorkshopProps } from './workshop-props';
import { DeskLaptop } from './desk-laptop';
import { DeskHero } from './desk-hero';

export function resetWorkshopResource() { useGLTF.clear(WORKSHOP_RESOURCE_URLS); }

export function resetRoomResource(room: RoomId) { useGLTF.clear(WORKSHOP_ROOMS[room].url); }

export interface WorldSceneProps {
  suspended: boolean; activeRoom: RoomId | null; pendingRoom: RoomId | null; roomMoving: boolean;
  onRoomReady: (room: RoomId, token: number) => void; onRoomError: (room: RoomId, token: number) => void;
  point: WorldPoint; moving: boolean; token: number; opened: boolean; reducedMotion: boolean;
  initialCamera: WorldCameraSnapshot | null; cameraHandle: MutableRefObject<WorldCameraHandle | null>;
  onReady: (token: number) => void; onArrived: (token: number) => void; onError: (token: number) => void;
  onGo: (point: WorldPoint) => void; onTechnology?: (technologyId: string) => void; onPreparing: () => void;
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
    const update = () => setDpr(window.innerWidth <= 700 ? 1 : Math.min(window.devicePixelRatio, 1.5));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const start = props.initialCamera ?? WORLD_VIEWS[props.opened && !props.moving ? props.point : 'entrance'];
  // Canvas reapplies its props after resize; keep visibility in the declarative pause too.
  return <Canvas shadows="percentage" frameloop={props.suspended || hidden ? 'never' : 'demand'} dpr={dpr} camera={{ fov: 58, near: .1, far: 80, position: start.position }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#d8dfda']} />
    <fog attach="fog" args={['#d8dfda', 28, 60]} />
    <RendererLifecycle token={props.token} onError={props.onError} suspended={props.suspended} />
    <Suspense fallback={null}>
      <WorkshopLighting />
      <WorkshopBackdrop />
      <AmbientLife reducedMotion={props.reducedMotion} suspended={props.suspended} />
      <WorkshopPostprocessing />
      <WorkshopGeometry opened={props.opened} point={props.point} reducedMotion={props.reducedMotion} onGo={props.onGo} onTechnology={props.onTechnology} suspended={props.suspended} openRooms={[...new Set([props.activeRoom, props.roomMoving ? props.pendingRoom : null].filter((id): id is RoomId => !!id))]} />
      <WorkshopProps props={HUB_PROPS} art={HUB_ART} />
      <DeskLaptop position={[1.0, 1.0, .15]} turn={.28} />
      <DeskHero point={props.point} reducedMotion={props.reducedMotion} onGo={props.onGo} />
      <CameraController point={props.point} moving={props.moving} token={props.token} initialCamera={props.initialCamera} reducedMotion={props.reducedMotion} onArrived={props.onArrived} cameraHandle={props.cameraHandle} suspended={props.suspended} />
      {[...new Set([props.activeRoom, props.pendingRoom].filter((id): id is RoomId => !!id))].map(room => <RoomContent key={room} room={room} token={props.token} onReady={props.onRoomReady} onError={props.onRoomError} />)}
      <SceneLifecycle token={props.token} onReady={props.onReady} onError={props.onError} onPreparing={props.onPreparing} />
    </Suspense>
  </Canvas>;
}
