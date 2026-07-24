'use client';

import { listAssets } from '@command-center/ai-renderer';
import { Button, Typography } from '@command-center/ui';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { SceneEditorState } from '../store/types';

export interface SceneAssetLibraryProps {
  useStore: UseBoundStore<StoreApi<SceneEditorState>>;
}

export function SceneAssetLibrary({ useStore }: SceneAssetLibraryProps) {
  const addObject = useStore((state) => state.addObject);
  const assets = listAssets();

  return (
    <aside aria-label="Biblioteca de activos" className="w-full rounded-2xl border border-panel-border bg-panel-background p-16 shadow-medium">
      <div className="flex items-start justify-between gap-12">
        <div>
          <Typography variant="caption" color="accent" className="uppercase tracking-widest">Catálogo GLB</Typography>
          <Typography variant="title" className="mt-4">Biblioteca</Typography>
        </div>
        <span className="rounded-full border border-panel-border bg-surface-secondary px-8 py-4 text-xs text-text-secondary">{assets.length}</span>
      </div>
      <Typography variant="body-small" color="muted" className="mt-4">Añade elementos al plano y personalízalos.</Typography>
      <div className="mt-12 grid max-h-224 grid-cols-2 gap-6 overflow-y-auto pr-4">
        {assets.map((asset) => (
          <Button key={asset.id} variant="secondary" size="sm" className="h-48 min-w-0 flex-col items-start justify-center gap-0 rounded-lg px-8 text-left" onClick={() => addObject(asset.id)}>
            <span className="w-full truncate text-xs">{asset.label}</span><span className="text-[10px] uppercase tracking-wider text-text-muted">{asset.category}</span>
          </Button>
        ))}
      </div>
    </aside>
  );
}
