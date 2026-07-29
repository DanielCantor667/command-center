'use client';

import { OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';

const districts = [
  { id: 'command-center', position: [0, 0.45, 0] as const, scale: [1.25, 0.65, 1.25] as const },
  { id: 'kliniu', position: [-2.6, 0.1, -1.2] as const, scale: [0.7, 0.42, 0.7] as const },
  { id: 'vevi', position: [2.5, 0.1, -1.15] as const, scale: [0.78, 0.42, 0.78] as const },
  { id: 'intranet-ess', position: [-2.25, 0.1, 1.55] as const, scale: [0.72, 0.42, 0.72] as const },
  { id: 'lorigine', position: [2.25, 0.1, 1.55] as const, scale: [0.72, 0.42, 0.72] as const },
  { id: 'academy', position: [0, 0.1, 2.6] as const, scale: [0.68, 0.4, 0.68] as const },
];

function District({ id, position, scale, onSelect }: typeof districts[number] & { onSelect: (id: string) => void }) {
  const emissive = id === 'command-center' ? '#53ffad' : '#16885d';
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(id);
  };
  return (
    <group position={position} onClick={handleClick}>
      <mesh scale={scale} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.14, 0.34, 6]} />
        <meshStandardMaterial color="#061710" emissive={emissive} emissiveIntensity={0.65} metalness={0.82} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.5, 0]} scale={[scale[0] * 0.52, 0.75, scale[2] * 0.52]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#0a2c20" emissive={emissive} emissiveIntensity={1.4} metalness={0.55} roughness={0.12} />
      </mesh>
    </group>
  );
}

export function CityNavigator({ onProjectSelect }: { onProjectSelect: (id: string) => void }) {
  const stars = useMemo(() => [0.8, 1.2, 1.8] as const, []);
  return (
    <div aria-label="Mapa 3D interactivo de distritos de proyectos" role="application" className="h-full w-full">
      <Canvas dpr={[1, 1.5]} camera={{ position: [6.5, 6.5, 8], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
        <color attach="background" args={['#020807']} />
        <ambientLight intensity={0.55} />
        <pointLight position={[0, 5, 0]} intensity={42} color="#42f59a" distance={12} />
        <pointLight position={[4, 2, -2]} intensity={12} color="#2bb8ff" distance={8} />
        <gridHelper args={[12, 18, '#1a6b49', '#0a271d']} position={[0, -0.25, 0]} />
        {districts.map((district) => <District key={district.id} {...district} onSelect={onProjectSelect} />)}
        {stars.map((size) => <Sparkles key={size} count={18} scale={[11, 5, 11]} size={size} speed={0.18} color="#77ffc0" />)}
        <OrbitControls enablePan={false} minDistance={7} maxDistance={14} minPolarAngle={0.65} maxPolarAngle={1.25} />
      </Canvas>
    </div>
  );
}
