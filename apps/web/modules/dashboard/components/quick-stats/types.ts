export interface QuickStatItem {
  label: string;
  value: string;
}

export interface QuickStatsProps {
  stats: readonly QuickStatItem[];
}
