import type { ComponentPropsWithoutRef } from 'react';

export type TopBarProps = Omit<ComponentPropsWithoutRef<'header'>, 'children'>;
