import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import {
  STACK_RESPONSIVE_BREAKPOINTS,
  STACK_WRAP_STYLE,
  stackAlignStyles,
  stackDirectionStyles,
  stackGapStyles,
  stackJustifyStyles,
} from './styles';
import type { StackProps } from './types';

function resolveGapClassName(gap: StackProps['gap']): string {
  if (!gap) return '';
  if (typeof gap === 'string') return stackGapStyles[gap];

  const base = gap.base ? stackGapStyles[gap.base] : '';
  const responsive = STACK_RESPONSIVE_BREAKPOINTS.map((breakpoint) => {
    const value = gap[breakpoint];
    return value ? `${breakpoint}:${stackGapStyles[value]}` : '';
  }).join(' ');

  return cn(base, responsive);
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = 'vertical', gap = 'md', align, justify, wrap = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        stackDirectionStyles[direction],
        resolveGapClassName(gap),
        align && stackAlignStyles[align],
        justify && stackJustifyStyles[justify],
        wrap && STACK_WRAP_STYLE,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
