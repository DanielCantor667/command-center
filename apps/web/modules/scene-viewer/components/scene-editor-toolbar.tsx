'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Button, Stack } from '@command-center/ui';
import { sceneSchema } from '@command-center/ai-renderer';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { SceneEditorState } from '../store/types';

export interface SceneEditorToolbarProps {
  useStore: UseBoundStore<StoreApi<SceneEditorState>>;
}

export function SceneEditorToolbar({ useStore }: SceneEditorToolbarProps) {
  const past = useStore((state) => state.past);
  const future = useStore((state) => state.future);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const save = useStore((state) => state.save);
  const scene = useStore((state) => state.scene);
  const loadScene = useStore((state) => state.loadScene);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportScene = () => {
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${scene.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importScene = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (!file) return;
    try {
      const imported = sceneSchema.parse(JSON.parse(await file.text()));
      loadScene(imported);
      setMessage(`Escena importada: ${imported.metadata.name ?? imported.id}`);
    } catch {
      setMessage('El archivo no cumple el formato de escena requerido.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Stack direction="horizontal" gap="xs" wrap align="center" className="min-h-64 justify-between bg-panel-background px-16 py-12">
      <Stack direction="horizontal" gap="xs" align="center">
        <div className="mr-8 hidden tablet:block">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Scene editor</span>
          <span className="text-xs text-text-muted">{scene.objects.length} objetos</span>
        </div>
        <Button variant="secondary" size="sm" disabled={past.length === 0} onClick={undo}>↶ Undo</Button>
        <Button variant="secondary" size="sm" disabled={future.length === 0} onClick={redo}>↷ Redo</Button>
        <Button variant="primary" size="sm" onClick={save}>Guardar borrador</Button>
      </Stack>
      <Stack direction="horizontal" gap="xs">
        <Button variant="secondary" size="sm" onClick={exportScene}>Exportar JSON</Button>
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Importar</Button>
      </Stack>
      <input ref={fileInputRef} aria-label="Importar escena JSON" type="file" accept="application/json,.json" className="sr-only" onChange={importScene} />
      {message && <span role="status" className="text-sm text-text-secondary">{message}</span>}
    </Stack>
  );
}
