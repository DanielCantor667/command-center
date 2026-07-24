'use client';

import { listAssets } from '@command-center/ai-renderer';
import { Button, Stack, Typography } from '@command-center/ui';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { SceneEditorState } from '../store/types';

export interface SceneAssetLibraryProps {
  useStore: UseBoundStore<StoreApi<SceneEditorState>>;
}

export function SceneAssetLibrary({ useStore }: SceneAssetLibraryProps) {
  const addObject = useStore((state) => state.addObject);
  const assets = listAssets();

  return (
    <aside aria-label="Biblioteca de activos" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 lg:w-72">
      <Typography variant="title">Biblioteca</Typography>
      <Typography variant="body-small" color="muted">Añade un activo a la cuadrícula y edítalo desde el inspector.</Typography>
      <Stack direction="vertical" gap="xs" className="mt-3 max-h-64 overflow-y-auto pr-1">
        {assets.map((asset) => (
          <Button key={asset.id} variant="secondary" size="sm" className="justify-between" onClick={() => addObject(asset.id)}>
            <span>{asset.label}</span><span className="text-xs opacity-60">{asset.category}</span>
          </Button>
        ))}
      </Stack>
    </aside>
  );
}
