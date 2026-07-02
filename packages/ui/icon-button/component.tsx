import { forwardRef } from 'react';
import { Button } from '../button/component';
import { cn } from '../lib/cn';
import { ICON_BUTTON_BASE_STYLE, iconButtonSizeStyles } from './styles';
import type { IconButtonProps } from './types';

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', size = 24, label, loading = false, className, children, ...rest },
  ref,
) {
  // `aria-label` is omitted from IconButtonProps (see types.ts) so typed callers can't pass
  // it, but it's stripped again here at runtime in case it slips through (e.g. untyped JS
  // callers or a cast) so `label` always remains the single source of truth for the
  // accessible name.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 'aria-label': _ariaLabel, ...safeRest } = rest as typeof rest & { 'aria-label'?: string };

  return (
    <Button
      ref={ref}
      variant={variant}
      loading={loading}
      aria-label={label}
      className={cn(ICON_BUTTON_BASE_STYLE, iconButtonSizeStyles[size], className)}
      {...safeRest}
    >
      {children}
    </Button>
  );
});
