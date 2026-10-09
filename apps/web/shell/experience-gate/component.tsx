'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PROJECTS } from '../../data/projects';
import { PortfolioCase } from '../../modules/projects/components/portfolio-case/component';
import { ExperienceModule } from '../../modules/experience';
import { WorkshopGame } from '../../modules/workshop-game/component';
import type { GameSnapshot } from '../../modules/workshop-game/world-state';
import { readWorkshopReading, writeWorkshopReading, type WorkshopReading } from '../../modules/workshop-game/reading';
import type { TechnologyFilters } from '../../modules/experience/components/technology-explorer';
import type { PortfolioSection } from '../../modules/experience/component';
import type { WorkshopSnapshot } from '../../modules/experience/workshop-state';
import { AppShell } from '../app-shell';
import { useWorkspaceStore } from '../workspace-store';
import type { WorkspaceModule } from '../workspace-store';

export function ExperienceGate() {
  const [publicMode, setPublicMode] = useState<'game' | 'portfolio'>('game');
  const gameSnapshot = useRef<GameSnapshot | undefined>(undefined);
  const [reading, setReading] = useState<WorkshopReading | null>(null);
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
    const readLocation = () => {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('project');
      setPublicMode(url.searchParams.get('view') === 'portfolio' || ['#proyectos', '#tecnologias', '#trayectoria', '#contacto'].includes(url.hash) ? 'portfolio' : 'game');
      setReading(readWorkshopReading(url));
      if (id && PROJECTS.some(project => project.public && project.id === id)) setCaseId(id);
      else setCaseId(null);
      opening.current = false;
      transitionToken.current += 1;
      visualTransition.current?.skipTransition();
      visualTransition.current = null;
    };
    readLocation();
    window.addEventListener('popstate', readLocation);
    return () => window.removeEventListener('popstate', readLocation);
  }, []);

  const caseLocation = (id: string | null, replace = false) => {
    if (id && publicMode !== 'game') return;
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('project', id); else url.searchParams.delete('project');
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url.toString());
  };
  const openPortfolio = () => {
    const url = writeWorkshopReading(new URL(window.location.href), null);
    url.searchParams.set('view', 'portfolio');
    url.searchParams.delete('project');
    window.history.replaceState(null, '', url.toString());
    setPublicMode('portfolio');
    setReading(null);
  };
  const read = (next: WorkshopReading | null) => {
    const url = writeWorkshopReading(new URL(window.location.href), next);
    window.history.pushState(null, '', url.toString());
    setReading(readWorkshopReading(url));
  };

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
      void transition.ready.catch(() => {});
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
        caseLocation(projectId);
        setCityProjectId(projectId);
        setCaseId(projectId);
      };
      const release = () => { if (transitionToken.current === token) opening.current = false; };
      if (!reduce && document.startViewTransition) {
        opening.current = true;
        try {
          const transition = document.startViewTransition(() => flushSync(showCase));
          void transition.ready.catch(() => {});
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
      if (publicMode === 'game' && section) {
        const next: WorkshopReading = section === 'projects' ? { kind: 'map' } : section === 'technologies' ? { kind: 'technologies', technologyId: technology ?? (reading?.kind === 'technologies' ? reading.technologyId : 'nextjs') } : { kind: section };
        const url = writeWorkshopReading(new URL(window.location.href), next);
        url.searchParams.delete('project');
        window.history.pushState(null, '', url.toString());
        setReading(readWorkshopReading(url));
        if (technology) setTechnologyFilters({ query: '', category: 'all', projectId: null });
        setCaseId(null); opening.current = false; setEntered(false);
        return;
      }
      caseLocation(null, true);
      setReveal(false);
      setRestoring(!section);
      if (section) {
        setPublicMode('portfolio');
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
  const caseView = activeCase ? (
      <PortfolioCase
        key={activeCase.id}
        project={activeCase}
        returnLabel={publicMode === 'game' ? reading ? ({ technologies: 'Volver a tecnologías', trajectory: 'Volver a trayectoria', contact: 'Volver a contacto', map: 'Volver al mapa' })[reading.kind] : 'Volver al taller' : undefined}
        onSelect={(id) => {
          if (id === caseId || !PROJECTS.some((project) => project.id === id && project.public)) return;
          const visible = PROJECTS.filter((project) => project.public && project.links.live);
          const kind = visible.findIndex((project) => project.id === id) > visible.findIndex((project) => project.id === caseId) ? 'next' : 'previous';
          changeCaseView(kind, id, () => {
            caseLocation(id);
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
    ) : null;

  if (publicMode === 'game' && !entered) return <>
    <div data-workshop-keeper inert={!!activeCase} aria-hidden={activeCase ? true : undefined} style={activeCase ? { transitionProperty: 'none', position: 'fixed', inset: 0, visibility: 'hidden', pointerEvents: 'none' } : { transitionProperty: 'none' }}>
      <WorkshopGame initialSnapshot={gameSnapshot.current} suspended={!!activeCase}
        reading={reading} onRead={read} technologyFilters={technologyFilters} onTechnologyFiltersChange={setTechnologyFilters}
        onSave={snapshot => { gameSnapshot.current = snapshot; }}
        onOpenCase={id => enter('projects', id)} onPortfolio={openPortfolio} />
    </div>
    {caseView}
  </>;
  if (caseView) return caseView;
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
