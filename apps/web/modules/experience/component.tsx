'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowUpRight, Layers3, Moon, RotateCcw, Sun, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useContent } from '../../data/content/content';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import type { WorkspaceModule } from '../../shell/workspace-store';
import { CityNavigatorLoader } from './components/city-navigator-loader';
import { KliniuTour, type KliniuTourStop } from './components/kliniu-tour';
import { TechnologyExplorer, type TechnologyFilters } from './components/technology-explorer';
import { LanguageSwitch } from '../../i18n/language-switch';
import { fill } from '../../i18n/format';
import { useDictionary, useLocale } from '../../i18n/locale-provider';
import styles from './experience.module.css';
import cinema from './cinematic.module.css';
import type { CityCameraHandle, WorkshopSnapshot } from './workshop-state';

export type PortfolioSection = 'projects' | 'technologies' | 'trajectory' | 'contact';
interface ExperienceModuleProps {
  onReturnToWorkshop?: () => void;
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
  onReturnToWorkshop,
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
  const locale = useLocale();
  const content = useContent();
  const publishedProjects = content.projects.filter((project) => project.public && project.links.live);
  const technologies = content.technologies;
  const career = content.career;
  const { portfolio: t } = useDictionary();
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
    technologies.find((item) => item.id === technologyId) ?? technologies[0]!;
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
  const returnToWorkshop = () => {
    if (entrancePending.current) {
      onWorkshopSave?.(entrancePending.current.snapshot);
      cancelEntrance(false);
    } else saveWorkshop();
    onReturnToWorkshop?.();
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
        {t.skipToProjects}
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
          <span>Daniel Cantor<br /><small>{t.subtitle}</small></span>
        </a>
        {onReturnToWorkshop && <button className={cinema.returnWorkshop} type="button" onClick={returnToWorkshop}>
          <ArrowLeft size={16} aria-hidden="true" />{t.back}
        </button>}
        <nav className={styles.navigation} aria-label={t.navigation}>
          {(
            ['projects', 'technologies', 'trajectory', 'contact'] as const
          ).map(id => [id, t.sections[id]] as const).map(([id, label]) => (
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
          <LanguageSwitch />
        </nav>
      </header>
      <section id="inicio" className={cinema.hero} aria-label={t.hero.label} data-detail={detail} data-entering={entering}>
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
            <p className={cinema.kicker}>{t.hero.kicker} <span> / Bogotá, CO</span></p>
            <h1 className={detail || techMode ? cinema.srOnly : undefined}>Daniel <span>Cantor</span></h1>
            {(detail || techMode) && <h2 className={cinema.projectTitle}>{techMode ? t.hero.techTitle : selected.name}</h2>}
            <p className={cinema.manifesto}>{detail && !techMode ? selected.tagline : t.hero.manifesto}</p>
            <button ref={enterButton} className={cinema.enter} type="button" onClick={enterFeaturedProject} disabled={entering}>
              <span>{fill(t.hero.enter, { name: selected.name })}</span><ArrowUpRight size={22} aria-hidden="true" />
            </button>
            <a className={cinema.directLink} href="#proyectos" onClick={event => { event.preventDefault(); navigate('projects'); }}>
              {t.hero.viewProjects} <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
          <div className={cinema.sceneControls} inert={entering}>
              <span className={cinema.sceneCaption}>{techMode ? t.scene.techLibrary : detail ? fill(t.scene.district, { name: selected.name }) : t.scene.workshop}</span>
              <div className={`${styles.sceneTools} ${cinema.tools}`}>
              <button type="button" aria-label={t.scene.night} role="switch" aria-checked={night} disabled={!sceneActive} title={sceneActive ? t.scene.night : t.scene.activate} onClick={() => setNight(value => !value)}>
                {night ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button type="button" aria-label={t.scene.explode} aria-pressed={exploded && detail} disabled={techMode || !sceneActive} title={sceneActive ? t.scene.explode : t.scene.activate} onClick={() => { setExploded(value => !value); setDetail(true); }}>
                <Layers3 size={18} />
              </button>
              <button
                type="button"
                aria-label={t.scene.overview}
                title={t.scene.overview}
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
            <div className={cinema.indexHeading}><span>{t.index.selected}</span><span>{publishedProjects.length.toString().padStart(2, '0')} / {t.index.live}</span></div>
            <div className={cinema.projectList} role="group" aria-label={t.index.select}>
              {publishedProjects.map((project, index) => (
                <button key={project.id} type="button" className={cinema.projectChoice}
                  data-related={techMode ? technology.projectIds.includes(project.id) : undefined}
                  aria-label={fill(t.index.selectOf, { name: project.name })} aria-pressed={!techMode && selected.id === project.id}
                  onClick={() => selectProject(project.id)}>
                  <span className={cinema.projectNumber}>{(index + 1).toString().padStart(2, '0')}</span>
                  <Image src={`/experience/${project.id === 'kliniu' ? 'kliniu-showroom' : project.id === '4ustudio-academy' ? 'academy-brand' : `${project.id}-brand`}-thumb.jpg`} alt="" width={64} height={54} />
                  <span>{project.name}</span><ArrowUpRight size={17} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
          {entering && <div className={cinema.entranceActions}>
            <span role="status">{fill(t.entering.status, { name: selected.name })}</span>
            <button type="button" onClick={() => completeEntrance()}>{t.entering.skip} <ArrowUpRight size={16} /></button>
            <button type="button" onClick={() => cancelEntrance()} aria-label={t.entering.cancel} title={t.entering.cancel}><X size={20} /></button>
          </div>}
      </section>
      <div className={cinema.interlude} inert={entering}>
          <p><span className={cinema.liveDot} />{t.interlude.live}</p>
          <div className={`${styles.sceneTabs} ${cinema.viewTabs}`} aria-label={t.interlude.views}>
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
              {t.interlude.workshop}
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
              {t.interlude.project}
            </button>
            <button type="button" aria-pressed={techMode} onClick={() => navigate('technologies')}>
              {t.interlude.technologies}
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
        aria-label={techMode ? t.content.techLabel : t.content.projectLabel}
      >
        <div className={styles.sectionHeading}>
          <div>
            <p>{techMode ? t.content.techEyebrow : t.content.projectEyebrow}</p>
            <h2>{techMode ? t.content.techTitle : t.content.projectTitle}</h2>
          </div>
          <p>
            {techMode ? t.content.techIntro : t.content.projectIntro}
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
            aria-label={fill(t.content.preview, { name: selected.name })}
          >
            <div className={styles.previewImage}>
              {capture && (
                <Image
                  key={capture.url}
                  src={capture.url}
                  alt={fill(t.content.realView, { name: selected.name })}
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
                {technologies.filter((item) => item.projectIds.includes(selected.id))
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
                  aria-label={fill(t.content.viewCaseOf, { name: selected.name })}
                >
                  {t.content.viewProject}
                </button>
                <a href={selected.links.live} target="_blank" rel="noreferrer">
                  {t.content.visitSite}
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
                {detail ? t.content.zoomOut : fill(t.content.zoomIn, { name: selected.name })}
              </button>
            </div>
          </article>
        )}
      </section>
      <section id="trayectoria" className={styles.journey} inert={entering}>
        <div className={styles.journeyIntro}>
          <p className={styles.eyebrow}>{t.journey.eyebrow}</p>
          <h2>
            {t.journey.title.map((line, index) => <span key={line}>{index > 0 && <br />}{index > 0 && ' '}{line}</span>)}
          </h2>
          <p>{t.journey.intro}</p>
          <div className={styles.languages}>
            {career.languages.map((item) => (
              <p key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.level}</span>
              </p>
            ))}
          </div>
        </div>
        <div className={styles.career}>
          <h3>{t.journey.experience}</h3>
          {career.experience.map((item) => (
            <article key={item.id}>
              <p className={styles.period}>{item.period}</p>
              <h4>{item.title}</h4>
              <p className={styles.organization}>{item.organization}</p>
              <p>{item.description}</p>
            </article>
          ))}
          <h3>{t.journey.education}</h3>
          {career.education.map((item) => (
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
          <p className={styles.eyebrow}>{t.contact.eyebrow}</p>
          <h2>{t.contact.title}</h2>
          <p>{t.contact.intro}</p>
        </div>
        <div className={styles.contactLinks}>
          <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">
            {t.contact.linkedin}
          </a>
          <a href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer">
            {t.contact.github}
          </a>
        </div>
      </section>
      <footer className={styles.footer} inert={entering}>
        <span>{t.footer}</span>
        {/* The internal workspace stays Spanish-only: hidden in English (specs/i18n-english.md, question 3). */}
        {locale === 'es' ? <div>
          <button type="button" onClick={() => onEnter('projects')}>
            Ver todos los proyectos
          </button>
          <button type="button" onClick={() => onEnter('lab')}>
            Laboratorio 3D
          </button>
        </div> : <div />}
        <span>{PUBLIC_PROFILE.location}</span>
      </footer>
    </main>
  );
}
