export type WorkspaceModule =
  | 'dashboard'
  | 'profile'
  | 'projects'
  | 'mission'
  | 'capabilities'
  | 'lab'
  | 'communication';

export interface WorkspaceModuleDefinition {
  id: WorkspaceModule;
  label: string;
}

export const WORKSPACE_MODULES: readonly WorkspaceModuleDefinition[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'profile', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'mission', label: 'Mission Log' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'lab', label: 'Lab' },
  { id: 'communication', label: 'Communication' },
];

export interface WorkspaceState {
  currentModule: WorkspaceModule | null;
  setCurrentModule: (module: WorkspaceModule) => void;
  resetWorkspace: () => void;
}
