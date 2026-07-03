export interface SystemStatusItem {
  label: string;
  value: string;
}

export interface SystemStatusProps {
  items: readonly SystemStatusItem[];
}
