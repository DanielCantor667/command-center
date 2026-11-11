'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import { useContent } from '../../../../data/content/content';
import type { PortfolioCaseProps } from './component';
import { LorigineGallery } from './lorigine-gallery';
import styles from './lorigine-case.module.css';
import { LanguageSwitch } from '../../../../i18n/language-switch';
import { lorigineCopy } from './copy/lorigine';
import { useCaseCopy } from './copy/use-case-copy';

export function LorigineCase({
  project,
  onSelect,
  onReturn,
  onNavigate,
  onTechnologySelect,
  returnLabel: returnLabelProp,
}: PortfolioCaseProps) {
  const c = useCaseCopy(lorigineCopy);
  const { technologies } = useContent();
  const returnLabel = returnLabelProp ?? c.backToCity;
  const heading = useRef<HTMLHeadingElement>(null);
  const cases = PROJECTS.filter((item) => item.public && item.links.live);
  const index = cases.findIndex((item) => item.id === project.id);
  const previous = cases[index - 1];
  const next = cases[index + 1];
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className={styles.case} data-project="lorigine">
      <header className={styles.header}>
        <button
          className={styles.identity}
          type="button"
          onClick={onReturn}
          aria-label={c.danielCantorInicio}
        >
          dc.
        </button>
        <button type="button" onClick={onReturn}>
          <ArrowLeft size={16} aria-hidden />
          {returnLabel}
        </button>
        {onNavigate && (
          <button
            className={styles.techNav}
            type="button"
            onClick={() => onNavigate('technologies')}
          >{c.tecnologias}<ArrowUpRight size={16} aria-hidden />
          </button>
        )}
        <LanguageSwitch />
      </header>
      <article>
        <section className={styles.hero} aria-labelledby="lorigine-title">
          <picture>
            <source media="(max-width:760px)" srcSet="/experience/lorigine-hero-mobile-v4.webp" />
            <Image
              className={styles.heroImage}
            src="/experience/lorigine-hero-wide-v4.webp"
              alt={c.galeriaConceptualLorigineCreada}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
            />
          </picture>
          <div className={styles.heroTitle}>
            <p>{c.marcaYComercioDigital}</p>
            <h1 ref={heading} tabIndex={-1} id="lorigine-title">
              L&apos;ORIGINE
            </h1>
          </div>
          <div className={styles.heroFoot}>
            <p data-case-context="lorigine" className={styles.context}>
              <span>{c.tiendaDeCuidadoCapilar}</span>
              <strong>{project.role.title}</strong>
            </p>
            <a href="#lorigine-gallery">{c.recorrerLaGaleria}<ArrowDown size={20} aria-hidden />
            </a>
            <a href={project.links.live} target="_blank" rel="noreferrer">{c.visitarSitio}<ArrowUpRight size={20} aria-hidden />
            </a>
          </div>
        </section>

        <section className={styles.intro} aria-labelledby="lorigine-intro">
          <p className={styles.kicker}>{c.elProyecto}</p>
          <h2 id="lorigine-intro">{c.laMarcaSeReconoce}<br />{c.elProductoSeEntiende}</h2>
          <div>
            <p>{c.unaTiendaDeCuidado}</p>
            <dl>
              <div>
                <dt>{c.participacion}</dt>
                <dd>{c.desarrolloFullStackY}</dd>
              </div>
              <div>
                <dt>{c.entorno}</dt>
                <dd>{c.webEscritorioYMovil}</dd>
              </div>
            </dl>
          </div>
        </section>

        <LorigineGallery />

        <section className={styles.evidence} aria-labelledby="lorigine-evidence">
          <div className={styles.evidenceTitle}>
            <p className={styles.kicker}>{c.laExperienciaPublicada}</p>
            <h2 id="lorigine-evidence">{c.delObjeto}<br />{c.aLaEleccion}</h2>
            <p>{c.elCatalogoPermiteExplorar}</p>
            <a href="https://www.lorigine.com.co/productos" target="_blank" rel="noreferrer">{c.verCatalogoReal}<ArrowUpRight size={17} aria-hidden />
            </a>
          </div>
          <figure className={styles.catalog}>
            <a
              href="/projects/lorigine-catalog-v4.webp"
              target="_blank"
              rel="noreferrer"
              aria-label={c.ampliarCatalogoDeLorigine}
            >
              <Image
                src="/projects/lorigine-catalog-v4.webp"
                alt={c.catalogoPublicoDeLorigine}
                width={1440}
                height={1000}
                sizes="(max-width:760px) 92vw, 65vw"
              />
            </a>
            <figcaption>{c.catalogoPublicoCapturaDel}</figcaption>
          </figure>
          <figure className={styles.mobile}>
            <a
              href="/projects/lorigine-product-mobile-v4.webp"
              target="_blank"
              rel="noreferrer"
              aria-label={c.ampliarFichaMovilDe}
            >
              <Image
                src="/projects/lorigine-product-mobile-v4.webp"
                alt={c.fichaPublicaDeLorigine}
                width={390}
                height={844}
                sizes="(max-width:760px) 70vw, 280px"
              />
            </a>
            <figcaption>{c.laFichaEnMovil}</figcaption>
          </figure>
          <div className={styles.observation}>
            <span>{c.continuidadDeMarca}</span>
            <p>{c.losTonosMineralesEl}</p>
          </div>
        </section>

        <section className={styles.craft} aria-labelledby="lorigine-craft">
          <div>
            <p className={styles.kicker}>{c.decisionesDeImplementacion}</p>
            <h2 id="lorigine-craft">{c.elRitmoTambien}<br />{c.esParteDelProducto}</h2>
            <p className={styles.craftNote}>{c.decisionesContrastadasConEl}</p>
          </div>
          <div className={styles.decisions}>
            <section>
              <h3>{c.unaSeleccionQueVive}</h3>
              <p>{c.categoriaYOrdenSe}</p>
              <span>{c.fuenteProductosPageTsx}</span>
            </section>
            <section>
              <h3>{c.unVocabularioCompartidoDe}</h3>
              <p>{c.duracionesCurvasYDistancias}</p>
              <span>{c.fuenteLibMotionTs}</span>
            </section>
            <section>
              <h3>{c.elContenidoNoDepende}</h3>
              <p>{c.elComponenteRevealDevuelve}</p>
              <span>{c.fuenteMotionRevealTsx}</span>
            </section>
          </div>
        </section>
        <section className={styles.stack} aria-label={c.tecnologiasDeLorigine}>
          <p className={styles.kicker}>{c.tecnologias}</p>
          <div>
            {technologies.filter((item) => item.projectIds.includes('lorigine')).map(
              (item) =>
                onTechnologySelect ? (
                  <button key={item.id} type="button" onClick={() => onTechnologySelect(item.id)}>
                    {item.name}
                    <ArrowUpRight size={15} aria-hidden />
                  </button>
                ) : (
                  <span key={item.id}>{item.name}</span>
                ),
            )}
          </div>
        </section>
      </article>
      <footer className={styles.footer}>
        <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">{c.hablemosDeTuProyecto}<ArrowUpRight size={22} aria-hidden />
        </a>
        <nav aria-label={c.recorridoDeProyectos}>
          {previous && (
            <button type="button" onClick={() => onSelect(previous.id)}>
              <span>{c.proyectoAnterior}</span>
              <ArrowLeft size={22} aria-hidden />
              {previous.name}
            </button>
          )}
          {next && (
            <button type="button" onClick={() => onSelect(next.id)}>
              <span>{c.siguienteProyecto}</span>
              {next.name}
              <ArrowRight size={22} aria-hidden />
            </button>
          )}
        </nav>
      </footer>
    </main>
  );
}
