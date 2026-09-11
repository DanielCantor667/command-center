'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, MeshStandardMaterial } from 'three';

function Module({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <RoundedBox position={position} args={size} radius={.025} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.55} metalness={.18} /></RoundedBox>;
}

/** A modular catalogue hub inspired by Drokex's public home; not a physical location. */
export function DrokexDistrict({ active, reducedMotion }: { active: boolean; reducedMotion?: boolean }) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const glow = useRef<MeshStandardMaterial>(null);
  const openness = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [active, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    if (!left.current || !right.current || !glow.current) return;
    const target = active ? 1 : 0;
    openness.current += (target - openness.current) * (reducedMotion ? 1 : 1 - Math.exp(-8 * Math.min(delta, .05)));
    left.current.position.x = -.34 * openness.current;
    right.current.position.x = .34 * openness.current;
    glow.current.emissiveIntensity = .08 + openness.current * .85;
    if (Math.abs(target - openness.current) > .0001) invalidate();
  });
  return <group>
    <Module position={[0, .06, 0]} size={[2.1, .14, 1.72]} color="#252a31" />
    <Module position={[0, .17, .05]} size={[1.84, .08, 1.42]} color="#11151a" />
    <mesh position={[0, .22, .04]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.35, .43, 32]} /><meshStandardMaterial color="#7bdc28" emissive="#7bdc28" emissiveIntensity={.22} roughness={.4} /></mesh>
    <mesh position={[0, .28, -.22]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.68, .71, 32]} /><meshStandardMaterial color="#384653" roughness={.55} /></mesh>
    <Module position={[0, .74, -.52]} size={[1.52, .86, .06]} color="#171c22" />
    <mesh position={[0, .74, -.56]}><planeGeometry args={[.95, .46]} /><meshStandardMaterial ref={glow} color="#7bdc28" emissive="#7bdc28" emissiveIntensity={.08} roughness={.24} /></mesh>
    <group ref={left}><Module position={[-.57, .74, .16]} size={[.48, .9, .09]} color="#7bdc28" /><Module position={[-.57, .74, .215]} size={[.32, .48, .02]} color="#151a1d" /></group>
    <group ref={right}><Module position={[.57, .74, .16]} size={[.48, .9, .09]} color="#f28a24" /><Module position={[.57, .74, .215]} size={[.32, .48, .02]} color="#151a1d" /></group>
    {[-.87, .87].map(x => <group key={x}><Module position={[x, .52, .05]} size={[.1, .52, .22]} color="#313c48" /><mesh position={[x, .8, .165]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.045, .045, .014, 16]} /><meshStandardMaterial color={x < 0 ? '#7bdc28' : '#f28a24'} emissive={x < 0 ? '#7bdc28' : '#f28a24'} emissiveIntensity={.25} /></mesh></group>)}
    {[-.66, -.33, 0, .33, .66].map(x => <Module key={x} position={[x, .4, .57]} size={[.2, .07, .08]} color={x === 0 ? '#7bdc28' : '#546270'} />)}
    <Module position={[0, .42, .7]} size={[.9, .04, .04]} color="#7bdc28" />
  </group>;
}
