import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type SurfaceVariant = 'default' | 'subtle' | 'outlined' | 'interactive' | 'transparent';
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type SurfaceRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type SurfaceElevation = 'none' | 'low' | 'medium' | 'high';

export interface SurfaceOwnProps {
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
  radius?: SurfaceRadius;
  elevation?: SurfaceElevation;
  border?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
}

export type SurfaceProps = SurfaceOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof SurfaceOwnProps>;
