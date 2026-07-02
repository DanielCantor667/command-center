import type { DividerOrientation } from './types';

export const dividerOrientationStyles: Record<DividerOrientation, string> = {
  horizontal: 'w-full h-[var(--border-thin)] bg-divider',
  vertical: 'h-full w-[var(--border-thin)] bg-divider',
};
