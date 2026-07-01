'use client';

import { Slot } from '@radix-ui/react-slot';
import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import {
  SURFACE_BORDER_STYLE,
  SURFACE_DISABLED_STYLE,
  SURFACE_FOCUS_STYLE,
  SURFACE_INTERACTIVE_STYLE,
  surfaceElevationStyles,
  surfacePaddingStyles,
  surfaceRadiusStyles,
  surfaceVariantStyles,
} from './styles';
import type { SurfaceProps } from './types';

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  {
    variant = 'default',
    padding = 'none',
    radius = 'none',
    elevation = 'none',
    border = false,
    interactive = false,
    disabled = false,
    asChild = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component
      ref={ref}
      aria-disabled={disabled || undefined}
      tabIndex={interactive && !disabled && !asChild ? 0 : undefined}
      className={cn(
        'block',
        surfaceVariantStyles[variant],
        surfacePaddingStyles[padding],
        surfaceRadiusStyles[radius],
        surfaceElevationStyles[elevation],
        border && SURFACE_BORDER_STYLE,
        interactive && !disabled && SURFACE_INTERACTIVE_STYLE,
        interactive && SURFACE_FOCUS_STYLE,
        disabled && SURFACE_DISABLED_STYLE,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
});
