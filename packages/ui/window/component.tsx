import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { Panel } from '../panel/component';
import {
  WINDOW_BASE_STYLE,
  WINDOW_CONTENT_STYLE,
  WINDOW_FOOTER_STYLE,
  WINDOW_HEADER_STYLE,
  windowStateStyles,
} from './styles';
import type { WindowContentProps, WindowFooterProps, WindowHeaderProps, WindowProps } from './types';

export const Window = forwardRef<HTMLDivElement, WindowProps>(function Window(
  { state = 'default', className, children, ...rest },
  ref,
) {
  return (
    <Panel
      ref={ref}
      role="group"
      padding="none"
      className={cn(WINDOW_BASE_STYLE, windowStateStyles[state], className)}
      {...rest}
    >
      {children}
    </Panel>
  );
});

export const WindowHeader = forwardRef<HTMLDivElement, WindowHeaderProps>(function WindowHeader(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(WINDOW_HEADER_STYLE, className)} {...rest}>
      {children}
    </div>
  );
});

export const WindowContent = forwardRef<HTMLDivElement, WindowContentProps>(function WindowContent(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(WINDOW_CONTENT_STYLE, className)} {...rest}>
      {children}
    </div>
  );
});

export const WindowFooter = forwardRef<HTMLDivElement, WindowFooterProps>(function WindowFooter(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(WINDOW_FOOTER_STYLE, className)} {...rest}>
      {children}
    </div>
  );
});
