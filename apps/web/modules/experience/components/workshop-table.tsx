'use client';

import { Center, Line, RoundedBox, Text3D } from '@react-three/drei';
import { Suspense } from 'react';
import { TechnologyEmblem } from './technology-emblem';

export const WORKSHOP_POSITIONS: Record<string, [number, number, number]> = {
  kliniu: [-2.15, 0, -1.65],
  '4ustudio-academy': [2.15, 0, -1.65],
  lorigine: [-2.1, 0, 1.7],
  drokex: [2.1, 0, 1.7],
};
const font = '/fonts/workshop-bold.typeface.json';
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.4, 6]} />
        <meshStandardMaterial color="#7d7765" />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color="#7d9079" roughness={0.9} />
      </mesh>
      <mesh position={[0.11, 0.44, 0.04]} castShadow>
        <icosahedronGeometry args={[0.17, 1]} />
        <meshStandardMaterial color="#91a086" roughness={0.9} />
      </mesh>
    </group>
  );
}
export function WorkshopTable() {
  return (
    <group>
      <mesh position={[0, -0.33, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.4, 4.55, 0.55, 96]} />
        <meshStandardMaterial color="#cbd0c3" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.026, 0]} receiveShadow>
        <cylinderGeometry args={[4.36, 4.4, 0.08, 96]} />
        <meshStandardMaterial color="#e3e6dc" roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.61, 0]}>
        <cylinderGeometry args={[4.3, 4.3, 0.05, 96]} />
        <meshStandardMaterial color="#879387" roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.018, 0]}>
        <ringGeometry args={[4.13, 4.15, 96]} />
        <meshStandardMaterial color="#b2beb0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e8ebe3" roughness={1} />
      </mesh>
      {Object.values(WORKSHOP_POSITIONS).map(([x, , z], i) => (
        <group key={i}>
          <Line
            points={[
              [x, 0.015, z],
              [x * 0.58, 0.015, z * 0.58],
              [0, 0.015, 0],
            ]}
            color="#afbdaa"
            lineWidth={2}
          />
          <mesh position={[x, 0, z]} receiveShadow>
            <cylinderGeometry args={[1.22, 1.28, 0.12, 48]} />
            <meshStandardMaterial color="#c0cabe" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {[
        [-3.25, 0, -0.55],
        [-3.1, 0, -2.2],
        [-1.1, 0, -3.25],
        [1.05, 0, -3.3],
        [3.2, 0, -0.45],
        [3.05, 0, 2.2],
        [-3.15, 0, 1.9],
      ].map((p, i) => (
        <Tree key={i} position={p as [number, number, number]} />
      ))}
      <Suspense fallback={null}>
        <Center position={[0, -0.32, 4.46]}>
          <Text3D
            font={font}
            size={0.29}
            height={0.018}
            bevelEnabled
            bevelSize={0.002}
            bevelThickness={0.002}
          >
            DC
            <meshStandardMaterial color="#818f80" roughness={0.4} metalness={0.4} />
          </Text3D>
        </Center>
      </Suspense>
      <Line
        points={[
          [1.1, -0.25, 4.24],
          [1.28, -0.17, 4.18],
          [1.43, -0.23, 4.12],
          [1.64, -0.06, 4.03],
          [1.91, -0.24, 3.92],
          [2.09, -0.14, 3.83],
          [2.35, -0.27, 3.64],
        ]}
        color="#879784"
        lineWidth={1.5}
      />
      <Line
        points={[
          [-2.35, -0.27, 3.64],
          [-2.1, -0.17, 3.83],
          [-1.9, -0.2, 3.92],
          [-1.65, -0.09, 4.03],
          [-1.39, -0.23, 4.12],
          [-1.18, -0.16, 4.24],
        ]}
        color="#879784"
        lineWidth={1.5}
      />
    </group>
  );
}
export function TechnologyLibrary({
  selectedId = 'nextjs',
  active,
  onOpen,
}: {
  selectedId?: string;
  active: boolean;
  onOpen?: () => void;
}) {
  return (
    <group
      onClick={(event) => {
        if (event.delta > 5) return;
        event.stopPropagation();
        onOpen?.();
      }}
    >
      <mesh position={[0, 0.13, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1, 1.06, 0.24, 48]} />
        <meshStandardMaterial color="#8a9c91" metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.92, 0.1, 48]} />
        <meshStandardMaterial color="#d1d9d2" metalness={0.65} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.365, 0]}>
        <cylinderGeometry args={[0.81, 0.81, 0.045, 48]} />
        <meshStandardMaterial
          color={active ? '#70997e' : '#929f91'}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <group position={[0, 1.06, 0]} rotation={[-0.1, 0.3, 0]} scale={0.57}>
        <Suspense fallback={null}>
          <TechnologyEmblem technologyId={selectedId} />
        </Suspense>
      </group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.72, 0.67, 0.12]}
          rotation={[0, side * 0.5, side * -0.1]}
          scale={0.33}
        >
          <Suspense fallback={null}>
            <TechnologyEmblem technologyId={side < 0 ? 'react' : 'typescript'} />
          </Suspense>
        </group>
      ))}
      <RoundedBox args={[0.47, 0.07, 0.22]} radius={0.015} position={[0, 0.47, 0.77]}>
        <meshStandardMaterial color="#304b40" />
      </RoundedBox>
    </group>
  );
}
