'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import { useContent } from '../../../../data/content/content';
import type { PortfolioCaseProps } from './component';
import { AcademyStudio } from './academy-studio';
import styles from './academy-case.module.css';
import { LanguageSwitch } from '../../../../i18n/language-switch';
import { academyCopy } from './copy/academy';
import { useCaseCopy } from './copy/use-case-copy';

export function AcademyCase({
  project,
  onSelect,
  onReturn,
  onNavigate,
  onTechnologySelect,
  returnLabel: returnLabelProp,
}: PortfolioCaseProps) {
  const c = useCaseCopy(academyCopy);
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
    <main className={styles.case} data-project="4ustudio-academy">
      <header className={styles.header}>
        <button
          type="button"
          className={styles.identity}
          aria-label={c.danielCantorInicio}
          onClick={onReturn}
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
        <section className={styles.hero} aria-labelledby="academy-title">
          <picture>
            <source media="(max-width:760px)" srcSet="/experience/academy-hero-mobile-v4.webp" />
            <Image
              src="/experience/academy-hero-wide-v4.webp"
              alt={c.estudioMusicalConceptualDe}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className={styles.heroImage}
            />
          </picture>
          <div className={styles.heroTitle}>
            <p>{c.musicaYAprendizajeBogota}</p>
            <h1 id="academy-title" ref={heading} tabIndex={-1}>
              4U Studio <span>Academy</span>
            </h1>
          </div>
          <div className={styles.heroFoot}>
            <p data-case-context="4ustudio-academy" className={styles.context}>
              <span>{c.academiaDeMusicaY}</span>
              <strong>{project.role.title}</strong>
            </p>
            <a href="#academy-studio">{c.entrarAlEstudio}<ArrowDown size={20} aria-hidden />
            </a>
            <a href={project.links.live} target="_blank" rel="noreferrer">{c.visitarAcademia}<ArrowUpRight size={20} aria-hidden />
            </a>
          </div>
        </section>

        <section className={styles.intro} aria-labelledby="academy-intro">
          <p className={styles.kicker}>{c.elProyecto}</p>
          <h2 id="academy-intro">{c.cadaComienzo}<br />{c.tieneSuSonido}</h2>
          <div className={styles.introCopy}>
            <p>{c.unaPlataformaParaUna}</p>
            <dl>
              <div>
                <dt>{c.participacion}</dt>
                <dd>{c.desarrolloFullStackY}</dd>
              </div>
              <div>
                <dt>{c.experiencia}</dt>
                <dd>{c.ofertaMusicalYAgenda}</dd>
              </div>
            </dl>
          </div>
        </section>

        <AcademyStudio />

        <section className={styles.lessons} aria-labelledby="academy-lessons-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>{c.laAcademiaPublicada}</p>
              <h2 id="academy-lessons-title">{c.encontrarTuInstrumento}<br />{c.darElPrimerPaso}</h2>
            </div>
            <a href="https://4ustudioacademy.com/lecciones" target="_blank" rel="noreferrer">{c.verLecciones}<ArrowUpRight size={18} aria-hidden />
            </a>
          </div>
          <div className={styles.disciplines} aria-label={c.ofertaPublicaDeLecciones}>
            <span>{c.guitarra}</span>
            <span>{c.piano}</span>
            <span>{c.canto}</span>
            <span>{c.bateria}</span>
            <span>{c.bajo}</span>
            <span>{c.produccionMusical}</span>
          </div>
          <figure className={styles.desktop}>
            <a
              href="/projects/academy-lessons-v4.webp"
              target="_blank"
              rel="noreferrer"
              aria-label={c.ampliarLeccionesDe4u}
            >
              <Image
                src="/projects/academy-lessons-v4.webp"
                width={1440}
                height={1000}
                alt={c.leccionesEnLaWeb}
                sizes="92vw"
              />
            </a>
            <figcaption>{c.webPublicaLecciones21}</figcaption>
          </figure>
          <div className={styles.mobileStory}>
            <div>
              <p className={styles.kicker}>{c.deLaIntencionA}</p>
              <h3>{c.elegir}<br />{c.conocer}<br />{c.agendar}</h3>
              <p>{c.laOfertaReuneInstrumentos}</p>
              <a href="https://4ustudioacademy.com/agendar" target="_blank" rel="noreferrer">{c.conocerLaAgenda}<ArrowUpRight size={18} aria-hidden />
              </a>
            </div>
            <figure>
              <a
                href="/projects/academy-lessons-mobile-v4.webp"
                target="_blank"
                rel="noreferrer"
                aria-label={c.ampliarLeccionesEnMovil}
              >
                <Image
                  src="/projects/academy-lessons-mobile-v4.webp"
                  width={390}
                  height={844}
                  alt={c.leccionesDe4uStudio}
                  sizes="(max-width:760px) 75vw, 320px"
                />
              </a>
              <figcaption>{c.laMismaOfertaEn}</figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.direction} aria-labelledby="academy-direction-title">
          <h2 id="academy-direction-title">{c.delSonido}<br />{c.alEspacio}</h2>
          <div>
            <p>{c.elEstudioConceptualLleva}</p>
            <p>{c.losAcabadosDistinguenCada}</p>
          </div>
        </section>
        <section className={styles.stack} aria-label={c.tecnologiasDe4uStudio}>
          <p className={styles.kicker}>{c.tecnologias}</p>
          <div>
            {technologies.filter((item) => item.projectIds.includes(project.id)).map(
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
        <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">{c.hablemosDeTuProyecto}<ArrowUpRight size={24} aria-hidden />
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
