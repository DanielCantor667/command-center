import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { GRID_RESPONSIVE_BREAKPOINTS, gridColumnsStyles, gridGapStyles } from './styles';
import type { GridProps } from './types';

function resolveColumnsClassName(columns: GridProps['columns']): string {
  if (!columns) return gridColumnsStyles[1];
  if (typeof columns === 'number') return gridColumnsStyles[columns];

  const base = columns.base ? gridColumnsStyles[columns.base] : gridColumnsStyles[1];
  const responsive = GRID_RESPONSIVE_BREAKPOINTS.map((breakpoint) => {
    const value = columns[breakpoint];
    return value ? `${breakpoint}:${gridColumnsStyles[value]}` : '';
  }).join(' ');

  return cn(base, responsive);
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns = 1, gap = 'md', className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('grid', resolveColumnsClassName(columns), gridGapStyles[gap], className)} {...rest}>
      {children}
    </div>
  );
});
