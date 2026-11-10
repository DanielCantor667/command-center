'use client';

import { useGLTF } from '@react-three/drei';
import { labUrl } from './lab';

/** Optional static streaks, exported in the workshop's world coordinates. */
export function LabRain() {
  const { scene } = useGLTF(labUrl('lab-rain'));
  return <primitive object={scene} dispose={null} />;
}
