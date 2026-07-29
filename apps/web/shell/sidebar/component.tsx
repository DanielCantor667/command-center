'use client';

import { Stack, Surface } from '@command-center/ui';
import { Brand } from '../brand';
import { SidebarItem } from '../sidebar-item';
import { useWorkspaceStore, WORKSPACE_MODULES } from '../workspace-store';
import type { SidebarProps } from './types';

export function Sidebar({ className, ...rest }: SidebarProps) {
  const currentModule = useWorkspaceStore((state) => state.currentModule);
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);

  return (
    <Surface
      asChild
      variant="subtle"
      border
      padding="md"
      className={[
        'command-sidebar hidden w-[var(--layout-sidebar-collapsed-width)] shrink-0 flex-col gap-24 overflow-y-auto',
        'tablet:flex laptop:w-[var(--layout-sidebar-width)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <aside aria-label="Primary navigation" {...rest}>
        <Brand />
        <nav aria-label="Application modules">
          <Stack direction="vertical" gap="xs">
            {WORKSPACE_MODULES.map((module) => (
              <SidebarItem
                key={module.id}
                label={module.label}
                active={module.id === currentModule}
                onSelect={() => setCurrentModule(module.id)}
              />
            ))}
          </Stack>
        </nav>
      </aside>
    </Surface>
  );
}
