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
      <color attach="background" args={['#020617']} />
      <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
      <OrbitControls makeDefault />
      <ambientLight intensity={0.75} />
      <directionalLight position={[10, 12, 5]} intensity={1.2} />
      <gridHelper args={[80, 80, '#334155', '#172033']} />
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
