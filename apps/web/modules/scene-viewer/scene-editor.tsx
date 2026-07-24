'use client';

import { useState } from 'react';
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
    <section aria-label="Editor de escena" className="grid shrink-0 grid-cols-1 gap-16 laptop:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-panel-border bg-panel-background shadow-high">
        <SceneEditorToolbar useStore={useStore} />
        <div className="h-[620px] min-h-[520px] w-full border-t border-divider">
          <SceneEditorCanvas useStore={useStore} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-12">
        <SceneReadinessPanel useStore={useStore} />
        <SceneEditorInspector useStore={useStore} />
        <SceneAssetLibrary useStore={useStore} />
        <SceneGallery useStore={useStore} />
      </div>
    </section>
  );
}
