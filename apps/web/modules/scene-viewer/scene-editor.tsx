'use client';

import { useState } from 'react';
import { Stack } from '@command-center/ui';
import type { Scene } from '@command-center/ai-renderer';
import { createSceneEditorStore } from './store/scene-editor-store';
import { SceneEditorCanvas } from './components/scene-editor-canvas';
import { SceneEditorToolbar } from './components/scene-editor-toolbar';
import { SceneEditorInspector } from './components/scene-editor-inspector';
import { SceneAssetLibrary } from './components/scene-asset-library';
import { SceneGallery } from './components/scene-gallery';
import { SceneReadinessPanel } from './components/scene-readiness-panel';

export interface SceneEditorProps {
  scene: Scene;
}

export function SceneEditor({ scene }: SceneEditorProps) {
  const [useStore] = useState(() => createSceneEditorStore(scene));

  // Keep the module usable in embedded/non-WebGL environments (and during
  // server-side test rendering) instead of failing while R3F initializes.
  if (typeof window !== 'undefined' && typeof ResizeObserver === 'undefined') {
    return <div role="status">3D preview requires a browser with canvas support.</div>;
  }

  return (
    <Stack direction="vertical" gap="sm">
      <SceneEditorToolbar useStore={useStore} />
      <Stack direction="horizontal" gap="sm" wrap={false} className="min-h-0">
        <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
          <SceneEditorCanvas useStore={useStore} />
        </div>
        <Stack direction="vertical" gap="sm" className="shrink-0">
          <SceneEditorInspector useStore={useStore} />
          <SceneAssetLibrary useStore={useStore} />
          <SceneGallery useStore={useStore} />
          <SceneReadinessPanel useStore={useStore} />
        </Stack>
      </Stack>
    </Stack>
  );
}
