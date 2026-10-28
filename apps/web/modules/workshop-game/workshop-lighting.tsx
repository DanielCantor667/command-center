'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState } from 'react';

/**
 * The room's light is baked into its lightmaps; these lights only shade what moves (robots,
 * drones, cat) and the plants, matching the bake: warm hanging lamps, cyan cone over the table.
 */
const LAMPS: [number, number, number][] = [[-2.2, 2.1, -1.35], [1.4, 2.1, -2.2], [.3, 2.1, -3.4]];
const REFLECTION_PANELS = <>
  <Lightformer position={[0, 3, -1]} rotation={[Math.PI / 2, 0, 0]} scale={[5, 4, 1]} intensity={.8} color="#ffd9b0" />
  <Lightformer position={[0, 1.7, -5]} scale={[4, 2, 1]} intensity={.6} color="#2fb8d0" />
</>;

export function WorkshopLighting() {
  const { size } = useThree();
  // Captured once per visit; replacing the target on resize retains a PMREM texture in Three 0.171.
  const [reflectionResolution] = useState(() => size.width <= 700 ? 32 : 64);
  return <>
    <hemisphereLight args={['#7fb8c8', '#2a1d14', .7]} />
    {LAMPS.map(position => <pointLight key={position.join()} position={position} color="#ffb878" intensity={2.4} distance={4.5} decay={2} />)}
    <pointLight position={[-2.2, 2.7, -1.5]} color="#5ad8ff" intensity={3} distance={3.5} decay={2} />
    <pointLight position={[3.3, 1.2, -3.0]} color="#8a5cff" intensity={1.2} distance={2.5} decay={2} />
    <Environment resolution={reflectionResolution} frames={1}>{REFLECTION_PANELS}</Environment>
  </>;
}
