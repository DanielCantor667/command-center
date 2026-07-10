'use client';

import { Button, Stack } from '@command-center/ui';
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

  return (
    <Stack direction="horizontal" gap="sm">
      <Button variant="secondary" size="sm" disabled={past.length === 0} onClick={undo}>
        Undo
      </Button>
      <Button variant="secondary" size="sm" disabled={future.length === 0} onClick={redo}>
        Redo
      </Button>
      <Button variant="primary" size="sm" onClick={save}>
        Save
      </Button>
    </Stack>
  );
}
