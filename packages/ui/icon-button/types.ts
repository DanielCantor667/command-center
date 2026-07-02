import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ButtonVariant } from '../button/types';

export type IconButtonSize = 16 | 20 | 24 | 32;

export interface IconButtonOwnProps {
  variant?: ButtonVariant;
  size?: IconButtonSize;
  label: string;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

export type IconButtonProps = IconButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonOwnProps | 'aria-label'>;
