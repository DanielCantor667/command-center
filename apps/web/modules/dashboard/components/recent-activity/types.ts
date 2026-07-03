export interface RecentActivityItem {
  id: string;
  label: string;
}

export interface RecentActivityProps {
  items: readonly RecentActivityItem[];
}
