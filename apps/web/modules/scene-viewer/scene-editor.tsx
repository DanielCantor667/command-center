'use client';

import { useState } from 'react';
import { Stack } from '@command-center/ui';
import type { Scene } from '@command-center/ai-renderer';
import { createSceneEditorStore } from './store/scene-editor-store';
import { SceneEditorCanvas } from './components/scene-editor-canvas';
import { SceneEditorToolbar } from './components/scene-editor-toolbar';

export interface SceneEditorProps {
  scene: Scene;
}

export function SceneEditor({ scene }: SceneEditorProps) {
  const [useStore] = useState(() => createSceneEditorStore(scene));

  return (
    <Stack direction="vertical" gap="sm">
      <SceneEditorToolbar useStore={useStore} />
      <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
        <SceneEditorCanvas useStore={useStore} />
      </div>
    </Stack>
  );
}
