export type NavigationTarget = 'projects' | 'mission' | 'capabilities' | 'lab' | 'communication';

export interface QuickNavigationProps {
  onNavigate: (target: NavigationTarget) => void;
}
