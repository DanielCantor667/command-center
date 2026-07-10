'use client';

import { useMemo } from 'react';
import { buildSceneGraph } from '@command-center/scene-builder';
import type { Scene } from '@command-center/ai-renderer';
import { SceneCanvas } from './components/scene-canvas';

export interface SceneViewerModuleProps {
  scene: Scene;
}

export function SceneViewerModule({ scene }: SceneViewerModuleProps) {
  const sceneGraph = useMemo(() => buildSceneGraph(scene), [scene]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
      <SceneCanvas sceneGraph={sceneGraph} />
    </div>
  );
}
