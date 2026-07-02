import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackResponsiveGap {
  base?: StackGap;
  tablet?: StackGap;
  laptop?: StackGap;
}

export interface StackOwnProps {
  direction?: StackDirection;
  gap?: StackGap | StackResponsiveGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  className?: string;
  children?: ReactNode;
}

export type StackProps = StackOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof StackOwnProps>;
