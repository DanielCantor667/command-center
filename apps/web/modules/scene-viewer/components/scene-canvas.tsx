'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { SceneGraph } from '@command-center/scene-builder';
import { useSceneSelection } from '../hooks/use-scene-selection';
import { SceneObjectMesh } from './scene-object-mesh';

export interface SceneCanvasProps {
  sceneGraph: SceneGraph;
}

export function SceneCanvas({ sceneGraph }: SceneCanvasProps) {
  const { selectedId, select, clear } = useSceneSelection();

  return (
    <Canvas onPointerMissed={clear}>
      <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
      <OrbitControls makeDefault />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      {sceneGraph.objects.map((object) => (
        <SceneObjectMesh
          key={object.id}
          object={object}
          selected={object.id === selectedId}
          onSelect={select}
        />
      ))}
    </Canvas>
  );
}
