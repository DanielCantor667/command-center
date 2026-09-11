'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, MeshStandardMaterial } from 'three';

function Block({ position, size, color, radius = .04 }: { position: [number, number, number]; size: [number, number, number]; color: string; radius?: number }) {
  return <RoundedBox position={position} args={size} radius={radius} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.48} metalness={.12} /></RoundedBox>;
}

/** Conceptual product architecture, not a reproduction of a Kliniu office. */
export function KliniuDistrict({ active, reducedMotion }: { active: boolean; reducedMotion?: boolean }) {
  const assembly = useRef<Group>(null);
  const canopy = useRef<Group>(null);
  const signal = useRef<MeshStandardMaterial>(null);
  const progress = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [active, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    if (!assembly.current || !canopy.current || !signal.current) return;
    const step = reducedMotion ? 1 : 1 - Math.exp(-9 * Math.min(delta, .05));
    progress.current = reducedMotion ? 1 : Math.min(1, progress.current + delta / .85);
    assembly.current.position.y = -.38 * Math.pow(1 - progress.current, 3);
    const target = active ? .1 : 0;
    canopy.current.position.y += (target - canopy.current.position.y) * step;
    signal.current.emissiveIntensity += ((active ? .65 : .08) - signal.current.emissiveIntensity) * step;
    if (progress.current < 1 || Math.abs(canopy.current.position.y - target) > .0001 || Math.abs(signal.current.emissiveIntensity - (active ? .65 : .08)) > .001) invalidate();
  });
  return <group ref={assembly} rotation={[0, -.25, 0]}>
    <Block position={[0, .04, 0]} size={[2, .13, 1.75]} color="#adc3c3" />
    <Block position={[-.38, .96, -.22]} size={[.92, 1.75, .68]} color="#edf5f4" radius={.15} />
    <Block position={[-.38, .97, .13]} size={[.38, .92, .035]} color="#153f47" radius={.015} />
    <mesh position={[-.38, .87, .154]}><boxGeometry args={[.19, .53, .014]} /><meshStandardMaterial ref={signal} color="#19acb8" emissive="#19acb8" emissiveIntensity={.08} roughness={.24} /></mesh>
    {[.73, .88, 1.03].map(y => <Block key={y} position={[-.21, y, .163]} size={[.045, .015, .012]} color="#edf5f4" radius={.004} />)}
    <Block position={[-.38, .32, .21]} size={[.42, .16, .26]} color="#153f47" />
    <Block position={[-.38, .2, .31]} size={[.14, .08, .12]} color="#9baeb0" radius={.02} />
    <group ref={canopy}>
      <Block position={[.45, .87, .1]} size={[.92, .1, 1.14]} color="#169eaa" />
      <Block position={[.45, .95, .1]} size={[.7, .06, .86]} color="#d9eded" radius={.025} />
    </group>
    {[-.01, .9].map(x => <Block key={x} position={[x, .47, .59]} size={[.035, .75, .035]} color="#658d91" radius={.008} />)}
    <Block position={[.45, .45, -.38]} size={[.9, .7, .07]} color="#153f47" />
    {[.2, .48, .75].map(x => <group key={x}>
      <Block position={[x, .33, .07]} size={[.19, .4, .22]} color="#f3f8f7" radius={.045} />
      <Block position={[x, .36, .189]} size={[.08, .16, .016]} color="#20a9b2" radius={.012} />
    </group>)}
    {[0, 1, 2].map(i => <Block key={i} position={[-.7 + i * .26, .15, .65]} size={[.19, .16, .23]} color={i === 1 ? '#1b929e' : '#bbcaca'} radius={.015} />)}
    <Block position={[.42, .115, .76]} size={[.8, .025, .12]} color="#153f47" radius={.008} />
  </group>;
}
