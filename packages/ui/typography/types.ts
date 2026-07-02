import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type TypographyVariant =
  | 'display-xl'
  | 'display-l'
  | 'heading-xl'
  | 'heading-l'
  | 'heading-m'
  | 'title'
  | 'body-l'
  | 'body'
  | 'body-small'
  | 'caption'
  | 'mono'
  | 'mono-small';

export type TypographyColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger';
export type TypographyAlign = 'left' | 'center' | 'right';

export interface TypographyOwnProps {
  variant?: TypographyVariant;
  as?: ElementType;
  color?: TypographyColor;
  align?: TypographyAlign;
  truncate?: boolean;
  className?: string;
  children?: ReactNode;
}

export type TypographyProps = TypographyOwnProps & Omit<ComponentPropsWithoutRef<'p'>, keyof TypographyOwnProps>;
