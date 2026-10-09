'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import { PORTFOLIO_TECHNOLOGIES } from '../../../../data/portfolio-technologies';
import type { PortfolioCaseProps } from './component';
import { DrokexNetwork } from './drokex-network';
import styles from './drokex-case.module.css';

export function DrokexCase({ project, onSelect, onReturn, onNavigate, onTechnologySelect, returnLabel = 'Volver a la ciudad' }: PortfolioCaseProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const cases = PROJECTS.filter((item) => item.public && item.links.live);
  const previous = cases[cases.findIndex((item) => item.id === project.id) - 1];
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className={styles.case} data-project="drokex">
      <header className={styles.header}>
        <button type="button" className={styles.identity} aria-label="Daniel Cantor, inicio" onClick={onReturn}>dc.</button>
        <button type="button" onClick={onReturn}><ArrowLeft size={16} aria-hidden />{returnLabel}</button>
        {onNavigate && <button type="button" className={styles.techNav} onClick={() => onNavigate('technologies')}>Tecnologías<ArrowUpRight size={16} aria-hidden /></button>}
      </header>
      <article>
        <section className={styles.hero} aria-labelledby="drokex-title">
          <picture>
            <source media="(max-width:760px)" srcSet="/experience/drokex-hero-mobile-v4.webp" />
            <Image src="/experience/drokex-hero-wide-v4.webp" alt="Pabellón conceptual Drokex, render de Blender" fill loading="eager" fetchPriority="high" sizes="100vw" className={styles.heroImage} />
          </picture>
          <div className={styles.heroTitle}><p>Catálogo internacional / Directorio de proveedores</p><h1 id="drokex-title" ref={heading} tabIndex={-1}>Drokex</h1></div>
          <div className={styles.heroFoot}>
            <p data-case-context="drokex" className={styles.context}>
              <span>Directorio de empresas y productos.</span>
              <strong>{project.role.title}</strong>
              <span>Participación descrita en el CV de Daniel.{project.ownership.type === 'unconfirmed' ? ' Propiedad no confirmada.' : ''}</span>
            </p>
            <a href="#drokex-network">Explorar el caso<ArrowDown size={20} aria-hidden /></a>
            <a href={project.links.live} target="_blank" rel="noreferrer">Visitar sitio<ArrowUpRight size={20} aria-hidden /></a>
          </div>
        </section>
        <section className={styles.intro} aria-labelledby="drokex-context">
          <div><p className={styles.kicker}>El proyecto</p><h2 id="drokex-context">Dar visibilidad.<br />Encontrar proveedores.</h2></div>
          <div className={styles.copy}>
            <p>{project.summary}</p>
            <h3>Participación</h3><p>{project.role.title}</p>
            <p>Participación descrita en el CV de Daniel.</p>
            <p className={styles.note}>Propiedad no confirmada. No se atribuye autoría exclusiva ni resultados comerciales.</p>
            <details><summary>Responsabilidades documentadas</summary><ul>{project.role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></details>
          </div>
        </section>
        <DrokexNetwork />
        <section className={styles.platform} aria-labelledby="drokex-platform">
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>La plataforma pública</p><h2 id="drokex-platform">Del producto<br />a la empresa.</h2></div><a href="https://drokex.com/productos" target="_blank" rel="noreferrer">Ver productos<ArrowUpRight size={18} aria-hidden /></a></div>
          <figure className={styles.desktop}>
            <a href="/projects/drokex-products-v4.webp" target="_blank" rel="noreferrer" aria-label="Ampliar catálogo de Drokex"><Image src="/projects/drokex-products-v4.webp" width={1440} height={1000} alt="Catálogo público de Drokex" sizes="90vw" /></a>
            <figcaption>Productos / Web pública / 22 de septiembre de 2026</figcaption>
          </figure>
          <div className={styles.directory}>
            <div><p className={styles.kicker}>Directorio</p><h3>Las empresas,<br />en primer plano.</h3><p>Un recorrido público para descubrir proveedores. El catálogo presenta productos; el directorio reúne empresas.</p><a href="https://drokex.com/directorio" target="_blank" rel="noreferrer">Ver directorio<ArrowUpRight size={18} aria-hidden /></a>
              <figure className={styles.directoryDesktop}><a href="/projects/drokex-directory-v4.webp" target="_blank" rel="noreferrer" aria-label="Ampliar directorio de Drokex"><Image src="/projects/drokex-directory-v4.webp" width={1440} height={1000} alt="Directorio público de Drokex" sizes="(max-width:760px) 90vw, 55vw" /></a><figcaption>Directorio / Web pública</figcaption></figure>
            </div>
            <figure className={styles.mobile}><a href="/projects/drokex-directory-mobile-v4.webp" target="_blank" rel="noreferrer" aria-label="Ampliar directorio en móvil"><Image src="/projects/drokex-directory-mobile-v4.webp" width={390} height={844} alt="Directorio de Drokex en móvil" sizes="(max-width:760px) 75vw, 320px" /></a><figcaption>Directorio / Móvil</figcaption></figure>
          </div>
        </section>
        <section className={styles.decisions} aria-labelledby="drokex-decisions"><h2 id="drokex-decisions">Decisiones y aprendizajes</h2><div>
          {!project.engineeringDecisions.length && !project.lessonsLearned.length && <p>Sin evidencia documentada por ahora.</p>}
          {project.engineeringDecisions.map((item) => <details key={item.title}><summary>{item.title}</summary><p>{item.context}</p><p>{item.decision}</p><p>{item.reasoning}</p></details>)}
          {project.lessonsLearned.map((item) => <details key={item.title}><summary>{item.title}</summary><p>{item.description}</p></details>)}
          <p className={styles.note}>El pabellón es una interpretación conceptual de la marca. No reproduce instalaciones ni rutas comerciales reales.</p>
        </div></section>
        <section className={styles.stack} aria-label="Tecnologías de Drokex"><p className={styles.kicker}>Tecnologías</p><div>{onTechnologySelect ? PORTFOLIO_TECHNOLOGIES.filter((item) => item.projectIds.includes(project.id)).map((item) => <button key={item.id} type="button" onClick={() => onTechnologySelect(item.id)}>{item.name}<ArrowUpRight size={15} aria-hidden /></button>) : project.technologies.map((item) => <span key={item.name}>{item.name}</span>)}</div></section>
      </article>
      <footer className={styles.footer}><a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">Hablemos de tu proyecto<ArrowUpRight size={24} aria-hidden /></a><nav aria-label="Recorrido de proyectos">{previous && <button type="button" onClick={() => onSelect(previous.id)}><span>Proyecto anterior</span><ArrowLeft size={22} aria-hidden />{previous.name}</button>}</nav></footer>
    </main>
  );
}
