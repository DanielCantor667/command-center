import type { GridColumns, GridGap } from './types';

export const gridColumnsStyles: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

export const gridGapStyles: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-4',
  sm: 'gap-8',
  md: 'gap-16',
  lg: 'gap-24',
  xl: 'gap-32',
};

export const gridTabletColumnsStyles: Record<GridColumns, string> = {
  1: 'tablet:grid-cols-1',
  2: 'tablet:grid-cols-2',
  3: 'tablet:grid-cols-3',
  4: 'tablet:grid-cols-4',
  6: 'tablet:grid-cols-6',
  12: 'tablet:grid-cols-12',
};

export const gridLaptopColumnsStyles: Record<GridColumns, string> = {
  1: 'laptop:grid-cols-1',
  2: 'laptop:grid-cols-2',
  3: 'laptop:grid-cols-3',
  4: 'laptop:grid-cols-4',
  6: 'laptop:grid-cols-6',
  12: 'laptop:grid-cols-12',
};
