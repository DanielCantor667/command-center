'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import { useContent } from '../../../../data/content/content';
import type { PortfolioCaseProps } from './component';
import { DrokexNetwork } from './drokex-network';
import styles from './drokex-case.module.css';
import { LanguageSwitch } from '../../../../i18n/language-switch';
import { drokexCopy } from './copy/drokex';
import { useCaseCopy } from './copy/use-case-copy';

export function DrokexCase({ project, onSelect, onReturn, onNavigate, onTechnologySelect, returnLabel: returnLabelProp }: PortfolioCaseProps) {
  const c = useCaseCopy(drokexCopy);
  const { technologies } = useContent();
  const returnLabel = returnLabelProp ?? c.backToCity;
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
        <button type="button" className={styles.identity} aria-label={c.danielCantorInicio} onClick={onReturn}>dc.</button>
        <button type="button" onClick={onReturn}><ArrowLeft size={16} aria-hidden />{returnLabel}</button>
        {onNavigate && <button type="button" className={styles.techNav} onClick={() => onNavigate('technologies')}>{c.tecnologias}<ArrowUpRight size={16} aria-hidden /></button>}
        <LanguageSwitch />
      </header>
      <article>
        <section className={styles.hero} aria-labelledby="drokex-title">
          <picture>
            <source media="(max-width:760px)" srcSet="/experience/drokex-hero-mobile-v4.webp" />
            <Image src="/experience/drokex-hero-wide-v4.webp" alt={c.pabellonConceptualDrokexRender} fill loading="eager" fetchPriority="high" sizes="100vw" className={styles.heroImage} />
          </picture>
          <div className={styles.heroTitle}><p>{c.catalogoInternacionalDirectorioDe}</p><h1 id="drokex-title" ref={heading} tabIndex={-1}>Drokex</h1></div>
          <div className={styles.heroFoot}>
            <p data-case-context="drokex" className={styles.context}>
              <span>{c.directorioDeEmpresasY}</span>
              <strong>{project.role.title}</strong>
              <span>{c.participacionDescritaEnEl}{project.ownership.type === 'unconfirmed' ? ` ${c.propiedadNoConfirmada}` : ''}</span>
            </p>
            <a href="#drokex-network">{c.explorarElCaso}<ArrowDown size={20} aria-hidden /></a>
            <a href={project.links.live} target="_blank" rel="noreferrer">{c.visitarSitio}<ArrowUpRight size={20} aria-hidden /></a>
          </div>
        </section>
        <section className={styles.intro} aria-labelledby="drokex-context">
          <div><p className={styles.kicker}>{c.elProyecto}</p><h2 id="drokex-context">{c.darVisibilidad}<br />{c.encontrarProveedores}</h2></div>
          <div className={styles.copy}>
            <p>{project.summary}</p>
            <h3>{c.participacion}</h3><p>{project.role.title}</p>
            <p>{c.participacionDescritaEnEl}</p>
            <p className={styles.note}>{c.propiedadNoConfirmadaNo}</p>
            <details><summary>{c.responsabilidadesDocumentadas}</summary><ul>{project.role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></details>
          </div>
        </section>
        <DrokexNetwork />
        <section className={styles.platform} aria-labelledby="drokex-platform">
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>{c.laPlataformaPublica}</p><h2 id="drokex-platform">{c.delProducto}<br />{c.aLaEmpresa}</h2></div><a href="https://drokex.com/productos" target="_blank" rel="noreferrer">{c.verProductos}<ArrowUpRight size={18} aria-hidden /></a></div>
          <figure className={styles.desktop}>
            <a href="/projects/drokex-products-v4.webp" target="_blank" rel="noreferrer" aria-label={c.ampliarCatalogoDeDrokex}><Image src="/projects/drokex-products-v4.webp" width={1440} height={1000} alt={c.catalogoPublicoDeDrokex} sizes="90vw" /></a>
            <figcaption>{c.productosWebPublica22}</figcaption>
          </figure>
          <div className={styles.directory}>
            <div><p className={styles.kicker}>{c.directorio}</p><h3>{c.lasEmpresas}<br />{c.enPrimerPlano}</h3><p>{c.unRecorridoPublicoPara}</p><a href="https://drokex.com/directorio" target="_blank" rel="noreferrer">{c.verDirectorio}<ArrowUpRight size={18} aria-hidden /></a>
              <figure className={styles.directoryDesktop}><a href="/projects/drokex-directory-v4.webp" target="_blank" rel="noreferrer" aria-label={c.ampliarDirectorioDeDrokex}><Image src="/projects/drokex-directory-v4.webp" width={1440} height={1000} alt={c.directorioPublicoDeDrokex} sizes="(max-width:760px) 90vw, 55vw" /></a><figcaption>{c.directorioWebPublica}</figcaption></figure>
            </div>
            <figure className={styles.mobile}><a href="/projects/drokex-directory-mobile-v4.webp" target="_blank" rel="noreferrer" aria-label={c.ampliarDirectorioEnMovil}><Image src="/projects/drokex-directory-mobile-v4.webp" width={390} height={844} alt={c.directorioDeDrokexEn} sizes="(max-width:760px) 75vw, 320px" /></a><figcaption>{c.directorioMovil}</figcaption></figure>
          </div>
        </section>
        <section className={styles.decisions} aria-labelledby="drokex-decisions"><h2 id="drokex-decisions">{c.decisionesYAprendizajes}</h2><div>
          {!project.engineeringDecisions.length && !project.lessonsLearned.length && <p>{c.sinEvidenciaDocumentadaPor}</p>}
          {project.engineeringDecisions.map((item) => <details key={item.title}><summary>{item.title}</summary><p>{item.context}</p><p>{item.decision}</p><p>{item.reasoning}</p></details>)}
          {project.lessonsLearned.map((item) => <details key={item.title}><summary>{item.title}</summary><p>{item.description}</p></details>)}
          <p className={styles.note}>{c.elPabellonEsUna}</p>
        </div></section>
        <section className={styles.stack} aria-label={c.tecnologiasDeDrokex}><p className={styles.kicker}>{c.tecnologias}</p><div>{onTechnologySelect ? technologies.filter((item) => item.projectIds.includes(project.id)).map((item) => <button key={item.id} type="button" onClick={() => onTechnologySelect(item.id)}>{item.name}<ArrowUpRight size={15} aria-hidden /></button>) : project.technologies.map((item) => <span key={item.name}>{item.name}</span>)}</div></section>
      </article>
      <footer className={styles.footer}><a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">{c.hablemosDeTuProyecto}<ArrowUpRight size={24} aria-hidden /></a><nav aria-label={c.recorridoDeProyectos}>{previous && <button type="button" onClick={() => onSelect(previous.id)}><span>{c.proyectoAnterior}</span><ArrowLeft size={22} aria-hidden />{previous.name}</button>}</nav></footer>
    </main>
  );
}
