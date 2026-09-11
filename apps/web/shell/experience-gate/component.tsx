'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import { PortfolioCase } from '../../modules/projects/components/portfolio-case/component';
import { ExperienceModule } from '../../modules/experience';
import type { TechnologyFilters } from '../../modules/experience/components/technology-explorer';
import type { PortfolioSection } from '../../modules/experience/component';
import { AppShell } from '../app-shell';
import { useWorkspaceStore } from '../workspace-store';
import type { WorkspaceModule } from '../workspace-store';
import styles from './experience-gate.module.css';

export function ExperienceGate() {
  const [portfolioSection, setPortfolioSection] = useState<PortfolioSection>('projects');
  const [technologyId, setTechnologyId] = useState('nextjs');
  const [technologyFilters, setTechnologyFilters] = useState<TechnologyFilters>({
    query: '',
    category: 'all',
    projectId: null,
  });
  const returnPosition = useRef(0);
  const [cityProjectId, setCityProjectId] = useState('kliniu');
  const [caseId, setCaseId] = useState<string | null>(null);
  const [transitionProject, setTransitionProject] = useState<string | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entered, setEntered] = useState(false);
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);
  const setSelectedProjectId = useWorkspaceStore((state) => state.setSelectedProjectId);

  useEffect(
    () => () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    },
    [],
  );

  const enter = (module: WorkspaceModule = 'dashboard', projectId?: string) => {
    if (
      module === 'projects' &&
      projectId &&
      PROJECTS.some((project) => project.id === projectId && project.public)
    ) {
      returnPosition.current = window.scrollY;
      setCityProjectId(projectId);
      setTransitionProject(projectId);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (reduce) setCaseId(projectId);
      else transitionTimer.current = setTimeout(() => setCaseId(projectId), 420);
      return;
    }
    returnPosition.current = window.scrollY;
    setSelectedProjectId(projectId ?? null);
    setCurrentModule(module);
    setEntered(true);
  };

  const returnToWorkshop = (section?: PortfolioSection, technology?: string) => {
    if (section) setPortfolioSection(section);
    if (technology) {
      setTechnologyId(technology);
      setTechnologyFilters({ query: '', category: 'all', projectId: null });
    }
    setCaseId(null);
    setTransitionProject(null);
    setEntered(false);
    if (!section) requestAnimationFrame(() => window.scrollTo(0, returnPosition.current));
  };

  const activeCase = PROJECTS.find((project) => project.id === caseId);
  if (activeCase)
    return (
      <PortfolioCase
        project={activeCase}
        onSelect={(id) => {
          setCaseId(id);
          setCityProjectId(id);
        }}
        onReturn={() => returnToWorkshop()}
        onNavigate={(section) => returnToWorkshop(section)}
        onTechnologySelect={(id) => returnToWorkshop('technologies', id)}
      />
    );

  if (transitionProject) {
    const project = PROJECTS.find((item) => item.id === transitionProject);
    return (
      <div className={styles.transition} role="status" aria-live="polite">
        <div>
          <span>Abriendo proyecto</span>
          <strong>{project?.name}</strong>
        </div>
      </div>
    );
  }

  return entered ? (
    <AppShell onReturnToCity={() => returnToWorkshop()} />
  ) : (
    <ExperienceModule
      initialTechnologyFilters={technologyFilters}
      onTechnologyFiltersChange={setTechnologyFilters}
      onEnter={enter}
      initialProjectId={cityProjectId}
      onSelectionChange={setCityProjectId}
      initialSection={portfolioSection}
      onSectionChange={setPortfolioSection}
      initialTechnologyId={technologyId}
      onTechnologyChange={setTechnologyId}
    />
  );
}
