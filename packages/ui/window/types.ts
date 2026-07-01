import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type WindowState = 'default' | 'focused' | 'inactive';

export interface WindowOwnProps {
  state?: WindowState;
  className?: string;
  children?: ReactNode;
}

export type WindowProps = WindowOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof WindowOwnProps>;

export interface WindowSectionOwnProps {
  className?: string;
  children?: ReactNode;
}

export type WindowHeaderProps = WindowSectionOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof WindowSectionOwnProps>;
export type WindowContentProps = WindowSectionOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof WindowSectionOwnProps>;
export type WindowFooterProps = WindowSectionOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof WindowSectionOwnProps>;
