'use client';

import { Suspense } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { ResolvedSceneObject } from '@command-center/scene-builder';

export interface SceneObjectMeshProps {
  object: ResolvedSceneObject;
  selected: boolean;
  onSelect: (id: string) => void;
}

interface ModelProps {
  selected: boolean;
}

function Material({ color, selected }: { color: string; selected: boolean }) {
  return <meshStandardMaterial color={color} emissive={selected ? '#60a5fa' : '#000000'} emissiveIntensity={selected ? 0.25 : 0} />;
}

function DeskModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.78, 0]}><boxGeometry args={[1.6, 0.12, 0.75]} /><Material color="#8b5e3c" selected={selected} /></mesh>
      {[-0.65, 0.65].flatMap((x) => [-0.26, 0.26].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.37, z]}><boxGeometry args={[0.08, 0.75, 0.08]} /><Material color="#1e293b" selected={selected} /></mesh>
      )))}
    </group>
  );
}

function ChairModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.48, 0]}><boxGeometry args={[0.62, 0.14, 0.62]} /><Material color="#334155" selected={selected} /></mesh>
      <mesh position={[0, 0.88, 0.25]}><boxGeometry args={[0.62, 0.68, 0.12]} /><Material color="#475569" selected={selected} /></mesh>
      <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.05, 0.05, 0.46]} /><Material color="#111827" selected={selected} /></mesh>
      <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.42, 0.42, 0.06, 5]} /><Material color="#111827" selected={selected} /></mesh>
    </group>
  );
}

function ComputerModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.48, 0]}><boxGeometry args={[0.82, 0.5, 0.06]} /><Material color="#0f172a" selected={selected} /></mesh>
      <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.06, 0.25, 0.06]} /><Material color="#64748b" selected={selected} /></mesh>
      <mesh position={[0, 0.07, 0]}><boxGeometry args={[0.46, 0.04, 0.28]} /><Material color="#64748b" selected={selected} /></mesh>
    </group>
  );
}

function ReceptionModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.65, 0]}><boxGeometry args={[3.2, 1.3, 0.75]} /><Material color="#1d4ed8" selected={selected} /></mesh>
      <mesh position={[0, 1.36, -0.05]}><boxGeometry args={[3.45, 0.12, 0.9]} /><Material color="#e2e8f0" selected={selected} /></mesh>
    </group>
  );
}

function RoomModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.75, 0]}><boxGeometry args={[2.7, 0.16, 1.1]} /><Material color="#7c3aed" selected={selected} /></mesh>
      <mesh position={[-1.15, 0.65, 0]}><boxGeometry args={[0.1, 1.3, 2.3]} /><Material color="#94a3b8" selected={selected} /></mesh>
      <mesh position={[1.15, 0.65, 0]}><boxGeometry args={[0.1, 1.3, 2.3]} /><Material color="#94a3b8" selected={selected} /></mesh>
      <mesh position={[0, 0.65, -1.05]}><boxGeometry args={[2.4, 1.3, 0.1]} /><Material color="#cbd5e1" selected={selected} /></mesh>
    </group>
  );
}

function OfficeModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, -0.08, 0]}><boxGeometry args={[10, 0.16, 10]} /><Material color="#1e293b" selected={selected} /></mesh>
      <mesh position={[0, 1.5, -4.95]}><boxGeometry args={[10, 3, 0.1]} /><Material color="#334155" selected={selected} /></mesh>
      <mesh position={[-4.95, 1.5, 0]}><boxGeometry args={[0.1, 3, 10]} /><Material color="#334155" selected={selected} /></mesh>
    </group>
  );
}

function RackModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.8, 1.8, 0.6]} /><Material color="#0f172a" selected={selected} /></mesh>
      {[0.4, 0.9, 1.4].map((y) => <mesh key={y} position={[0, y, -0.31]}><boxGeometry args={[0.58, 0.05, 0.02]} /><Material color="#22c55e" selected={selected} /></mesh>)}
    </group>
  );
}

function TreeModel({ selected }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.28, 0.35, 0.44, 12]} /><Material color="#a16207" selected={selected} /></mesh>
      <mesh position={[0, 1.05, 0]}><sphereGeometry args={[0.7, 16, 12]} /><Material color="#16a34a" selected={selected} /></mesh>
    </group>
  );
}

function GenericModel({ selected }: ModelProps) {
  return <mesh position={[0, 0.5, 0]}><boxGeometry args={[1, 1, 1]} /><Material color="#64748b" selected={selected} /></mesh>;
}

function LoadedGlbModel({ path }: { path: string }) {
  const gltf = useGLTF(path);
  return <Clone object={gltf.scene} />;
}

function SelectionMarker() {
  return <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.7, 0.8, 24]} /><meshBasicMaterial color="#60a5fa" transparent opacity={0.9} /></mesh>;
}

function AssetModel({ object, selected }: Pick<SceneObjectMeshProps, 'object' | 'selected'>) {
  const fallback = (() => {
    switch (object.asset) {
    case 'desk': return <DeskModel selected={selected} />;
    case 'chair': return <ChairModel selected={selected} />;
    case 'computer': return <ComputerModel selected={selected} />;
    case 'reception': return <ReceptionModel selected={selected} />;
    case 'meeting_room': return <RoomModel selected={selected} />;
    case 'office': return <OfficeModel selected={selected} />;
    case 'rack': return <RackModel selected={selected} />;
    case 'tree': return <TreeModel selected={selected} />;
      default: return <GenericModel selected={selected} />;
    }
  })();

  return <><Suspense fallback={fallback}><LoadedGlbModel path={object.metadata.modelPath} /></Suspense>{selected ? <SelectionMarker /> : null}</>;
}

export function SceneObjectMesh({ object, selected, onSelect }: SceneObjectMeshProps) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(object.id);
  };

  return <group position={object.position} rotation={object.rotation} scale={object.scale} onClick={handleClick}><AssetModel object={object} selected={selected} /></group>;
}
