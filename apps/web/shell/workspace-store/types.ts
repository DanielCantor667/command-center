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
  { id: 'dashboard', label: 'El taller' },
  { id: 'profile', label: 'Perfil' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'mission', label: 'Bitácora' },
  { id: 'analytics', label: 'Análisis' },
  { id: 'capabilities', label: 'Capacidades' },
  { id: 'lab', label: 'Laboratorio 3D' },
  { id: 'communication', label: 'Contacto' },
];

export interface WorkspaceState {
  currentModule: WorkspaceModule | null;
  selectedProjectId: string | null;
  setCurrentModule: (module: WorkspaceModule) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  resetWorkspace: () => void;
}
