'use client';

import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { DragControls, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Matrix4, Vector3 } from 'three';
import type { UseBoundStore, StoreApi } from 'zustand';
import { buildSceneGraph, type ResolvedSceneObject } from '@command-center/scene-builder';
import type { SceneEditorState } from '../store/types';
import { SceneObjectMesh } from './scene-object-mesh';

export interface SceneEditorCanvasProps {
  useStore: UseBoundStore<StoreApi<SceneEditorState>>;
}

interface DraggableObjectProps {
  object: ResolvedSceneObject;
  onSelect: (id: string) => void;
  onDragStart: () => void;
  onDragEnd: (id: string, position: Vector3) => void;
}

function DraggableObject({ object, onSelect, onDragStart, onDragEnd }: DraggableObjectProps) {
  const latestMatrix = useRef(new Matrix4());

  return (
    <DragControls
      onDragStart={onDragStart}
      onDrag={(localMatrix) => {
        latestMatrix.current = localMatrix;
      }}
      onDragEnd={() => {
        onDragEnd(object.id, new Vector3().setFromMatrixPosition(latestMatrix.current));
      }}
    >
      <SceneObjectMesh object={object} selected onSelect={onSelect} />
    </DragControls>
  );
}

export function SceneEditorCanvas({ useStore }: SceneEditorCanvasProps) {
  const scene = useStore((state) => state.scene);
  const selectedId = useStore((state) => state.selectedId);
  const select = useStore((state) => state.select);
  const clearSelection = useStore((state) => state.clearSelection);
  const moveObject = useStore((state) => state.moveObject);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  const sceneGraph = buildSceneGraph(scene);

  return (
    <Canvas onPointerMissed={clearSelection}>
      <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
      <OrbitControls makeDefault enabled={orbitEnabled} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      {sceneGraph.objects.map((object) =>
        object.id === selectedId ? (
          <DraggableObject
            key={object.id}
            object={object}
            onSelect={select}
            onDragStart={() => setOrbitEnabled(false)}
            onDragEnd={(id, position) => {
              setOrbitEnabled(true);
              moveObject(id, { x: position.x, y: position.y, z: position.z });
            }}
          />
        ) : (
          <SceneObjectMesh key={object.id} object={object} selected={false} onSelect={select} />
        ),
      )}
    </Canvas>
  );
}
