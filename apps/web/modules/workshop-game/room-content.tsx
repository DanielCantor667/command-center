'use client';
import Image from 'next/image';
import { Html, useGLTF } from '@react-three/drei';
import { addAfterEffect, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { cloneWorkshopModel } from './model-instance';
import { WORKSHOP_ROOMS, type RoomId } from './rooms';
import styles from './workshop-game.module.css';

interface RoomProps { room: RoomId; token: number; onReady: (room: RoomId, token: number) => void; onError: (room: RoomId, token: number) => void }
class RoomBoundary extends Component<RoomProps & { children: ReactNode }, { failed: boolean; token: number }> {
  state = { failed: false, token: this.props.token };
  static getDerivedStateFromProps(props: RoomProps, state: { token: number }) { return props.token !== state.token ? { failed: false, token: props.token } : null; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(this.props.room, this.props.token); }
  render() { return this.state.failed ? null : this.props.children; }
}
const screens: Record<RoomId, { position: [number, number, number]; rotation: [number, number, number]; size: [number, number] }> = {
  kliniu: { position: [-5.1, 1.56, -7.145], rotation: [0, 0, 0], size: [1.84, 1.04] },
  lorigine: { position: [4.8, 1.66, -6.765], rotation: [0, 0, 0], size: [1.82, 1.02] },
  academy: { position: [-8.71, 1.9, 5.7], rotation: [0, Math.PI / 2, 0], size: [1.5, .84] },
  drokex: { position: [8.76, 1.75, 5.7], rotation: [0, -Math.PI / 2, 0], size: [1.55, .87] },
};
function RoomModel({ room, token, onReady }: RoomProps) {
  const resource = useGLTF(WORKSHOP_ROOMS[room].url);
  const model = useMemo(() => cloneWorkshopModel(resource.scene), [resource.scene]);
  const { gl, invalidate } = useThree();
  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
    const before = gl.info.render.frame;
    let delivered = false;
    const remove = addAfterEffect(() => {
      if (!delivered && !gl.getContext().isContextLost() && gl.info.render.frame > before) {
        delivered = true; onReady(room, token);
      }
    });
    invalidate();
    return () => { remove(); gl.shadowMap.needsUpdate = true; invalidate(); };
  }, [gl, invalidate, room, token, onReady]);
  const screen = screens[room];
  return <group>
    <primitive object={model} dispose={null} />
    <Html transform occlude pointerEvents="none" distanceFactor={1} position={screen.position} rotation={screen.rotation} style={{ pointerEvents: 'none' }}>
      <div className={styles.evidenceScreen} aria-hidden="true" style={{ width: screen.size[0] * 400, height: screen.size[1] * 400 }}>
        <Image src={WORKSHOP_ROOMS[room].evidence} alt="" fill sizes="768px" />
      </div>
    </Html>
  </group>;
}
export function RoomContent(props: RoomProps) {
  return <RoomBoundary {...props}><Suspense fallback={null}><RoomModel {...props} /></Suspense></RoomBoundary>;
}
