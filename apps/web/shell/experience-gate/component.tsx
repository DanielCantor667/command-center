'use client';

import { useState } from 'react';
import { ExperienceModule } from '../../modules/experience';
import { AppShell } from '../app-shell';
import { useWorkspaceStore } from '../workspace-store';
import type { WorkspaceModule } from '../workspace-store';

export function ExperienceGate() {
  const [entered, setEntered] = useState(false);
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);
  const setSelectedProjectId = useWorkspaceStore((state) => state.setSelectedProjectId);

  const enter = (module: WorkspaceModule = 'dashboard', projectId?: string) => {
    setSelectedProjectId(projectId ?? null);
    setCurrentModule(module);
    setEntered(true);
  };

  return entered ? <AppShell /> : <ExperienceModule onEnter={enter} />;
}
