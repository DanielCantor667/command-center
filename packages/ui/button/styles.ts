import type { ButtonSize, ButtonVariant } from './types';

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-background-primary hover:bg-accent/90',
  secondary: 'bg-surface-secondary text-text-primary hover:bg-surface-hover border border-panel-border',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-hover',
  danger: 'bg-danger text-text-primary hover:bg-danger/90',
};

export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'h-32 px-12 text-body-small gap-4',
  md: 'h-40 px-16 text-body gap-8',
  lg: 'h-48 px-24 text-body-l gap-8',
};

export const BUTTON_BASE_STYLE =
  'inline-flex items-center justify-center rounded-md font-sans font-medium transition-colors duration-[var(--motion-fast)] ease-out focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';
export const BUTTON_LOADING_STYLE = 'relative text-transparent';
export const BUTTON_SPINNER_STYLE =
  'absolute inline-block h-16 w-16 animate-spin rounded-full border-[length:var(--border-strong)] border-current border-t-transparent';
