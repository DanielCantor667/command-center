import type { ComponentPropsWithoutRef } from 'react';

export type LogoProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;
