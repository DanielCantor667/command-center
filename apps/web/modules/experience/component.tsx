'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import { PORTFOLIO_CAREER } from '../../data/portfolio-career';
import { PORTFOLIO_TECHNOLOGIES } from '../../data/portfolio-technologies';
import type { WorkspaceModule } from '../../shell/workspace-store';
import { CityNavigatorLoader } from './components/city-navigator-loader';
import { TechnologyExplorer, type TechnologyFilters } from './components/technology-explorer';
import styles from './experience.module.css';

export type PortfolioSection = 'projects' | 'technologies' | 'trajectory' | 'contact';
interface ExperienceModuleProps {
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
function Mountains() {
  return (
    <svg className={styles.mountains} viewBox="0 0 250 45" fill="none" aria-hidden="true">
      <path
        d="M0 42 24 33 40 34 62 20 70 23 96 5 115 18 125 15 159 36 175 27 210 39 250 43M62 20 78 31 96 5 99 24 115 18M125 15 134 30 143 26 159 36M24 33 35 40 40 34"
        stroke="currentColor"
        strokeWidth=".8"
      />
    </svg>
  );
}
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
}: ExperienceModuleProps) {
  const [selectedId, setSelectedId] = useState(initialProjectId);
  const [section, setSection] = useState<PortfolioSection>(initialSection);
  const [technologyId, setTechnologyId] = useState(initialTechnologyId);
  const [detail, setDetail] = useState(false);
  const [viewRevision, setViewRevision] = useState(0);
  const cityRef = useRef<HTMLDivElement>(null);
  const selected =
    publishedProjects.find((project) => project.id === selectedId) ?? publishedProjects[0]!;
  const technology =
    PORTFOLIO_TECHNOLOGIES.find((item) => item.id === technologyId) ?? PORTFOLIO_TECHNOLOGIES[0]!;
  const capture = selected.media.find((media) => media.featured && media.type === 'image');
  const techMode = section === 'technologies';
  const didMount = useRef(false);
  const scrollOverride = useRef<string | null>(null);
  useEffect(() => {
    const syncHash = () => {
      const next = sectionFromHash(window.location.hash);
      if (next) {
        setSection(next);
        onSectionChange?.(next);
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [onSectionChange]);
  useEffect(() => {
    const hashSection = sectionFromHash(window.location.hash);
    if (!didMount.current) {
      didMount.current = true;
      if (section === 'projects' && !hashSection) return;
    }
    const target = scrollOverride.current ?? anchors[section];
    scrollOverride.current = null;
    requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      }),
    );
  }, [section]);
  const navigate = (next: PortfolioSection) => {
    window.history.replaceState(null, '', `#${anchors[next]}`);
    setSection(next);
    onSectionChange?.(next);
    if (next === 'technologies') setDetail(false);
  };
  const selectProject = (id: string) => {
    if (!publishedProjects.some((project) => project.id === id)) return;
    setSelectedId(id);
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
  const openTechnologyProject = (id: string) => {
    onSelectionChange?.(id);
    onEnter('projects', id);
  };
  return (
    <main className={styles.experience} data-project={selected.id}>
      <a className={styles.skipLink} href="#proyectos">
        Ir a los proyectos
      </a>
      <header className={styles.header}>
        <a
          className={styles.identity}
          href="#inicio"
          onClick={(event) => {
            event.preventDefault();
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
          {PUBLIC_PROFILE.name}
          <span>Full-Stack Developer</span>
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
      <section id="inicio" className={styles.workbench} aria-label="Portafolio de proyectos">
        <aside className={styles.index}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>El taller de Daniel</p>
            <h1>
              Productos reales.
              <br />
              De la idea al despliegue.
            </h1>
            <p>
              Diseño y desarrollo tiendas, plataformas y herramientas. Aquí puedes ver cómo están
              hechas.
            </p>
          </div>
          <div className={styles.projectIndex}>
            <h2>{techMode ? 'Proyectos con ' + technology.name : 'Proyectos publicados'}</h2>
            <div className={styles.projectList} role="group" aria-label="Seleccionar proyecto">
              {publishedProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={styles.projectChoice}
                  data-related={techMode ? technology.projectIds.includes(project.id) : undefined}
                  aria-label={`Seleccionar ${project.name}`}
                  aria-pressed={!techMode && selected.id === project.id}
                  onClick={() => selectProject(project.id)}
                >
                  <span>{project.name}</span>
                  <span className={styles.selectionMark} aria-hidden="true" />
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.otherProjects}
              onClick={() => navigate(techMode ? 'projects' : 'technologies')}
            >
              {techMode ? 'Volver a los proyectos' : 'Explorar mis tecnologías'}
            </button>
          </div>
          <div className={styles.location}>
            <span>Bogotá, Colombia</span>
            <Mountains />
            <p>Software construido con intención.</p>
          </div>
        </aside>
        <div className={styles.sceneColumn}>
          <div ref={cityRef} className={styles.cityStage} data-detail={detail}>
            <CityNavigatorLoader
              section={techMode ? 'technologies' : 'projects'}
              selectedProjectId={selected.id}
              onProjectSelect={selectProject}
              viewRevision={viewRevision}
              detail={detail}
              selectedTechnologyId={technology.id}
              highlightedProjectIds={technology.projectIds}
              onTechnologiesOpen={() => navigate('technologies')}
            />
            <div className={styles.cityToolbar}>
              <span>
                {techMode
                  ? 'Biblioteca de tecnologías'
                  : detail
                    ? selected.name + ' / Distrito de producto'
                    : 'Maqueta de proyectos'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setDetail(false);
                  setViewRevision((value) => value + 1);
                  setSection('projects');
                  onSectionChange?.('projects');
                }}
              >
                Vista general
              </button>
            </div>
            <p className={styles.cityHint}>Arrastra para girar · Selecciona una pieza</p>
          </div>
          <div className={styles.sceneTabs} aria-label="Vistas del taller">
            <button
              type="button"
              aria-pressed={!detail && !techMode}
              onClick={() => {
                setDetail(false);
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
      </section>
      <section
        id={techMode ? 'tecnologias' : 'proyectos'}
        className={styles.contentSection}
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
                  onClick={() => onEnter('projects', selected.id)}
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
      <section id="trayectoria" className={styles.journey}>
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
      <section id="contacto" className={styles.contact}>
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
      <footer className={styles.footer}>
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
