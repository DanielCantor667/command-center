'use client';

import { Button, Stack, Typography } from '@command-center/ui';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { SceneEditorState } from '../store/types';

export interface SceneEditorInspectorProps {
  useStore: UseBoundStore<StoreApi<SceneEditorState>>;
}

export function SceneEditorInspector({ useStore }: SceneEditorInspectorProps) {
  const selectedId = useStore((state) => state.selectedId);
  const selectedObject = useStore((state) => state.scene.objects.find((object) => object.id === state.selectedId));
  const rotateObject = useStore((state) => state.rotateObject);
  const scaleObject = useStore((state) => state.scaleObject);
  const duplicateObject = useStore((state) => state.duplicateObject);
  const deleteObject = useStore((state) => state.deleteObject);
  const snapObject = useStore((state) => state.snapObject);

  if (!selectedId || !selectedObject) {
    return (
      <aside aria-label="Inspector de objeto" className="w-full rounded-2xl border border-panel-border bg-panel-background p-16 shadow-medium">
        <Typography variant="caption" color="accent" className="uppercase tracking-widest">Transform</Typography>
        <Typography variant="title" className="mt-4">Inspector</Typography>
        <div className="mt-12 rounded-xl border border-dashed border-panel-border bg-surface-secondary px-12 py-16 text-center">
          <Typography variant="body-small" color="muted">Selecciona un activo en el canvas para editar posición, giro y escala.</Typography>
        </div>
      </aside>
    );
  }

  const { position, rotation, scale } = selectedObject.transform;

  return (
    <aside aria-label="Inspector de objeto" className="w-full rounded-2xl border border-accent/30 bg-gradient-to-br from-panel-background to-surface-primary p-16 shadow-medium">
      <Stack direction="vertical" gap="sm">
        <div>
          <Typography variant="caption" color="accent">Activo seleccionado</Typography>
          <Typography variant="title">{selectedObject.asset}</Typography>
          <Typography variant="mono-small" color="muted">{selectedObject.id}</Typography>
        </div>
        <div className="grid grid-cols-3 gap-8 text-center text-xs text-text-secondary">
          <span className="rounded-lg bg-surface-secondary p-8">X {position.x.toFixed(1)}</span><span className="rounded-lg bg-surface-secondary p-8">Y {position.y.toFixed(1)}</span><span className="rounded-lg bg-surface-secondary p-8">Z {position.z.toFixed(1)}</span>
        </div>
        <Stack direction="horizontal" gap="xs" wrap>
          <Button variant="secondary" size="sm" onClick={() => rotateObject(selectedId, rotation.y - Math.PI / 4)}>↶ 45°</Button>
          <Button variant="secondary" size="sm" onClick={() => rotateObject(selectedId, rotation.y + Math.PI / 4)}>45° ↷</Button>
          <Button variant="secondary" size="sm" onClick={() => scaleObject(selectedId, scale - 0.25)}>− escala</Button>
          <Button variant="secondary" size="sm" onClick={() => scaleObject(selectedId, scale + 0.25)}>+ escala</Button>
          <Button variant="secondary" size="sm" onClick={() => snapObject(selectedId)}>Ajustar grid</Button>
          <Button variant="secondary" size="sm" onClick={() => duplicateObject(selectedId)}>Duplicar</Button>
          <Button variant="danger" size="sm" onClick={() => deleteObject(selectedId)}>Eliminar</Button>
        </Stack>
      </Stack>
    </aside>
  );
}
