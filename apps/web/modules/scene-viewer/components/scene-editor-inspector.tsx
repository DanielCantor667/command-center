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
      <aside aria-label="Inspector de objeto" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 lg:w-72">
        <Typography variant="title">Inspector</Typography>
        <Typography variant="body-small" color="muted">Selecciona un activo de la escena para editarlo.</Typography>
      </aside>
    );
  }

  const { position, rotation, scale } = selectedObject.transform;

  return (
    <aside aria-label="Inspector de objeto" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 lg:w-72">
      <Stack direction="vertical" gap="sm">
        <div>
          <Typography variant="caption" color="accent">Activo seleccionado</Typography>
          <Typography variant="title">{selectedObject.asset}</Typography>
          <Typography variant="mono-small" color="muted">{selectedObject.id}</Typography>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
          <span>X {position.x.toFixed(1)}</span><span>Y {position.y.toFixed(1)}</span><span>Z {position.z.toFixed(1)}</span>
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
