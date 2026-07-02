import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { BUTTON_BASE_STYLE, BUTTON_LOADING_STYLE, BUTTON_SPINNER_STYLE, buttonSizeStyles, buttonVariantStyles } from './styles';
import type { ButtonProps } from './types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, type = 'button', className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BUTTON_BASE_STYLE, buttonVariantStyles[variant], buttonSizeStyles[size], loading && BUTTON_LOADING_STYLE, className)}
      {...rest}
    >
      {loading && <span aria-hidden="true" className={BUTTON_SPINNER_STYLE} />}
      {children}
    </button>
  );
});
