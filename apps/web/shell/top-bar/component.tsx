'use client';

import { IconButton, Stack, Surface, Typography, useTheme } from '@command-center/ui';
import { Brand } from '../brand';
import { useWorkspaceStore, WORKSPACE_MODULES } from '../workspace-store';
import type { TopBarProps } from './types';

export function TopBar({ className, onReturnToCity, ...rest }: TopBarProps & { onReturnToCity?: () => void }) {
  const currentModule = useWorkspaceStore((state) => state.currentModule);
  const currentModuleLabel = WORKSPACE_MODULES.find((module) => module.id === currentModule)?.label;
  const { resolvedTheme, setTheme } = useTheme();

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
          <Typography as="span" variant="body" color="secondary" className="command-module-label">
            {currentModuleLabel ?? 'Portfolio de ingeniería'}
          </Typography>
        </Stack>

        <Stack direction="horizontal" gap="sm" align="center">
          {onReturnToCity && <button type="button" onClick={onReturnToCity} className="command-return-button rounded-md border border-panel-border px-12 py-8 text-xs text-accent focus-visible:outline-2">Volver a la ciudad</button>}
          <IconButton label={resolvedTheme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'} variant="ghost" size={20} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
            <span aria-hidden="true">◐</span>
          </IconButton>
          <Typography as="span" variant="caption" color="accent" className="command-public-label">
            Portfolio público
          </Typography>
        </Stack>
      </header>
    </Surface>
  );
}
