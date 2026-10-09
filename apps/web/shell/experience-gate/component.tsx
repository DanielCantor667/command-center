'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PROJECTS } from '../../data/projects';
import { PortfolioCase } from '../../modules/projects/components/portfolio-case/component';
import { ExperienceModule } from '../../modules/experience';
import type { TechnologyFilters } from '../../modules/experience/components/technology-explorer';
import type { PortfolioSection } from '../../modules/experience/component';
import type { WorkshopSnapshot } from '../../modules/experience/workshop-state';
import { AppShell } from '../app-shell';
import { useWorkspaceStore } from '../workspace-store';
import type { WorkspaceModule } from '../workspace-store';

export function ExperienceGate() {
  const [portfolioSection, setPortfolioSection] = useState<PortfolioSection>('projects');
  const [technologyId, setTechnologyId] = useState('nextjs');
  const [technologyFilters, setTechnologyFilters] = useState<TechnologyFilters>({
    query: '',
    category: 'all',
    projectId: null,
  });
  const returnPosition = useRef(0);
  const workshop = useRef<WorkshopSnapshot | undefined>(undefined);
  const [restoring, setRestoring] = useState(false);
  const [reveal, setReveal] = useState(true);
  const [cityProjectId, setCityProjectId] = useState('kliniu');
  const [caseId, setCaseId] = useState<string | null>(null);
  const opening = useRef(false);
  const transitionToken = useRef(0);
  const visualTransition = useRef<ViewTransition | null>(null);
  const [entered, setEntered] = useState(false);
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);
  const setSelectedProjectId = useWorkspaceStore((state) => state.setSelectedProjectId);

  useEffect(() => {
    const skip = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !visualTransition.current) return;
      visualTransition.current.skipTransition();
      visualTransition.current = null;
      delete document.documentElement.dataset.portfolioTransition;
      delete document.documentElement.dataset.portfolioProject;
    };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, []);

  const changeCaseView = (kind: 'return' | 'next' | 'previous', projectId: string, update: () => void, afterCommit: () => void) => {
    const token = ++transitionToken.current;
    visualTransition.current?.skipTransition();
    visualTransition.current = null;
    const root = document.documentElement;
    delete root.dataset.portfolioTransition;
    delete root.dataset.portfolioProject;
    let changed = false;
    const commit = () => {
      if (changed || transitionToken.current !== token) return;
      changed = true;
      flushSync(update);
      afterCommit();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
      commit();
      return;
    }
    root.dataset.portfolioTransition = kind;
    root.dataset.portfolioProject = projectId;
    const finish = () => {
      if (transitionToken.current !== token) return;
      visualTransition.current = null;
      delete root.dataset.portfolioTransition;
      delete root.dataset.portfolioProject;
    };
    try {
      const transition = document.startViewTransition(commit);
      visualTransition.current = transition;
      void transition.updateCallbackDone.catch(commit);
      void transition.finished.catch(commit).finally(finish);
    } catch {
      finish();
      commit();
    }
  };

  const enter = (module: WorkspaceModule = 'dashboard', projectId?: string) => {
    if (
      module === 'projects' &&
      projectId &&
      PROJECTS.some((project) => project.id === projectId && project.public)
    ) {
      if (opening.current) return;
      returnPosition.current = workshop.current?.scrollY ?? window.scrollY;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const token = ++transitionToken.current;
      let shown = false;
      const showCase = () => {
        if (transitionToken.current !== token || shown) return;
        shown = true;
        setCityProjectId(projectId);
        setCaseId(projectId);
      };
      const release = () => { if (transitionToken.current === token) opening.current = false; };
      if (!reduce && document.startViewTransition) {
        opening.current = true;
        try {
          const transition = document.startViewTransition(() => flushSync(showCase));
          void transition.updateCallbackDone.catch(() => { showCase(); release(); });
          void transition.finished.catch(showCase).finally(release);
        } catch {
          showCase();
          release();
        }
      } else showCase();
      return;
    }
    returnPosition.current = window.scrollY;
    setSelectedProjectId(projectId ?? null);
    setCurrentModule(module);
    setEntered(true);
  };

  const returnToWorkshop = (section?: PortfolioSection, technology?: string) => {
    const update = () => {
      setReveal(false);
      setRestoring(!section);
      if (section) {
        setPortfolioSection(section);
        const anchors = { projects: 'proyectos', technologies: 'tecnologias', trajectory: 'trayectoria', contact: 'contacto' };
        window.history.replaceState(null, '', `#${anchors[section]}`);
      }
      if (technology) {
        setTechnologyId(technology);
        setTechnologyFilters({ query: '', category: 'all', projectId: null });
      }
      setCaseId(null);
      opening.current = false;
      setEntered(false);
    };
    if (!section && caseId) {
      changeCaseView('return', caseId, update,
        () => window.scrollTo(0, workshop.current?.scrollY ?? returnPosition.current));
    } else {
      transitionToken.current += 1;
      visualTransition.current?.skipTransition();
      update();
    }
  };

  const activeCase = PROJECTS.find((project) => project.id === caseId);
  if (activeCase)
    return (
      <PortfolioCase
        key={activeCase.id}
        project={activeCase}
        onSelect={(id) => {
          if (id === caseId || !PROJECTS.some((project) => project.id === id && project.public)) return;
          const visible = PROJECTS.filter((project) => project.public && project.links.live);
          const kind = visible.findIndex((project) => project.id === id) > visible.findIndex((project) => project.id === caseId) ? 'next' : 'previous';
          changeCaseView(kind, id, () => {
            opening.current = false;
            if (workshop.current) {
              workshop.current = { ...workshop.current, projectId: id, detail: true, camera: null };
            }
            setCaseId(id);
            setCityProjectId(id);
          }, () => window.scrollTo(0, 0));
        }}
        onReturn={() => returnToWorkshop()}
        onNavigate={(section) => returnToWorkshop(section)}
        onTechnologySelect={(id) => returnToWorkshop('technologies', id)}
      />
    );

  return entered ? (
    <AppShell onReturnToCity={() => returnToWorkshop()} />
  ) : (
    <ExperienceModule
      initialWorkshop={workshop.current}
      onWorkshopSave={(value) => { workshop.current = value; }}
      restoring={restoring}
      reveal={reveal}
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
