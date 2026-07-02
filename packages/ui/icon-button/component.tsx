import { forwardRef } from 'react';
import { Button } from '../button/component';
import { cn } from '../lib/cn';
import { ICON_BUTTON_BASE_STYLE, iconButtonSizeStyles } from './styles';
import type { IconButtonProps } from './types';

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', size = 24, label, loading = false, className, children, ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      loading={loading}
      aria-label={label}
      className={cn(ICON_BUTTON_BASE_STYLE, iconButtonSizeStyles[size], className)}
      {...rest}
    >
      {children}
    </Button>
  );
});
