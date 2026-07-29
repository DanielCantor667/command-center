export type WorkspaceModule =
  | 'dashboard'
  | 'profile'
  | 'projects'
  | 'mission'
  | 'analytics'
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
  { id: 'analytics', label: 'Analytics' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'lab', label: 'Lab' },
  { id: 'communication', label: 'Communication' },
];

export interface WorkspaceState {
  currentModule: WorkspaceModule | null;
  selectedProjectId: string | null;
  setCurrentModule: (module: WorkspaceModule) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  resetWorkspace: () => void;
}
