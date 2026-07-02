import type { ComponentPropsWithoutRef } from 'react';

export type StatusBarProps = Omit<ComponentPropsWithoutRef<'footer'>, 'children'>;
