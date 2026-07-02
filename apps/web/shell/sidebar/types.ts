import type { ComponentPropsWithoutRef } from 'react';

export type SidebarProps = Omit<ComponentPropsWithoutRef<'aside'>, 'children'>;
