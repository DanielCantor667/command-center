import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import {
  STACK_WRAP_STYLE,
  stackAlignStyles,
  stackDirectionStyles,
  stackGapStyles,
  stackJustifyStyles,
  stackLaptopGapStyles,
  stackTabletGapStyles,
} from './styles';
import type { StackProps } from './types';

function resolveGapClassName(gap: StackProps['gap']): string {
  if (!gap) return '';
  if (typeof gap === 'string') return stackGapStyles[gap];

  return [
    gap.base ? stackGapStyles[gap.base] : '',
    gap.tablet ? stackTabletGapStyles[gap.tablet] : '',
    gap.laptop ? stackLaptopGapStyles[gap.laptop] : '',
  ]
    .filter(Boolean)
    .join(' ');
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
