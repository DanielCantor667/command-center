import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { SurfaceElevation, SurfaceRadius, SurfaceVariant } from '../surface/types';

export type PanelPadding = 'none' | 'sm' | 'md' | 'lg';

export interface PanelOwnProps {
  variant?: SurfaceVariant;
  padding?: PanelPadding;
  radius?: SurfaceRadius;
  elevation?: SurfaceElevation;
  border?: boolean;
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
}

export type PanelProps = PanelOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof PanelOwnProps>;
