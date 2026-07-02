import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;

export interface GridResponsiveColumns {
  base?: GridColumns;
  tablet?: GridColumns;
  laptop?: GridColumns;
}

export interface GridOwnProps {
  columns?: GridColumns | GridResponsiveColumns;
  gap?: GridGap;
  className?: string;
  children?: ReactNode;
}

export type GridProps = GridOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof GridOwnProps>;
