import type { StackAlign, StackDirection, StackGap, StackJustify } from './types';

export const stackDirectionStyles: Record<StackDirection, string> = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
};

export const stackGapStyles: Record<StackGap, string> = {
  none: 'gap-0',
  xs: 'gap-4',
  sm: 'gap-8',
  md: 'gap-16',
  lg: 'gap-24',
  xl: 'gap-32',
};

export const stackAlignStyles: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

export const stackJustifyStyles: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const STACK_WRAP_STYLE = 'flex-wrap';
export const STACK_RESPONSIVE_BREAKPOINTS = ['tablet', 'laptop'] as const;
