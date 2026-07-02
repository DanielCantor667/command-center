import type { IconButtonSize } from './types';

export const iconButtonSizeStyles: Record<IconButtonSize, string> = {
  16: 'h-16 w-16 [&_svg]:h-8 [&_svg]:w-8',
  20: 'h-20 w-20 [&_svg]:h-10 [&_svg]:w-10',
  24: 'h-24 w-24 [&_svg]:h-12 [&_svg]:w-12',
  32: 'h-32 w-32 [&_svg]:h-16 [&_svg]:w-16',
};

export const ICON_BUTTON_BASE_STYLE = 'p-0 shrink-0';
