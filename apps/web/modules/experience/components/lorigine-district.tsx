'use client';

import { Edges, RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group } from 'three';

function Slab({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <RoundedBox position={position} args={size} radius={.025} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.65} metalness={.08} /></RoundedBox>;
}

function Bottle({ jar = false }: { jar?: boolean }) {
  const height = jar ? .28 : .53;
  const radius = jar ? .2 : .13;
  return <group>
    <mesh position={[0, height / 2, 0]} castShadow><cylinderGeometry args={[radius * .92, radius, height, 32]} /><meshStandardMaterial color="#824423" roughness={.26} metalness={.12} /></mesh>
    <mesh position={[0, height + .035, 0]} castShadow><cylinderGeometry args={[radius, radius, .07, 32]} /><meshStandardMaterial color="#302c29" roughness={.3} /></mesh>
    {!jar && <group>
      <Slab position={[0, height + .1, 0]} size={[.05, .09, .05]} color="#302c29" />
      <Slab position={[.045, height + .15, 0]} size={[.18, .04, .065]} color="#302c29" />
    </group>}
    <mesh position={[0, height * .48, radius + .002]}><planeGeometry args={[radius * 1.25, height * .32]} /><meshStandardMaterial color="#d8c8b3" roughness={.8} /></mesh>
  </group>;
}

/** Product-inspired exhibition pavilion; not a physical L'Origine location. */
export function LorigineDistrict({ active, reducedMotion }: { active: boolean; reducedMotion?: boolean }) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const openness = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [active, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    if (!left.current || !right.current) return;
    const target = active ? 1 : 0;
    openness.current += (target - openness.current) * (reducedMotion ? 1 : 1 - Math.exp(-7 * Math.min(delta, .05)));
    left.current.position.x = -.2 * openness.current;
    right.current.position.x = .2 * openness.current;
    if (Math.abs(target - openness.current) > .0001) invalidate();
  });
  return <group>
    <Slab position={[0, .06, 0]} size={[2.05, .16, 1.7]} color="#d8c8b3" />
    <Slab position={[0, .18, .14]} size={[1.84, .1, 1.35]} color="#e8dfd2" />
    <Slab position={[0, .14, .86]} size={[1.32, .06, .27]} color="#b9a279" />
    <Slab position={[0, .64, -.61]} size={[1.82, .94, .075]} color="#c5b59e" />
    <Slab position={[0, 1.43, -.32]} size={[2, .09, .78]} color="#e8dfd2" />
    {[-.87, .87].map(x => <Slab key={x} position={[x, .82, -.03]} size={[.035, 1.19, .035]} color="#b9a279" />)}
    <group ref={left}>
      <Slab position={[-.48, .4, .16]} size={[.59, .35, .62]} color="#d8c8b3" />
      <group position={[-.48, .575, .16]}><Bottle jar /></group>
      <mesh position={[-.48, .86, .17]}><boxGeometry args={[.65, .58, .68]} /><meshStandardMaterial color="#bfd4cb" transparent opacity={.13} depthWrite={false} roughness={.12} metalness={.15} /><Edges color="#91a39b" transparent opacity={.4} /></mesh>
      <Slab position={[-.48, 1.16, .17]} size={[.67, .025, .7]} color="#b9a279" />
    </group>
    <group ref={right}>
      <Slab position={[.43, .32, .16]} size={[.53, .18, .62]} color="#c5b59e" />
      <group position={[.43, .41, .16]}><Bottle /></group>
      <mesh position={[.43, .86, .17]}><boxGeometry args={[.59, .88, .68]} /><meshStandardMaterial color="#bfd4cb" transparent opacity={.13} depthWrite={false} roughness={.12} metalness={.15} /><Edges color="#91a39b" transparent opacity={.4} /></mesh>
      <Slab position={[.43, 1.31, .17]} size={[.61, .025, .7]} color="#b9a279" />
    </group>
    {[-.66, -.33, 0, .33, .66].map(x => <Slab key={x} position={[x, .91, -.559]} size={[.018, .55, .02]} color="#b9a279" />)}
  </group>;
}
