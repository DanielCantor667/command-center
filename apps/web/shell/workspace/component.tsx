'use client';

import { Stack, Typography } from '@command-center/ui';
import { useWorkspaceStore, WORKSPACE_MODULES } from '../workspace-store';
import type { WorkspaceProps } from './types';

export function Workspace({ className, ...rest }: WorkspaceProps) {
  const currentModule = useWorkspaceStore((state) => state.currentModule);
  const currentModuleLabel = WORKSPACE_MODULES.find((module) => module.id === currentModule)?.label;

  return (
    <main
      aria-label="Workspace"
      className={[
        'flex flex-1 flex-col overflow-y-auto p-[var(--layout-workspace-padding)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <Stack direction="vertical" gap="sm" align="start" justify="center" className="h-full">
        <Typography variant="display-l" color="primary">
          {currentModuleLabel ? currentModuleLabel.toUpperCase() : 'COMMAND CENTER'}
        </Typography>
        <Typography variant="body" color="secondary">
          System Ready
        </Typography>
        <Typography variant="body-small" color="muted">
          {currentModuleLabel ? `${currentModuleLabel} has no module yet.` : 'Waiting for Modules...'}
        </Typography>
      </Stack>
    </main>
  );
}
