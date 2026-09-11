'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { PROJECTS, type Project } from '../../../../data/projects';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import styles from './portfolio-case.module.css';

interface PortfolioCaseProps {
  project: Project;
  onSelect: (id: string) => void;
  onReturn: () => void;
}

export function PortfolioCase({ project, onSelect, onReturn }: PortfolioCaseProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const cases = PROJECTS.filter(item => item.public && item.links.live);
  const index = cases.findIndex(item => item.id === project.id);
  const images = project.media.filter(item => item.type === 'image');
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [project.id]);

  return <main className={styles.case} data-project={project.id}>
    <header className={styles.navigation}>
      <button type="button" onClick={onReturn}>Volver a la ciudad</button>
      <span>Daniel Cantor / Taller digital</span>
      <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">Hablemos</a>
    </header>
    <article key={project.id} className={styles.article}>
      <div className={styles.intro}>
        <div><p className={styles.tagline}>{project.tagline}</p><h1 ref={heading} tabIndex={-1}>{project.name}</h1></div>
        <div className={styles.summary}><p>{project.summary}</p>
          {project.links.live && <a className={styles.visit} href={project.links.live} target="_blank" rel="noreferrer">Visitar sitio</a>}
        </div>
      </div>
      {images.length > 0 ? <section className={styles.gallery} aria-label={'Capturas de ' + project.name}>
        {images.map(media => <figure key={media.url} className={media.featured ? styles.desktop : styles.mobile}>
          <a href={media.url} target="_blank" rel="noreferrer" aria-label={'Ampliar ' + media.alt}>
            <Image src={media.url} alt={media.alt} width={media.featured ? 1440 : 390} height={media.featured ? 1000 : 844} sizes={media.featured ? '(max-width: 760px) 100vw, 70vw' : '(max-width: 760px) 65vw, 20vw'} priority={media.featured} />
          </a>
          <figcaption>{media.caption}</figcaption>
        </figure>)}
      </section> : <p className={styles.noMedia}>Sin capturas publicadas para este proyecto.</p>}
      <section className={styles.story} aria-label="Alcance del proyecto">
        <aside>
          <h2>Participación</h2>
          <p>{project.role.title}</p>
          {project.ownership.type === 'unconfirmed' && <p>Autoría y alcance por confirmar.</p>}
          {project.role.responsibilities.length > 0 && <details className={styles.responsibilities}><summary>Responsabilidades documentadas</summary><ul>{project.role.responsibilities.map(item => <li key={item}>{item}</li>)}</ul></details>}
          <h2>Tecnologías</h2>
          <p>{project.technologies.map(item => item.name).join(', ') || 'Sin tecnologías documentadas.'}</p>
          {(project.links.repository || project.links.documentation) && <div className={styles.sources}>
            {project.links.repository && <a href={project.links.repository} target="_blank" rel="noreferrer">Repositorio</a>}
            {project.links.documentation && <a href={project.links.documentation} target="_blank" rel="noreferrer">Documentación</a>}
          </div>}
        </aside>
        <div>
          <h2>El proyecto</h2>
          <p>{project.description}</p>
          {project.features.length > 0 && <details className={styles.featureDetails}><summary>Explorar las funciones documentadas</summary><div className={styles.features}>{project.features.map(feature => <section key={feature.title}>
            <h3>{feature.title}</h3><p>{feature.description}</p>
          </section>)}</div></details>}
          <div className={styles.notes}>
            <h2>Decisiones y aprendizajes</h2>
            {!project.engineeringDecisions.length && !project.lessonsLearned.length && <p>Sin evidencia documentada por ahora.</p>}
            {project.engineeringDecisions.map(item => <details key={item.title}>
              <summary>{item.title}</summary>
              <div><h3>Contexto</h3><p>{item.context}</p><h3>Decisión</h3><p>{item.decision}</p><h3>Por qué</h3><p>{item.reasoning}</p></div>
            </details>)}
            {project.lessonsLearned.map(item => <details key={item.title}><summary>{item.title}</summary><div><p>{item.description}</p></div></details>)}
          </div>
        </div>
      </section>
    </article>
    <nav className={styles.next} aria-label="Recorrido de proyectos">
      {index > 0 ? <button type="button" onClick={() => onSelect(cases[index - 1]!.id)}><span>Anterior</span>{cases[index - 1]!.name}</button> : <button type="button" onClick={onReturn}><span>Explorar</span>La ciudad</button>}
      {index >= 0 && index < cases.length - 1 ? <button type="button" onClick={() => onSelect(cases[index + 1]!.id)}><span>Siguiente</span>{cases[index + 1]!.name}</button> : <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer"><span>¿Tienes un proyecto?</span>Hablemos</a>}
    </nav>
  </main>;
}
