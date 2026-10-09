'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { PORTFOLIO_TECHNOLOGIES } from '../../../../data/portfolio-technologies';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import type { PortfolioCaseProps } from './component';
import { KliniuSequence } from './kliniu-sequence';
import styles from './kliniu-case.module.css';

export function KliniuCase({ project, onSelect, onReturn, onNavigate, onTechnologySelect, returnLabel = 'Volver a la ciudad' }: PortfolioCaseProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const nextProject = PROJECTS.find(item => item.public && item.links.live && item.id !== 'kliniu');
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);

  return <main className={styles.case} data-project="kliniu">
    <header className={styles.header}>
      <button className={styles.identity} onClick={onReturn} aria-label="Daniel Cantor, inicio">dc.</button>
      <button onClick={onReturn}><ArrowLeft size={16} aria-hidden />{returnLabel}</button>
      {onNavigate && <button className={styles.technologiesNav} onClick={() => onNavigate('technologies')}>Tecnologías<ArrowUpRight size={16} aria-hidden /></button>}
    </header>
    <article>
      <section className={styles.opening} aria-labelledby="kliniu-title">
        <div className={styles.eyebrow}><span>Producto digital / B2B</span><span>Diseño + desarrollo</span></div>
        <div className={styles.titleRow}>
          <h1 id="kliniu-title" ref={heading} tabIndex={-1}>Kliniu</h1>
          <a href={project.links.live} target="_blank" rel="noreferrer">Visitar sitio<ArrowUpRight size={22} aria-hidden /></a>
        </div>
        <p className={styles.lead}>Higiene institucional.<br /><span>Una experiencia de compra clara.</span></p>
        <p data-case-context="kliniu" className={styles.context}>
          <span>Catálogo B2B y cotizaciones.</span>
          <strong>{project.role.title}</strong>
        </p>
        <figure className={styles.cover}>
          <a href="/projects/kliniu-desktop.png" target="_blank" rel="noreferrer" aria-label="Ampliar captura de Kliniu">
            <Image src="/projects/kliniu-desktop.png" alt="Kliniu · vista de escritorio" width={1440} height={1000} sizes="(max-width: 760px) 100vw, 92vw" priority style={{ viewTransitionName: 'kliniu-surface' }} />
          </a>
          <figcaption><span>El sitio, en producción.</span><span>Captura pública / 10 septiembre 2026</span></figcaption>
        </figure>
      </section>

      <section className={styles.brief} aria-labelledby="kliniu-brief">
        <p className={styles.label}>01 / El contexto</p>
        <div><h2 id="kliniu-brief">No es solo elegir<br />un dispensador.</h2>
          <p>Una compra institucional necesita referencias claras, cantidades y una cotización. Kliniu reúne el catálogo de higiene y las herramientas comerciales que acompañan esa decisión.</p>
        </div>
        <dl><div><dt>Participación</dt><dd>Desarrollo full-stack</dd></div><div><dt>Producto</dt><dd>Comercio electrónico B2B</dd></div><div><dt>Plataforma</dt><dd>Web / escritorio y móvil</dd></div></dl>
      </section>

      <KliniuSequence />

      <section className={styles.product} aria-labelledby="kliniu-catalogue">
        <div className={styles.productIntro}><p className={styles.label}>03 / La experiencia real</p><h2 id="kliniu-catalogue">El producto,<br />sin ruido.</h2><p>Categorías para explorar. Fichas para comparar. Cantidades y contacto comercial para dar el siguiente paso.</p></div>
        <figure className={styles.catalogue}><Image src="/projects/kliniu-tour-catalog.jpg" alt="Catálogo real de productos Kliniu" width={1440} height={1000} sizes="(max-width: 760px) 100vw, 68vw" /><figcaption>Catálogo público de Kliniu.</figcaption></figure>
        <figure className={styles.mobile}><Image src="/projects/kliniu-mobile.png" alt="Kliniu · vista de móvil" width={390} height={844} sizes="(max-width: 760px) 70vw, 280px" /><figcaption>La misma marca, a otra escala.</figcaption></figure>
      </section>

      <section className={styles.decisions} aria-labelledby="kliniu-decisions">
        <div><p className={styles.label}>04 / Detrás de la interfaz</p><h2 id="kliniu-decisions">Lo que no se ve<br />también se diseña.</h2></div>
        <div className={styles.decisionList}>
          <section><span>01</span><div><h3>Un catálogo que contempla el volumen.</h3><p>El cálculo del precio tiene en cuenta la cantidad y los tramos definidos por producto. Esa lógica vive fuera de la interfaz, en un módulo dedicado.</p><p className={styles.source}>Fuente: lib/volume-discounts.ts</p></div></section>
          <section><span>02</span><div><h3>Una sola lógica para los totales.</h3><p>Subtotal, retenciones e IVA se calculan con funciones puras a partir de los ítems y su configuración. La vista y el servidor pueden compartir las mismas reglas.</p><p className={styles.source}>Fuente: lib/quotation-calculator.ts</p></div></section>
          <section><span>03</span><div><h3>La ficha conecta con la conversación.</h3><p>La referencia, la cantidad y la solicitud de cotización acompañan al producto. El contacto comercial forma parte del recorrido público.</p><p className={styles.source}>Fuente: ficha pública de producto.</p></div></section>
        </div>
      </section>
      <section className={styles.stack} aria-label="Tecnologías de Kliniu"><p className={styles.label}>Construido con</p><div>{PORTFOLIO_TECHNOLOGIES.filter(item => item.projectIds.includes('kliniu')).map(item => onTechnologySelect ? <button key={item.id} onClick={() => onTechnologySelect(item.id)}>{item.name}<ArrowUpRight size={14} aria-hidden /></button> : <span key={item.id}>{item.name}</span>)}</div></section>
    </article>
    <footer className={styles.footer}>
      <p>De una idea a un producto que se puede usar.</p>
      <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">Hablemos<ArrowUpRight size={32} aria-hidden /></a>
      {nextProject && <button onClick={() => onSelect(nextProject.id)}><span>Siguiente proyecto</span>{nextProject.name}<ArrowRight size={24} aria-hidden /></button>}
    </footer>
  </main>;
}
