import type { ComponentPropsWithoutRef } from 'react';

export type BrandProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;
