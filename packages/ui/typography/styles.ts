import type { TypographyAlign, TypographyColor, TypographyVariant } from './types';

export const typographyVariantStyles: Record<TypographyVariant, string> = {
  'display-xl': 'text-display-xl font-sans',
  'display-l': 'text-display-l font-sans',
  'heading-xl': 'text-heading-xl font-sans',
  'heading-l': 'text-heading-l font-sans',
  'heading-m': 'text-heading-m font-sans',
  title: 'text-title font-sans',
  'body-l': 'text-body-l font-sans',
  body: 'text-body font-sans',
  'body-small': 'text-body-small font-sans',
  caption: 'text-caption font-sans uppercase tracking-wide',
  mono: 'text-mono font-mono',
  'mono-small': 'text-mono-small font-mono',
};

export const typographyColorStyles: Record<TypographyColor, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  accent: 'text-accent',
  danger: 'text-danger',
};

export const typographyAlignStyles: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const TYPOGRAPHY_TRUNCATE_STYLE = 'truncate';
