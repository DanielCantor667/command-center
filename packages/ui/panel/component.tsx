import { forwardRef } from 'react';
import { Surface } from '../surface/component';
import {
  PANEL_DEFAULT_BORDER,
  PANEL_DEFAULT_ELEVATION,
  PANEL_DEFAULT_PADDING,
  PANEL_DEFAULT_RADIUS,
  PANEL_DEFAULT_VARIANT,
} from './styles';
import type { PanelProps } from './types';

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  {
    variant = PANEL_DEFAULT_VARIANT,
    padding = PANEL_DEFAULT_PADDING,
    radius = PANEL_DEFAULT_RADIUS,
    elevation = PANEL_DEFAULT_ELEVATION,
    border = PANEL_DEFAULT_BORDER,
    ...rest
  },
  ref,
) {
  return (
    <Surface ref={ref} variant={variant} padding={padding} radius={radius} elevation={elevation} border={border} {...rest} />
  );
});
