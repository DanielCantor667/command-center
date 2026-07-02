import type { ComponentPropsWithoutRef } from 'react';

export type WorkspaceProps = Omit<ComponentPropsWithoutRef<'main'>, 'children'>;
