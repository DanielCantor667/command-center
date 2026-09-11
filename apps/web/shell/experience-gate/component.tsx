'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import { PortfolioCase } from '../../modules/projects/components/portfolio-case/component';
import { ExperienceModule } from '../../modules/experience';
import { AppShell } from '../app-shell';
import { useWorkspaceStore } from '../workspace-store';
import type { WorkspaceModule } from '../workspace-store';
import styles from './experience-gate.module.css';

export function ExperienceGate() {
  const [cityProjectId, setCityProjectId] = useState('kliniu');
  const [caseId, setCaseId] = useState<string | null>(null);
  const [transitionProject, setTransitionProject] = useState<string | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entered, setEntered] = useState(false);
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);
  const setSelectedProjectId = useWorkspaceStore((state) => state.setSelectedProjectId);

  useEffect(() => () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); }, []);

  const enter = (module: WorkspaceModule = 'dashboard', projectId?: string) => {
    if (module === 'projects' && projectId && PROJECTS.some(project => project.id === projectId && project.public)) {
      setCityProjectId(projectId);
      setTransitionProject(projectId);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (reduce) setCaseId(projectId);
      else transitionTimer.current = setTimeout(() => setCaseId(projectId), 420);
      return;
    }
    setSelectedProjectId(projectId ?? null);
    setCurrentModule(module);
    setEntered(true);
  };

  const activeCase = PROJECTS.find(project => project.id === caseId);
  if (activeCase) return <PortfolioCase project={activeCase} onSelect={id => { setCaseId(id); setCityProjectId(id); }} onReturn={() => { setCaseId(null); setTransitionProject(null); window.scrollTo(0, 0); }} />;

  if (transitionProject) {
    const project = PROJECTS.find(item => item.id === transitionProject);
    return <div className={styles.transition} role="status" aria-live="polite"><div><span>Abriendo proyecto</span><strong>{project?.name}</strong></div></div>;
  }

  return entered ? <AppShell onReturnToCity={() => { setEntered(false); window.scrollTo(0, 0); }} /> : <ExperienceModule onEnter={enter} initialProjectId={cityProjectId} onSelectionChange={setCityProjectId} />;
}
