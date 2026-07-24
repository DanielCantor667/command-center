'use client';

import { Stack, Typography } from '@command-center/ui';
import type { UseBoundStore, StoreApi } from 'zustand';
import { evaluateSceneReadiness } from '../lib/scene-readiness';
import type { SceneEditorState } from '../store/types';

export function SceneReadinessPanel({ useStore }: { useStore: UseBoundStore<StoreApi<SceneEditorState>> }) {
  const scene = useStore((state) => state.scene);
  const issues = evaluateSceneReadiness(scene);

  return (
    <aside aria-label="Estado de planificación" className={`w-full rounded-2xl border p-16 shadow-medium ${issues.length === 0 ? 'border-accent/30 bg-accent/10' : 'border-warning/30 bg-warning/10'}`}>
      <div className="flex items-center justify-between gap-12">
        <div>
          <Typography variant="caption" color="muted" className="uppercase tracking-widest">Quality gate</Typography>
          <Typography variant="title" className="mt-4">Estado del plano</Typography>
        </div>
        <span className={`h-12 w-12 rounded-full ${issues.length === 0 ? 'bg-accent shadow-[0_0_12px_var(--accent)]' : 'bg-warning shadow-[0_0_12px_var(--warning)]'}`} />
      </div>
      {issues.length === 0 ? (
        <Typography variant="body-small" color="accent" className="mt-8">Escena lista para guardar y renderizar.</Typography>
      ) : (
        <Stack direction="vertical" gap="xs" className="mt-2">
          {issues.map((issue) => <Typography key={issue.id} variant="body-small" color="secondary">• {issue.message}</Typography>)}
        </Stack>
      )}
    </aside>
  );
}
