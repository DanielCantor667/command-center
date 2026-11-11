'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { useContent } from '../../../../data/content/content';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import type { PortfolioCaseProps } from './component';
import { KliniuSequence } from './kliniu-sequence';
import styles from './kliniu-case.module.css';
import { LanguageSwitch } from '../../../../i18n/language-switch';
import { kliniuCopy } from './copy/kliniu';
import { useCaseCopy } from './copy/use-case-copy';

export function KliniuCase({ project, onSelect, onReturn, onNavigate, onTechnologySelect, returnLabel: returnLabelProp }: PortfolioCaseProps) {
  const c = useCaseCopy(kliniuCopy);
  const { technologies } = useContent();
  const returnLabel = returnLabelProp ?? c.backToCity;
  const heading = useRef<HTMLHeadingElement>(null);
  const nextProject = PROJECTS.find(item => item.public && item.links.live && item.id !== 'kliniu');
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);

  return <main className={styles.case} data-project="kliniu">
    <header className={styles.header}>
      <button className={styles.identity} onClick={onReturn} aria-label={c.danielCantorInicio}>dc.</button>
      <button onClick={onReturn}><ArrowLeft size={16} aria-hidden />{returnLabel}</button>
      {onNavigate && <button className={styles.technologiesNav} onClick={() => onNavigate('technologies')}>{c.tecnologias}<ArrowUpRight size={16} aria-hidden /></button>}
      <LanguageSwitch />
    </header>
    <article>
      <section className={styles.opening} aria-labelledby="kliniu-title">
        <div className={styles.eyebrow}><span>{c.productoDigitalB2b}</span><span>{c.disenoDesarrollo}</span></div>
        <div className={styles.titleRow}>
          <h1 id="kliniu-title" ref={heading} tabIndex={-1}>Kliniu</h1>
          <a href={project.links.live} target="_blank" rel="noreferrer">{c.visitarSitio}<ArrowUpRight size={22} aria-hidden /></a>
        </div>
        <p className={styles.lead}>{c.higieneInstitucional}<br /><span>{c.unaExperienciaDeCompra}</span></p>
        <p data-case-context="kliniu" className={styles.context}>
          <span>{c.catalogoB2bYCotizaciones}</span>
          <strong>{project.role.title}</strong>
        </p>
        <figure className={styles.cover}>
          <a href="/projects/kliniu-desktop.png" target="_blank" rel="noreferrer" aria-label={c.ampliarCapturaDeKliniu}>
            <Image src="/projects/kliniu-desktop.png" alt={c.kliniuVistaDeEscritorio} width={1440} height={1000} sizes="(max-width: 760px) 100vw, 92vw" priority style={{ viewTransitionName: 'kliniu-surface' }} />
          </a>
          <figcaption><span>{c.elSitioEnProduccion}</span><span>{c.capturaPublica10Septiembre}</span></figcaption>
        </figure>
      </section>

      <section className={styles.brief} aria-labelledby="kliniu-brief">
        <p className={styles.label}>{c.n01ElContexto}</p>
        <div><h2 id="kliniu-brief">{c.noEsSoloElegir}<br />{c.unDispensador}</h2>
          <p>{c.unaCompraInstitucionalNecesita}</p>
        </div>
        <dl><div><dt>{c.participacion}</dt><dd>{c.desarrolloFullStack}</dd></div><div><dt>{c.producto}</dt><dd>{c.comercioElectronicoB2b}</dd></div><div><dt>{c.plataforma}</dt><dd>{c.webEscritorioYMovil}</dd></div></dl>
      </section>

      <KliniuSequence />

      <section className={styles.product} aria-labelledby="kliniu-catalogue">
        <div className={styles.productIntro}><p className={styles.label}>{c.n03LaExperienciaReal}</p><h2 id="kliniu-catalogue">{c.elProducto}<br />{c.sinRuido}</h2><p>{c.categoriasParaExplorarFichas}</p></div>
        <figure className={styles.catalogue}><Image src="/projects/kliniu-tour-catalog.jpg" alt={c.catalogoRealDeProductos} width={1440} height={1000} sizes="(max-width: 760px) 100vw, 68vw" /><figcaption>{c.catalogoPublicoDeKliniu}</figcaption></figure>
        <figure className={styles.mobile}><Image src="/projects/kliniu-mobile.png" alt={c.kliniuVistaDeMovil} width={390} height={844} sizes="(max-width: 760px) 70vw, 280px" /><figcaption>{c.laMismaMarcaA}</figcaption></figure>
      </section>

      <section className={styles.decisions} aria-labelledby="kliniu-decisions">
        <div><p className={styles.label}>{c.n04DetrasDeLa}</p><h2 id="kliniu-decisions">{c.loQueNoSe}<br />{c.tambienSeDisena}</h2></div>
        <div className={styles.decisionList}>
          <section><span>01</span><div><h3>{c.unCatalogoQueContempla}</h3><p>{c.elCalculoDelPrecio}</p><p className={styles.source}>{c.fuenteLibVolumeDiscounts}</p></div></section>
          <section><span>02</span><div><h3>{c.unaSolaLogicaPara}</h3><p>{c.subtotalRetencionesEIva}</p><p className={styles.source}>{c.fuenteLibQuotationCalculator}</p></div></section>
          <section><span>03</span><div><h3>{c.laFichaConectaCon}</h3><p>{c.laReferenciaLaCantidad}</p><p className={styles.source}>{c.fuenteFichaPublicaDe}</p></div></section>
        </div>
      </section>
      <section className={styles.stack} aria-label={c.tecnologiasDeKliniu}><p className={styles.label}>{c.construidoCon}</p><div>{technologies.filter(item => item.projectIds.includes('kliniu')).map(item => onTechnologySelect ? <button key={item.id} onClick={() => onTechnologySelect(item.id)}>{item.name}<ArrowUpRight size={14} aria-hidden /></button> : <span key={item.id}>{item.name}</span>)}</div></section>
    </article>
    <footer className={styles.footer}>
      <p>{c.deUnaIdeaA}</p>
      <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">{c.hablemos}<ArrowUpRight size={32} aria-hidden /></a>
      {nextProject && <button onClick={() => onSelect(nextProject.id)}><span>{c.siguienteProyecto}</span>{nextProject.name}<ArrowRight size={24} aria-hidden /></button>}
    </footer>
  </main>;
}
