'use client';
import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import { ambient } from './ambient';
import { SRGBColorSpace } from 'three';
import { cloneWorkshopModel } from './model-instance';
import { propUrl, type WorkshopArt, type WorkshopProp } from './props';

/** Decoration is optional: a failed prop or print never fails the room or the workshop. */
export class OptionalBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}
/** Shadows are baked on demand (autoUpdate is off), so late arrivals request one pass. */
function useShadowRefresh() {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    gl.shadowMap.needsUpdate = true; invalidate();
    return () => { gl.shadowMap.needsUpdate = true; invalidate(); };
  }, [gl, invalidate]);
}
function PropModel({ id, position, turn }: WorkshopProp) {
  const { scene } = useGLTF(propUrl(id));
  const model = useMemo(() => cloneWorkshopModel(scene), [scene]);
  useShadowRefresh();
  const group = useRef<Group>(null);
  // Kliniu's seal breathes and nods; everything else stays still.
  useFrame(() => {
    if (id !== 'seal' || !group.current) return;
    const t = ambient.enabled ? ambient.time.value : 0;
    group.current.position.y = Math.sin(t * 2.2) * .006;
    group.current.rotation.set(0, Math.sin(t * .9) * .09, Math.sin(t * 1.7) * .025);
  });
  return <group position={position} rotation={[0, turn, 0]}><group ref={group}><primitive object={model} dispose={null} /></group></group>;
}
function ArtPrint({ url, position, size }: WorkshopArt) {
  const texture = useTexture(url);
  useEffect(() => { texture.colorSpace = SRGBColorSpace; texture.anisotropy = 4; texture.needsUpdate = true; }, [texture]);
  useShadowRefresh();
  return <group position={position}>
    <mesh castShadow receiveShadow><boxGeometry args={[size[0] + .1, size[1] + .1, .035]} /><meshStandardMaterial color="#9f7e5a" roughness={.6} /></mesh>
    <mesh position={[0, 0, .019]}><planeGeometry args={size} /><meshStandardMaterial map={texture} roughness={.9} /></mesh>
  </group>;
}
export function WorkshopProps({ props = [], art = [] }: { props?: WorkshopProp[]; art?: WorkshopArt[] }) {
  return <>
    {props.map((item, index) => <OptionalBoundary key={`${item.id}-${index}`}><Suspense fallback={null}><PropModel {...item} /></Suspense></OptionalBoundary>)}
    {art.map(item => <OptionalBoundary key={item.url}><Suspense fallback={null}><ArtPrint {...item} /></Suspense></OptionalBoundary>)}
  </>;
}
