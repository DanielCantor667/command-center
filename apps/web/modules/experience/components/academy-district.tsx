'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, MeshStandardMaterial } from 'three';

function Piece({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <RoundedBox position={position} args={size} radius={.025} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.55} metalness={.08} /></RoundedBox>;
}

/** A miniature performance space, not a model of the academy's physical premises. */
export function AcademyDistrict({ active, reducedMotion }: { active: boolean; reducedMotion?: boolean }) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const light = useRef<MeshStandardMaterial>(null);
  const openness = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [active, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    if (!left.current || !right.current || !light.current) return;
    const target = active ? 1 : 0;
    openness.current += (target - openness.current) * (reducedMotion ? 1 : 1 - Math.exp(-8 * Math.min(delta, .05)));
    left.current.position.x = -.45 * openness.current;
    right.current.position.x = .45 * openness.current;
    light.current.emissiveIntensity = .08 + openness.current * .75;
    if (Math.abs(target - openness.current) > .0001) invalidate();
  });
  return <group>
    <Piece position={[0, .07, 0]} size={[2.05, .18, 1.65]} color="#a89987" />
    <Piece position={[0, .21, .03]} size={[1.83, .14, 1.4]} color="#252837" />
    <Piece position={[0, .3, .68]} size={[1.25, .09, .25]} color="#d8b780" />
    {[0, 1, 2, 3].map(i => <mesh key={i} position={[0, .47, -.48 + i * .23]} castShadow>
      <torusGeometry args={[.91 - i * .035, .055, 8, 48, Math.PI]} />
      <meshStandardMaterial color={i % 2 ? '#d8b780' : '#df8934'} roughness={.45} metalness={.18} />
    </mesh>)}
    <Piece position={[0, .67, -.57]} size={[1.65, .8, .06]} color="#39322b" />
    <group ref={left}><Piece position={[-.4, .7, .43]} size={[.69, .88, .09]} color="#c96720" /></group>
    <group ref={right}><Piece position={[.4, .7, .43]} size={[.69, .88, .09]} color="#c96720" /></group>
    {[-.88, .88].map(x => <group key={x}>
      <Piece position={[x, .67, .03]} size={[.16, .84, .24]} color="#252837" />
      {[.46, .75].map(y => <mesh key={y} position={[x, y, .158]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.055, .055, .013, 16]} /><meshStandardMaterial color="#afa393" metalness={.35} roughness={.45} /></mesh>)}
    </group>)}
    <mesh position={[0, .32, -.05]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[.46, 32]} /><meshStandardMaterial ref={light} color="#ffe3b6" emissive="#ffc279" emissiveIntensity={.08} roughness={.6} />
    </mesh>
    <Piece position={[-.37, .61, -.18]} size={[.54, .065, .23]} color="#d8b780" />
    {[-.59, -.5, -.41, -.32, -.23, -.14].map(x => <Piece key={x} position={[x, .65, -.12]} size={[.07, .018, .12]} color="#f2ece3" />)}
    {[-.53, -.23].map(x => <Piece key={x} position={[x, .46, -.18]} size={[.025, .28, .025]} color="#252837" />)}
    <mesh position={[.33, .48, -.22]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.16, .16, .18, 24]} /><meshStandardMaterial color="#d8b780" roughness={.4} metalness={.15} /></mesh>
    <Piece position={[.13, .57, .15]} size={[.022, .5, .022]} color="#c3b9a9" />
    <mesh position={[.13, .83, .15]} rotation={[0, 0, .5]}><capsuleGeometry args={[.027, .08, 4, 8]} /><meshStandardMaterial color="#252837" /></mesh>
  </group>;
}
