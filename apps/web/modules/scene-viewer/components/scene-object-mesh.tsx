'use client';

import type { ThreeEvent } from '@react-three/fiber';
import type { ResolvedSceneObject } from '@command-center/scene-builder';
import { getAssetColor } from '../lib/asset-color';

export interface SceneObjectMeshProps {
  object: ResolvedSceneObject;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function SceneObjectMesh({ object, selected, onSelect }: SceneObjectMeshProps) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(object.id);
  };

  return (
    <mesh
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={handleClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={getAssetColor(object.metadata.category)}
        emissive={selected ? '#ffffff' : '#000000'}
        emissiveIntensity={selected ? 0.3 : 0}
      />
    </mesh>
  );
}
