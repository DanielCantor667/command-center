'use client';

import { useEffect, useState } from 'react';
import { Button, Stack, Typography } from '@command-center/ui';
import type { UseBoundStore, StoreApi } from 'zustand';
import { deleteStoredScene, listStoredScenes, loadStoredScene, type StoredSceneSummary } from '../lib/scene-storage';
import type { SceneEditorState } from '../store/types';

export interface SceneGalleryProps {
  useStore: UseBoundStore<StoreApi<SceneEditorState>>;
}

export function SceneGallery({ useStore }: SceneGalleryProps) {
  const loadScene = useStore((state) => state.loadScene);
  const [scenes, setScenes] = useState<StoredSceneSummary[]>([]);

  const refresh = () => setScenes(listStoredScenes());

  useEffect(() => {
    refresh();
    window.addEventListener('command-center:scene-saved', refresh);
    return () => window.removeEventListener('command-center:scene-saved', refresh);
  }, []);

  return (
    <aside aria-label="Galería de escenas" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 lg:w-72">
      <Typography variant="title">Escenas guardadas</Typography>
      {scenes.length === 0 ? <Typography variant="body-small" color="muted">Guarda esta escena para crear tu primera versión.</Typography> : (
        <Stack direction="vertical" gap="xs" className="mt-3 max-h-48 overflow-y-auto pr-1">
          {scenes.map((scene) => (
            <div key={scene.id} className="rounded border border-slate-800 p-2">
              <Typography variant="body-small">{scene.name}</Typography>
              <Typography variant="caption" color="muted">{scene.objectCount} activos</Typography>
              <Stack direction="horizontal" gap="xs" className="mt-2">
                <Button variant="secondary" size="sm" onClick={() => { const stored = loadStoredScene(scene.id); if (stored) loadScene(stored); }}>Abrir</Button>
                <Button variant="danger" size="sm" onClick={() => { deleteStoredScene(scene.id); refresh(); }}>Eliminar</Button>
              </Stack>
            </div>
          ))}
        </Stack>
      )}
    </aside>
  );
}
