'use client';

import { Stack, Typography } from '@command-center/ui';
import { MODULE_REGISTRY } from '../../modules';
import { useWorkspaceStore } from '../workspace-store';
import type { WorkspaceProps } from './types';

export function Workspace({ className, ...rest }: WorkspaceProps) {
  const currentModule = useWorkspaceStore((state) => state.currentModule);
  const ActiveModule = currentModule ? MODULE_REGISTRY[currentModule] : null;

  return (
    <main
      aria-label="Workspace"
      className={[
        'command-workspace flex flex-1 flex-col overflow-y-auto p-[var(--layout-workspace-padding)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {ActiveModule ? (
        <ActiveModule />
      ) : (
        <Stack direction="vertical" gap="sm" align="start" justify="center" className="h-full">
          <Typography variant="display-l" color="primary">
            COMMAND CENTER
          </Typography>
          <Typography variant="body" color="secondary">
            Explora el sistema de ingeniería
          </Typography>
          <Typography variant="body-small" color="muted">
            Selecciona un módulo para continuar.
          </Typography>
        </Stack>
      )}
    </main>
  );
}
