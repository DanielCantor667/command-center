import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkspaceStore } from '../workspace-store';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('useWorkspaceStore', () => {
  it('starts with no current module', () => {
    expect(useWorkspaceStore.getState().currentModule).toBeNull();
  });

  it('setCurrentModule updates currentModule', () => {
    useWorkspaceStore.getState().setCurrentModule('dashboard');
    expect(useWorkspaceStore.getState().currentModule).toBe('dashboard');
  });

  it('setCurrentModule can switch between modules', () => {
    useWorkspaceStore.getState().setCurrentModule('lab');
    useWorkspaceStore.getState().setCurrentModule('projects');
    expect(useWorkspaceStore.getState().currentModule).toBe('projects');
  });

  it('resetWorkspace clears currentModule', () => {
    useWorkspaceStore.getState().setCurrentModule('mission');
    useWorkspaceStore.getState().resetWorkspace();
    expect(useWorkspaceStore.getState().currentModule).toBeNull();
  });
});
