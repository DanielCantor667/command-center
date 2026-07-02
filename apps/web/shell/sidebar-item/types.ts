export interface SidebarItemProps {
  label: string;
  active?: boolean;
  onSelect?: () => void;
  className?: string;
}
