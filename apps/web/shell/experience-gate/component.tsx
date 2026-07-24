'use client';

import { useState } from 'react';
import { ExperienceModule } from '../../modules/experience';
import { AppShell } from '../app-shell';
import { useWorkspaceStore } from '../workspace-store';
import type { WorkspaceModule } from '../workspace-store';

export function ExperienceGate() {
  const [entered, setEntered] = useState(false);
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);

  const enter = (module: WorkspaceModule = 'dashboard') => {
    setCurrentModule(module);
    setEntered(true);
  };

  return entered ? <AppShell /> : <ExperienceModule onEnter={enter} />;
}
