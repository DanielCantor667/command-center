import type { SurfaceElevation, SurfacePadding, SurfaceRadius, SurfaceVariant } from './types';

export const surfaceVariantStyles: Record<SurfaceVariant, string> = {
  default: 'bg-surface-primary text-text-primary',
  subtle: 'bg-surface-secondary text-text-primary',
  outlined: 'bg-transparent text-text-primary border border-panel-border',
  interactive: 'bg-surface-primary text-text-primary hover:bg-surface-hover cursor-pointer',
  transparent: 'bg-transparent text-text-primary',
};

export const surfacePaddingStyles: Record<SurfacePadding, string> = {
  none: 'p-0',
  sm: 'p-8',
  md: 'p-16',
  lg: 'p-24',
  xl: 'p-32',
};

export const surfaceRadiusStyles: Record<SurfaceRadius, string> = {
  none: 'rounded-none',
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const surfaceElevationStyles: Record<SurfaceElevation, string> = {
  none: 'shadow-none',
  low: 'shadow-low',
  medium: 'shadow-medium',
  high: 'shadow-high',
};

export const SURFACE_BORDER_STYLE = 'border border-panel-border';
export const SURFACE_INTERACTIVE_STYLE =
  'transition-colors duration-[var(--motion-fast)] ease-out hover:bg-surface-hover cursor-pointer';
export const SURFACE_FOCUS_STYLE =
  'focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2';
export const SURFACE_DISABLED_STYLE = 'opacity-50 pointer-events-none cursor-not-allowed';
