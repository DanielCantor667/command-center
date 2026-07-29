'use client';

import { IconButton, Stack, Surface, Typography } from '@command-center/ui';
import { Brand } from '../brand';
import { useWorkspaceStore, WORKSPACE_MODULES } from '../workspace-store';
import type { TopBarProps } from './types';

export function TopBar({ className, ...rest }: TopBarProps) {
  const currentModule = useWorkspaceStore((state) => state.currentModule);
  const currentModuleLabel = WORKSPACE_MODULES.find((module) => module.id === currentModule)?.label;

  return (
    <Surface
      asChild
      variant="subtle"
      border
      padding="md"
      className={[
        'command-topbar flex h-[var(--layout-topbar-height)] w-full shrink-0 items-center justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header {...rest}>
        <Stack direction="horizontal" gap="md" align="center">
          <Brand />
          <Typography as="span" variant="body" color="secondary">
            {currentModuleLabel ?? 'System Ready'}
          </Typography>
        </Stack>

        <Stack direction="horizontal" gap="sm" align="center">
          <IconButton label="Open command palette" variant="ghost" size={20}>
            <span aria-hidden="true">⌘</span>
          </IconButton>
          <IconButton label="Toggle theme" variant="ghost" size={20}>
            <span aria-hidden="true">◐</span>
          </IconButton>
          <Typography as="span" variant="mono-small" color="muted">
            --:--
          </Typography>
          <Typography as="span" variant="caption" color="accent">
            System Ready
          </Typography>
        </Stack>
      </header>
    </Surface>
  );
}
