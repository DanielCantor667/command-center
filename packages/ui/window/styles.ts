import type { WindowState } from './types';

export const windowStateStyles: Record<WindowState, string> = {
  default: 'border-panel-border',
  focused: 'border-accent',
  inactive: 'border-panel-border opacity-80',
};

export const WINDOW_BASE_STYLE = 'flex flex-col border';
export const WINDOW_HEADER_STYLE = 'flex items-center justify-between gap-8 border-b border-divider px-16 py-12';
export const WINDOW_CONTENT_STYLE = 'flex-1 overflow-auto p-16';
export const WINDOW_FOOTER_STYLE = 'flex items-center justify-end gap-8 border-t border-divider px-16 py-12';
