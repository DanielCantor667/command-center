import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { dividerOrientationStyles } from './styles';
import type { DividerProps } from './types';

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = 'horizontal', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(dividerOrientationStyles[orientation], className)}
      {...rest}
    />
  );
});
