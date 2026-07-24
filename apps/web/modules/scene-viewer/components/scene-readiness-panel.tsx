'use client';

import { Stack, Typography } from '@command-center/ui';
import type { UseBoundStore, StoreApi } from 'zustand';
import { evaluateSceneReadiness } from '../lib/scene-readiness';
import type { SceneEditorState } from '../store/types';

export function SceneReadinessPanel({ useStore }: { useStore: UseBoundStore<StoreApi<SceneEditorState>> }) {
  const scene = useStore((state) => state.scene);
  const issues = evaluateSceneReadiness(scene);

  return (
    <aside aria-label="Estado de planificación" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 lg:w-72">
      <Typography variant="title">Estado del plano</Typography>
      {issues.length === 0 ? (
        <Typography variant="body-small" color="accent">Listo para guardar y renderizar.</Typography>
      ) : (
        <Stack direction="vertical" gap="xs" className="mt-2">
          {issues.map((issue) => <Typography key={issue.id} variant="body-small" color="secondary">• {issue.message}</Typography>)}
        </Stack>
      )}
    </aside>
  );
}
