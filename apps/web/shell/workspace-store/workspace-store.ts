import { create } from 'zustand';
import type { WorkspaceState } from './types';

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentModule: null,
  selectedProjectId: null,
  setCurrentModule: (module) => set({ currentModule: module }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  resetWorkspace: () => set({ currentModule: null, selectedProjectId: null }),
}));
