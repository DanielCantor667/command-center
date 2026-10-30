'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState } from 'react';

/**
 * The room's light is baked into its lightmaps; these lights only shade what moves (robots,
 * drones, cat) and the plants, matching the night bake: dim warm lamps, cyan cone over the table, the
 * purple monitor. The panels only feed the reflections over the bake: the screens, the neon and the city window.
 */
const LAMPS: [number, number, number][] = [[-2.2, 2.1, -1.35], [1.4, 2.1, -2.2], [.3, 2.1, -3.4]];
const REFLECTION_PANELS = <>
  <Lightformer position={[4, 1.2, -3]} rotation={[0, -Math.PI / 2, 0]} scale={[1.6, .7, 1]} intensity={3} color="#6a4cff" />
  <Lightformer position={[1.25, 1.8, -5]} scale={[3, 2.4, 1]} intensity={1.4} color="#6f9bff" />
  <Lightformer position={[0, 3.1, -1.4]} rotation={[Math.PI / 2, 0, 0]} scale={[4, 1, 1]} intensity={.5} color="#ffc48a" />
</>;

export function WorkshopLighting() {
  const { size } = useThree();
  // Captured once per visit; replacing the target on resize retains a PMREM texture in Three 0.171.
  const [reflectionResolution] = useState(() => size.width <= 700 ? 32 : 64);
  return <>
    <hemisphereLight args={['#5a6fb0', '#120d1c', .3]} />
    {LAMPS.map(position => <pointLight key={position.join()} position={position} color="#ffb878" intensity={.9} distance={4.5} decay={2} />)}
    <pointLight position={[-2.2, 2.7, -1.5]} color="#5ad8ff" intensity={1.6} distance={3.5} decay={2} />
    <pointLight position={[3.3, 1.2, -3.0]} color="#8a5cff" intensity={1.2} distance={2.5} decay={2} />
    <Environment resolution={reflectionResolution} frames={1}>{REFLECTION_PANELS}</Environment>
  </>;
}
