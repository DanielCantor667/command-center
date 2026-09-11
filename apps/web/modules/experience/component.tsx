'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import type { WorkspaceModule } from '../../shell/workspace-store';
import { CityNavigatorLoader } from './components/city-navigator-loader';
import styles from './experience.module.css';

interface ExperienceModuleProps {
  onEnter: (module?: WorkspaceModule, projectId?: string) => void;
  initialProjectId?: string;
  onSelectionChange?: (projectId: string) => void;
}

const detailedProjects = ['kliniu', '4ustudio-academy', 'lorigine', 'drokex'];

const publishedProjects = PROJECTS.filter((project) => project.public && project.links.live);

export function ExperienceModule({ onEnter, initialProjectId = 'kliniu', onSelectionChange }: ExperienceModuleProps) {
  const [selectedId, setSelectedId] = useState(initialProjectId);
  const cityRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState(false);
  const [viewRevision, setViewRevision] = useState(0);
  const selected = PROJECTS.find((project) => project.id === selectedId) ?? publishedProjects[0]!;
  const capture = selected.media.find((media) => media.featured && media.type === 'image');

  const selectProject = (id: string) => {
    if (!PROJECTS.some((project) => project.id === id && project.public)) return;
    setSelectedId(id);
    setDetail(current => current && detailedProjects.includes(id));
    onSelectionChange?.(id);
  };

  return (
    <main className={styles.experience} data-project={selected.id}>
      <a className={styles.skipLink} href="#proyectos">Ir a los proyectos</a>
      <header className={styles.header}>
        <a className={styles.identity} href="#inicio">{PUBLIC_PROFILE.name}<span>Command Center / Taller digital</span></a>
        <nav className={styles.navigation} aria-label="Navegación principal">
          <a href="#proyectos">Proyectos</a>
          <a href="#sobre-mi">Sobre mí</a>
          <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">Hablemos</a>
        </nav>
      </header>

      <section id="inicio" className={styles.workbench} aria-label="Portafolio de proyectos">
        <aside className={styles.index}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Taller digital / Selección de proyectos</p>
            <h1>Diseño y desarrollo de productos web.</h1>
            <p>Tiendas, plataformas y herramientas que puedes visitar. Explora cómo están hechos.</p>
          </div>
          <div id="proyectos" className={styles.projectIndex}>
            <h2>Proyectos publicados</h2>
            <div className={styles.projectList} role="group" aria-label="Seleccionar proyecto">
              {publishedProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={styles.projectChoice}
                  aria-label={`Seleccionar ${project.name}`}
                  aria-pressed={selected.id === project.id}
                  aria-controls="project-preview"
                  onClick={() => selectProject(project.id)}
                >
                  <span>{project.name}</span>
                  <span className={styles.selectionMark} aria-hidden="true" />
                </button>
              ))}
            </div>
            <button className={styles.otherProjects} type="button" onClick={() => onEnter('projects')}>Ver todos los proyectos</button>
          </div>
          <p className={styles.location}>{PUBLIC_PROFILE.location}</p>
        </aside>

        <div ref={cityRef} data-detail={detail} className={styles.cityStage}>
          <div className={styles.cityToolbar}>
            <span>{detail ? selected.name + ' / Distrito de producto' : 'Taller digital'}</span>
            <button type="button" onClick={() => { setDetail(false); setViewRevision((value) => value + 1); }}>Vista general</button>
          </div>
          <CityNavigatorLoader detail={detail} selectedProjectId={selected.id} onProjectSelect={selectProject} viewRevision={viewRevision} />
          <p className={styles.cityHint}>Arrastra para girar. Selecciona un edificio para conocer su proyecto.</p>
        </div>

        <article id="project-preview" className={styles.preview} aria-label={`Vista previa de ${selected.name}`}>
          <div key={selected.id} className={styles.previewImage}>
            {capture ? (
              <Image key={capture.url} src={capture.url} alt={`Vista real de ${selected.name}`} width={1440} height={1000} sizes="(max-width: 800px) 100vw, 36vw" priority />
            ) : (
              <div className={styles.noCapture}><span>{selected.name}</span><p>Explora la documentación de este proyecto.</p></div>
            )}
          </div>
          <div className={styles.previewContent}>
            <p className={styles.projectType}>{selected.links.live ? 'Sitio publicado' : 'Proyecto documentado'}</p>
            <h2 aria-live="polite" aria-atomic="true">{selected.name}</h2>
            <p>{selected.summary}</p>
            {detailedProjects.includes(selected.id) && <button className={styles.detailButton} type="button" aria-pressed={detail} onClick={() => { setDetail(value => !value); cityRef.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>{detail ? 'Alejar distrito' : 'Acercar distrito ' + selected.name}</button>}
            <div className={styles.previewActions}>
              <button type="button" onClick={() => onEnter('projects', selected.id)} aria-label={`Ver caso de ${selected.name}`}>Ver el proyecto</button>
              {selected.links.live && <a href={selected.links.live} target="_blank" rel="noreferrer">Visitar sitio</a>}
            </div>
          </div>
        </article>
      </section>

      <section id="sobre-mi" className={styles.about}>
        <h2>Detrás de los proyectos.</h2>
        <div>
          <p>Soy Daniel Cantor, ingeniero de software en Bogotá. Trabajo en la experiencia del producto y en los sistemas que la hacen posible.</p>
          <p>En cada caso puedes revisar el producto, las tecnologías y las decisiones documentadas durante su desarrollo.</p>
          <div className={styles.aboutLinks}>
            <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">Conversar por LinkedIn</a>
            <a href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
            <button type="button" onClick={() => onEnter('dashboard')}>Explorar el laboratorio</button>
          </div>
        </div>
      </section>
      <footer className={styles.footer}><span>Daniel Cantor</span><span>Command Center</span></footer>
    </main>
  );
}
