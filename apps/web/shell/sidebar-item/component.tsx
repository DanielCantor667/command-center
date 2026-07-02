import { Button } from '@command-center/ui';
import type { SidebarItemProps } from './types';

export function SidebarItem({ label, active = false, onSelect, className }: SidebarItemProps) {
  return (
    <Button
      type="button"
      variant={active ? 'primary' : 'ghost'}
      size="md"
      onClick={onSelect}
      aria-current={active ? 'page' : undefined}
      className={['w-full justify-start overflow-hidden', className].filter(Boolean).join(' ')}
    >
      <span className="truncate">{label}</span>
    </Button>
  );
}
