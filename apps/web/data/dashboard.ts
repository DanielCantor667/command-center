export interface HeroData {
  name: string;
  role: string;
  missionStatement: string;
  status: string;
  availability: string;
}

export interface QuickStat {
  label: string;
  value: string;
}

export interface CurrentFocusData {
  title: string;
  status: string;
}

export interface ActivityItem {
  id: string;
  label: string;
}

export interface SystemStatusItem {
  label: string;
  value: string;
}

export const HERO_DATA: HeroData = {
  name: 'Daniel Cantor',
  role: 'Software Engineer',
  missionStatement: 'Building software with engineering discipline.',
  status: 'In Development',
  availability: 'Open to opportunities',
};

export const QUICK_STATS: readonly QuickStat[] = [
  { label: 'Projects', value: '12' },
  { label: 'Years of experience', value: '5' },
  { label: 'Technologies', value: '18' },
  { label: 'Repositories', value: '24' },
  { label: 'Articles', value: '4' },
];

export const CURRENT_FOCUS: CurrentFocusData = {
  title: 'Command Center OS',
  status: 'In Development',
};

export const RECENT_ACTIVITY: readonly ActivityItem[] = [
  { id: 'sprint-0.6', label: 'Sprint 0.6 started' },
  { id: 'rfc-0006', label: 'RFC-0006 approved' },
  { id: 'sprint-0.5', label: 'Module System shipped' },
  { id: 'design-system', label: 'Design System accepted' },
  { id: 'application-shell', label: 'Application Shell shipped' },
];

export const SYSTEM_STATUS: readonly SystemStatusItem[] = [
  { label: 'Theme', value: 'System' },
  { label: 'Version', value: 'v0.1.0-dev' },
  { label: 'Architecture', value: 'Modular' },
  { label: 'Tests', value: 'Passing' },
  { label: 'Build', value: 'Passing' },
  { label: 'Accessibility', value: 'AA' },
];
