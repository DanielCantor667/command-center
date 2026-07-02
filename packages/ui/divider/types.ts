import type { ComponentPropsWithoutRef } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerOwnProps {
  orientation?: DividerOrientation;
  className?: string;
}

export type DividerProps = DividerOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof DividerOwnProps | 'children'>;
