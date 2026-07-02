import { create } from 'zustand';
import type { WorkspaceState } from './types';

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentModule: null,
  setCurrentModule: (module) => set({ currentModule: module }),
  resetWorkspace: () => set({ currentModule: null }),
}));
