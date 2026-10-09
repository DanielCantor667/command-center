'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Layers3, Moon, RotateCcw, Sun, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import { PORTFOLIO_CAREER } from '../../data/portfolio-career';
import { PORTFOLIO_TECHNOLOGIES } from '../../data/portfolio-technologies';
import type { WorkspaceModule } from '../../shell/workspace-store';
import { CityNavigatorLoader } from './components/city-navigator-loader';
import { KliniuTour, type KliniuTourStop } from './components/kliniu-tour';
import { TechnologyExplorer, type TechnologyFilters } from './components/technology-explorer';
import styles from './experience.module.css';
import cinema from './cinematic.module.css';
import type { CityCameraHandle, WorkshopSnapshot } from './workshop-state';

export type PortfolioSection = 'projects' | 'technologies' | 'trajectory' | 'contact';
interface ExperienceModuleProps {
  initialWorkshop?: WorkshopSnapshot;
  onWorkshopSave?: (value: WorkshopSnapshot) => void;
  restoring?: boolean;
  reveal?: boolean;
  onEnter: (module?: WorkspaceModule, projectId?: string) => void;
  initialTechnologyFilters?: TechnologyFilters;
  onTechnologyFiltersChange?: (filters: TechnologyFilters) => void;
  initialProjectId?: string;
  onSelectionChange?: (id: string) => void;
  initialSection?: PortfolioSection;
  onSectionChange?: (section: PortfolioSection) => void;
  initialTechnologyId?: string;
  onTechnologyChange?: (id: string) => void;
}
const publishedProjects = PROJECTS.filter((project) => project.public && project.links.live);
const anchors: Record<PortfolioSection, string> = {
  projects: 'proyectos',
  technologies: 'tecnologias',
  trajectory: 'trayectoria',
  contact: 'contacto',
};
const sectionFromHash = (hash: string): PortfolioSection | null => {
  const entry = (Object.entries(anchors) as [PortfolioSection, string][]).find(
    ([, anchor]) => anchor === hash.replace(/^#/, ''),
  );
  return entry?.[0] ?? null;
};
export function ExperienceModule({
  onEnter,
  initialTechnologyFilters,
  onTechnologyFiltersChange,
  initialProjectId = 'kliniu',
  onSelectionChange,
  initialSection = 'projects',
  onSectionChange,
  initialTechnologyId = 'nextjs',
  onTechnologyChange,
  initialWorkshop,
  onWorkshopSave,
  restoring = false,
  reveal = true,
}: ExperienceModuleProps) {
  const initialReturn = useRef({ restoring, snapshot: initialWorkshop });
  const [selectedId, setSelectedId] = useState(initialWorkshop?.projectId ?? initialProjectId);
  const [section, setSection] = useState<PortfolioSection>(initialSection);
  const [technologyId, setTechnologyId] = useState(initialTechnologyId);
  const [detail, setDetail] = useState(initialWorkshop?.detail ?? false);
  const [exploded, setExploded] = useState(initialWorkshop?.exploded ?? false);
  const [night, setNight] = useState(initialWorkshop?.night ?? false);
  const [sceneEnabled, setSceneEnabled] = useState<boolean | null>(initialWorkshop?.sceneEnabled ?? null);
  const cameraHandle = useRef<CityCameraHandle | null>(null);
  const [revealing, setRevealing] = useState(reveal);
  const [sceneActive, setSceneActive] = useState(false);
  const [viewRevision, setViewRevision] = useState(0);
  const [tourStop, setTourStop] = useState<KliniuTourStop>(initialWorkshop?.tourStop ?? 'catalog');
  const [entering, setEntering] = useState(false);
  const [entranceToken, setEntranceToken] = useState(0);
  const nextEntranceToken = useRef(0);
  const entrancePending = useRef<{ token: number; snapshot: WorkshopSnapshot; section: PortfolioSection; hash: string } | null>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const selected =
    publishedProjects.find((project) => project.id === selectedId) ?? publishedProjects[0]!;
  const technology =
    PORTFOLIO_TECHNOLOGIES.find((item) => item.id === technologyId) ?? PORTFOLIO_TECHNOLOGIES[0]!;
  const capture = selected.media.find((media) => media.featured && media.type === 'image');
  const techMode = section === 'technologies';
  const tourVisible = detail && selected.id === 'kliniu' && !techMode;
  const didMount = useRef(false);
  const restoredSection = useRef(restoring ? section : null);
  const scrollOverride = useRef<string | null>(null);
  const skipSectionScroll = useRef(false);
  const cancelEntrance = useCallback((restoreFocus = true) => {
    const pending = entrancePending.current;
    entrancePending.current = null;
    setEntering(false);
    if (pending) {
      const snapshot = pending.snapshot;
      setDetail(snapshot.detail);
      setExploded(snapshot.exploded);
      setTourStop(snapshot.tourStop);
      if (restoreFocus && snapshot.camera) cameraHandle.current?.restore(snapshot.camera);
      if (restoreFocus) {
        skipSectionScroll.current = pending.section !== 'projects';
        setSection(pending.section);
        onSectionChange?.(pending.section);
        window.history.replaceState(null, '', pending.hash || window.location.pathname);
        requestAnimationFrame(() => window.scrollTo(0, snapshot.scrollY));
      }
    }
    if (restoreFocus) requestAnimationFrame(() => enterButton.current?.focus({ preventScroll: true }));
  }, [onSectionChange]);
  useEffect(() => () => { entrancePending.current = null; }, []);
  const completeEntrance = useCallback((token = entranceToken) => {
    const pending = entrancePending.current;
    if (!pending || pending.token !== entranceToken || pending.token !== token) return;
    entrancePending.current = null;
    onEnter('projects', pending.snapshot.projectId);
  }, [onEnter, entranceToken]);
  useEffect(() => {
    if (!revealing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setRevealing(false); return; }
    const timer = window.setTimeout(() => setRevealing(false), 450);
    return () => window.clearTimeout(timer);
  }, [revealing]);
  useEffect(() => {
    const { restoring: shouldRestore, snapshot } = initialReturn.current;
    if (!shouldRestore || !snapshot) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, snapshot.scrollY);
      enterButton.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!entering) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') cancelEntrance(); };
    window.addEventListener('keydown', escape);
    // A suspended or lost WebGL context must never trap the visitor in the entrance.
    const timeout = window.setTimeout(completeEntrance, 2600);
    return () => { window.clearTimeout(timeout); window.removeEventListener('keydown', escape); };
  }, [entering, cancelEntrance, completeEntrance]);
  useEffect(() => {
    const syncHash = () => {
      const next = sectionFromHash(window.location.hash);
      if (next) {
        setSection(next);
        onSectionChange?.(next);
      }
    };
    if (!restoring) syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [onSectionChange, restoring]);
  useEffect(() => {
    // StrictMode replays mount effects; keep the restored scroll until navigation.
    if (restoredSection.current === section) { didMount.current = true; return; }
    restoredSection.current = null;
    if (skipSectionScroll.current) {
      skipSectionScroll.current = false;
      scrollOverride.current = null;
      return;
    }
    const hashSection = sectionFromHash(window.location.hash);
    if (!didMount.current) {
      if (restoring) return;
      if (section === 'projects' && !hashSection) return;
      didMount.current = true;
    }
    const target = scrollOverride.current ?? anchors[section];
    scrollOverride.current = null;
    const frame = requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [section, restoring]);
  const navigate = (next: PortfolioSection) => {
    if (entrancePending.current) cancelEntrance(false);
    window.history.replaceState(null, '', `#${anchors[next]}`);
    setSection(next);
    onSectionChange?.(next);
    if (next === section) document.getElementById(anchors[next])?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    if (next === 'technologies') { setDetail(false); setExploded(false); setTourStop('catalog'); }
  };
  const selectProject = (id: string) => {
    if (entrancePending.current) cancelEntrance(false);
    if (!publishedProjects.some((project) => project.id === id)) return;
    setSelectedId(id);
    setTourStop('catalog');
    setDetail(true);
    setViewRevision(value => value + 1);
    onSelectionChange?.(id);
    if (techMode) {
      setSection('projects');
      onSectionChange?.('projects');
      setDetail(true);
    }
  };
  const selectTechnology = (id: string) => {
    setTechnologyId(id);
    onTechnologyChange?.(id);
  };
  const selectTourStop = (stop: KliniuTourStop) => {
    setTourStop(stop);
    setViewRevision(value => value + 1);
  };
  const saveWorkshop = (projectId = selected.id) => {
    const snapshot: WorkshopSnapshot = {
      projectId, detail: projectId === selected.id ? detail : true, exploded, night,
      sceneEnabled, tourStop, camera: projectId === selected.id ? cameraHandle.current?.capture() ?? null : null,
      scrollY: window.scrollY,
    };
    onWorkshopSave?.(snapshot);
    return snapshot;
  };
  const openTechnologyProject = (id: string) => {
    saveWorkshop(id);
    onSelectionChange?.(id);
    onEnter('projects', id);
  };
  const enterFeaturedProject = () => {
    if (entrancePending.current) return;
    const snapshot = saveWorkshop();
    const previousSection = section;
    const previousHash = window.location.hash;
    window.history.replaceState(null, '', '#inicio');
    if (section !== 'projects') scrollOverride.current = 'inicio';
    setSection('projects');
    onSectionChange?.('projects');
    if (!sceneActive || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onEnter('projects', selected.id);
      return;
    }
    const token = ++nextEntranceToken.current;
    entrancePending.current = { token, snapshot, section: previousSection, hash: previousHash };
    setEntranceToken(token);
    setDetail(true);
    setExploded(false);
    setEntering(true);
    setViewRevision(value => value + 1);
    cityRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  return (
    <main className={`${styles.experience} ${cinema.experience}`} data-project={selected.id} data-night={night}
      data-reveal={revealing} onPointerDownCapture={() => setRevealing(false)} onKeyDownCapture={() => setRevealing(false)} onWheelCapture={() => setRevealing(false)}>
      <a className={styles.skipLink} href="#proyectos">
        Ir a los proyectos
      </a>
      <header className={cinema.header}>
        <a
          className={cinema.identity}
          href="#inicio"
          onClick={(event) => {
            event.preventDefault();
            if (entrancePending.current) cancelEntrance(false);
            window.history.replaceState(null, '', '#inicio');
            scrollOverride.current = 'inicio';
            setSection('projects');
            onSectionChange?.('projects');
            if (section === 'projects')
              requestAnimationFrame(() =>
                document.getElementById('inicio')?.scrollIntoView({ block: 'start' }),
              );
          }}
        >
          <span className={cinema.monogram} aria-hidden="true">dc.</span>
          <span>Daniel Cantor<br /><small>Desarrollo & diseño</small></span>
        </a>
        <nav className={styles.navigation} aria-label="Navegación principal">
          {(
            [
              ['projects', 'Proyectos'],
              ['technologies', 'Tecnologías'],
              ['trajectory', 'Trayectoria'],
              ['contact', 'Contacto'],
            ] as const
          ).map(([id, label]) => (
            <a
              key={id}
              href={`#${anchors[id]}`}
              aria-current={section === id ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(id);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      <section id="inicio" className={cinema.hero} aria-label="Portafolio de proyectos" data-detail={detail} data-entering={entering}>
          <div ref={cityRef} className={`${styles.cityStage} ${cinema.stage}`} data-detail={detail} data-night={night}>
            <CityNavigatorLoader
              immersive
              entering={entering}
              entranceToken={entranceToken}
              onEntranceReady={completeEntrance}
              onSceneError={() => completeEntrance()}
              cameraHandle={cameraHandle}
              initialCamera={initialReturn.current.snapshot?.camera}
              initialEnabled={sceneEnabled}
              onEnabledChange={setSceneEnabled}
              reveal={revealing}
              section={techMode ? 'technologies' : 'projects'}
              selectedProjectId={selected.id}
              onProjectSelect={selectProject}
              viewRevision={viewRevision}
              detail={detail}
              tourStop={tourVisible && !entering ? tourStop : undefined}
              onTourSelect={selectTourStop}
              exploded={exploded && detail && !techMode}
              night={night}
              onActiveChange={setSceneActive}
              selectedTechnologyId={technology.id}
              highlightedProjectIds={technology.projectIds}
              onTechnologiesOpen={() => navigate('technologies')}
            />
          </div>
          <div className={cinema.intro}>
            <p className={cinema.kicker}>Portafolio independiente <span> / Bogotá, CO</span></p>
            <h1 className={detail || techMode ? cinema.srOnly : undefined}>Daniel <span>Cantor</span></h1>
            {(detail || techMode) && <h2 className={cinema.projectTitle}>{techMode ? 'Detrás de cada idea.' : selected.name}</h2>}
            <p className={cinema.manifesto}>{detail && !techMode ? selected.tagline : 'Código con intención.\nProductos con carácter.'}</p>
            <button ref={enterButton} className={cinema.enter} type="button" onClick={enterFeaturedProject} disabled={entering}>
              <span>Entrar a {selected.name}</span><ArrowUpRight size={22} aria-hidden="true" />
            </button>
            <a className={cinema.directLink} href="#proyectos" onClick={event => { event.preventDefault(); navigate('projects'); }}>
              Ver proyectos <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
          <div className={cinema.sceneControls} inert={entering}>
              <span className={cinema.sceneCaption}>{techMode ? 'Biblioteca de tecnologías' : detail ? selected.name + ' / Distrito de producto' : 'El taller de Daniel'}</span>
              <div className={`${styles.sceneTools} ${cinema.tools}`}>
              <button type="button" aria-label="Iluminación nocturna" role="switch" aria-checked={night} disabled={!sceneActive} title={sceneActive ? 'Iluminación nocturna' : 'Activa la vista 3D'} onClick={() => setNight(value => !value)}>
                {night ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button type="button" aria-label="Separar capas" aria-pressed={exploded && detail} disabled={techMode || !sceneActive} title={sceneActive ? 'Separar capas' : 'Activa la vista 3D'} onClick={() => { setExploded(value => !value); setDetail(true); }}>
                <Layers3 size={18} />
              </button>
              <button
                type="button"
                aria-label="Vista general"
                title="Vista general"
                onClick={() => {
                  setDetail(false);
                  setExploded(false);
                  setTourStop('catalog');
                  setViewRevision((value) => value + 1);
                  setSection('projects');
                  onSectionChange?.('projects');
                }}
              >
                <RotateCcw size={18} />
              </button>
              </div>
          </div>
          <div className={cinema.projectIndex} inert={entering}>
            <div className={cinema.indexHeading}><span>Proyectos seleccionados</span><span>{publishedProjects.length.toString().padStart(2, '0')} / En producción</span></div>
            <div className={cinema.projectList} role="group" aria-label="Seleccionar proyecto">
              {publishedProjects.map((project, index) => (
                <button key={project.id} type="button" className={cinema.projectChoice}
                  data-related={techMode ? technology.projectIds.includes(project.id) : undefined}
                  aria-label={`Seleccionar ${project.name}`} aria-pressed={!techMode && selected.id === project.id}
                  onClick={() => selectProject(project.id)}>
                  <span className={cinema.projectNumber}>{(index + 1).toString().padStart(2, '0')}</span>
                  <Image src={`/experience/${project.id === 'kliniu' ? 'kliniu-showroom' : project.id === '4ustudio-academy' ? 'academy-brand' : `${project.id}-brand`}-thumb.jpg`} alt="" width={64} height={54} />
                  <span>{project.name}</span><ArrowUpRight size={17} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
          {entering && <div className={cinema.entranceActions}>
            <span role="status">{selected.name} / Entrando al proyecto</span>
            <button type="button" onClick={() => completeEntrance()}>Omitir entrada <ArrowUpRight size={16} /></button>
            <button type="button" onClick={() => cancelEntrance()} aria-label="Cancelar entrada" title="Cancelar entrada"><X size={20} /></button>
          </div>}
      </section>
      <div className={cinema.interlude} inert={entering}>
          <p><span className={cinema.liveDot} />Ideas que llegan a producción.</p>
          <div className={`${styles.sceneTabs} ${cinema.viewTabs}`} aria-label="Vistas del taller">
            <button
              type="button"
              aria-pressed={!detail && !techMode}
              onClick={() => {
                setDetail(false);
                setExploded(false);
                setTourStop('catalog');
                setSection('projects');
                onSectionChange?.('projects');
                setViewRevision((value) => value + 1);
              }}
            >
              El taller
            </button>
            <button
              type="button"
              aria-pressed={detail && !techMode}
              onClick={() => {
                setDetail(true);
                setSection('projects');
                onSectionChange?.('projects');
              }}
            >
              El proyecto
            </button>
            <button type="button" aria-pressed={techMode} onClick={() => navigate('technologies')}>
              Las tecnologías
            </button>
          </div>
      </div>
          {tourVisible && !entering && (
            <div className={cinema.tour}>
            <KliniuTour stop={tourStop} onSelect={selectTourStop}
              onCase={() => openTechnologyProject('kliniu')}
              onContact={() => navigate('contact')} />
            </div>
          )}
      <section
        id={techMode ? 'tecnologias' : 'proyectos'}
        className={styles.contentSection}
        inert={entering}
        aria-label={techMode ? 'Tecnologías y proyectos' : 'Proyecto seleccionado'}
      >
        <div className={styles.sectionHeading}>
          <div>
            <p>{techMode ? 'Mi caja de herramientas' : 'Una mirada al producto'}</p>
            <h2>{techMode ? 'Tecnologías con trabajo detrás.' : 'Del taller a la web.'}</h2>
          </div>
          <p>
            {techMode
              ? 'Selecciona una pieza. Descubre cómo la uso y en qué proyectos puedes verla.'
              : 'Cuatro sitios publicados. Capturas reales y decisiones detrás de cada proyecto.'}
          </p>
        </div>
        {techMode ? (
          <TechnologyExplorer
            initialFilters={initialTechnologyFilters}
            onFiltersChange={onTechnologyFiltersChange}
            selectedId={technology.id}
            onSelect={selectTechnology}
            onProjectSelect={openTechnologyProject}
          />
        ) : (
          <article
            id="project-preview"
            className={styles.preview}
            aria-label={`Vista previa de ${selected.name}`}
          >
            <div className={styles.previewImage}>
              {capture && (
                <Image
                  key={capture.url}
                  src={capture.url}
                  alt={`Vista real de ${selected.name}`}
                  width={1440}
                  height={1000}
                  sizes="(max-width:800px) 100vw, 55vw"
                  priority
                />
              )}
            </div>
            <div className={styles.previewContent}>
              <p className={styles.projectType}>{selected.tagline}</p>
              <h3>{selected.name}</h3>
              <p>{selected.summary}</p>
              <div className={styles.previewStack}>
                {PORTFOLIO_TECHNOLOGIES.filter((item) => item.projectIds.includes(selected.id))
                  .slice(0, 5)
                  .map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        selectTechnology(item.id);
                        navigate('technologies');
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
              </div>
              <div className={styles.previewActions}>
                <button
                  type="button"
                  onClick={() => openTechnologyProject(selected.id)}
                  aria-label={`Ver caso de ${selected.name}`}
                >
                  Ver el proyecto
                </button>
                <a href={selected.links.live} target="_blank" rel="noreferrer">
                  Visitar sitio
                </a>
              </div>
              <button
                className={styles.detailButton}
                type="button"
                aria-pressed={detail}
                onClick={() => {
                  setDetail((value) => !value);
                  setTourStop('catalog');
                  cityRef.current?.scrollIntoView({
                    block: 'center',
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? 'instant'
                      : 'smooth',
                  });
                }}
              >
                {detail ? 'Alejar distrito' : 'Acercar distrito ' + selected.name}
              </button>
            </div>
          </article>
        )}
      </section>
      <section id="trayectoria" className={styles.journey} inert={entering}>
        <div className={styles.journeyIntro}>
          <p className={styles.eyebrow}>Detrás de los proyectos</p>
          <h2>
            Aprender.
            <br /> Construir.
            <br /> Volver a intentar.
          </h2>
          <p>
            Soy Daniel, desarrollador Full-Stack en Bogotá. Trabajo desde el modelado de datos hasta
            la interfaz que usa cada persona.
          </p>
          <div className={styles.languages}>
            {PORTFOLIO_CAREER.languages.map((item) => (
              <p key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.level}</span>
              </p>
            ))}
          </div>
        </div>
        <div className={styles.career}>
          <h3>Experiencia</h3>
          {PORTFOLIO_CAREER.experience.map((item) => (
            <article key={item.id}>
              <p className={styles.period}>{item.period}</p>
              <h4>{item.title}</h4>
              <p className={styles.organization}>{item.organization}</p>
              <p>{item.description}</p>
            </article>
          ))}
          <h3>Formación</h3>
          {PORTFOLIO_CAREER.education.map((item) => (
            <article key={item.id}>
              <p className={styles.period}>{item.period}</p>
              <h4>{item.title}</h4>
              <p>{item.organization}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="contacto" className={styles.contact} inert={entering}>
        <div>
          <p className={styles.eyebrow}>Sigamos construyendo</p>
          <h2>¿Qué tienes en mente?</h2>
          <p>Disponible para colaborar en productos web, e-commerce e integraciones.</p>
        </div>
        <div className={styles.contactLinks}>
          <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">
            Hablemos en LinkedIn
          </a>
          <a href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer">
            Explorar mi GitHub
          </a>
        </div>
      </section>
      <footer className={styles.footer} inert={entering}>
        <span>Daniel Cantor · Taller digital</span>
        <div>
          <button type="button" onClick={() => onEnter('projects')}>
            Ver todos los proyectos
          </button>
          <button type="button" onClick={() => onEnter('lab')}>
            Laboratorio 3D
          </button>
        </div>
        <span>Bogotá, Colombia</span>
      </footer>
    </main>
  );
}
