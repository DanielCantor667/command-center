'use client';
import { useTexture } from '@react-three/drei';
import { useEffect } from 'react';
import { BackSide, MirroredRepeatWrapping, SRGBColorSpace } from 'three';
import { OptionalBoundary } from './workshop-props';

export const WORKSHOP_BACKDROP_URL = '/models/workshop-game/env/bogota-v1.webp';
const RADIUS = 36;
const HEIGHT = 36;

function Panorama() {
  const texture = useTexture(WORKSHOP_BACKDROP_URL);
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = MirroredRepeatWrapping;
    texture.repeat.set(3, 1);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  // Three mirrored repeats keep the 2048px image sharp (each covers 120 degrees) and hide the seams.
  return <mesh position={[0, 8, 0]} renderOrder={-1}>
    <cylinderGeometry args={[RADIUS, RADIUS, HEIGHT, 64, 1, true]} />
    <meshBasicMaterial map={texture} side={BackSide} fog={false} depthWrite={false} />
  </mesh>;
}

/** Optional: if the image fails, the windows keep the flat background colour. */
export function WorkshopBackdrop() {
  return <OptionalBoundary><Panorama /></OptionalBoundary>;
}
