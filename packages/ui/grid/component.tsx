import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { gridColumnsStyles, gridGapStyles, gridLaptopColumnsStyles, gridTabletColumnsStyles } from './styles';
import type { GridProps } from './types';

function resolveColumnsClassName(columns: GridProps['columns']): string {
  if (!columns) return gridColumnsStyles[1];
  if (typeof columns === 'number') return gridColumnsStyles[columns];

  return [
    columns.base ? gridColumnsStyles[columns.base] : gridColumnsStyles[1],
    columns.tablet ? gridTabletColumnsStyles[columns.tablet] : '',
    columns.laptop ? gridLaptopColumnsStyles[columns.laptop] : '',
  ]
    .filter(Boolean)
    .join(' ');
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
