'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import { PORTFOLIO_TECHNOLOGIES } from '../../../../data/portfolio-technologies';
import type { PortfolioCaseProps } from './component';
import { AcademyStudio } from './academy-studio';
import styles from './academy-case.module.css';

export function AcademyCase({
  project,
  onSelect,
  onReturn,
  onNavigate,
  onTechnologySelect,
  returnLabel = 'Volver a la ciudad',
}: PortfolioCaseProps) {
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
          aria-label="Daniel Cantor, inicio"
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
          >
            Tecnologías
            <ArrowUpRight size={16} aria-hidden />
          </button>
        )}
      </header>
      <article>
        <section className={styles.hero} aria-labelledby="academy-title">
          <picture>
            <source media="(max-width:760px)" srcSet="/experience/academy-hero-mobile-v4.webp" />
            <Image
              src="/experience/academy-hero-wide-v4.webp"
              alt="Estudio musical conceptual de 4U, render de Blender"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className={styles.heroImage}
            />
          </picture>
          <div className={styles.heroTitle}>
            <p>Música y aprendizaje / Bogotá</p>
            <h1 id="academy-title" ref={heading} tabIndex={-1}>
              4U Studio <span>Academy</span>
            </h1>
          </div>
          <div className={styles.heroFoot}>
            <p data-case-context="4ustudio-academy" className={styles.context}>
              <span>Academia de música y lecciones presenciales.</span>
              <strong>{project.role.title}</strong>
            </p>
            <a href="#academy-studio">
              Entrar al estudio
              <ArrowDown size={20} aria-hidden />
            </a>
            <a href={project.links.live} target="_blank" rel="noreferrer">
              Visitar academia
              <ArrowUpRight size={20} aria-hidden />
            </a>
          </div>
        </section>

        <section className={styles.intro} aria-labelledby="academy-intro">
          <p className={styles.kicker}>El proyecto</p>
          <h2 id="academy-intro">
            Cada comienzo
            <br />
            tiene su sonido.
          </h2>
          <div className={styles.introCopy}>
            <p>
              Una plataforma para una academia de música presencial. La experiencia conecta la
              exploración de lecciones con el primer paso hacia una clase.
            </p>
            <dl>
              <div>
                <dt>Participación</dt>
                <dd>Desarrollo full-stack y producto</dd>
              </div>
              <div>
                <dt>Experiencia</dt>
                <dd>Oferta musical y agenda pública</dd>
              </div>
            </dl>
          </div>
        </section>

        <AcademyStudio />

        <section className={styles.lessons} aria-labelledby="academy-lessons-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>La academia publicada</p>
              <h2 id="academy-lessons-title">
                Encontrar tu instrumento.
                <br />
                Dar el primer paso.
              </h2>
            </div>
            <a href="https://4ustudioacademy.com/lecciones" target="_blank" rel="noreferrer">
              Ver lecciones
              <ArrowUpRight size={18} aria-hidden />
            </a>
          </div>
          <div className={styles.disciplines} aria-label="Oferta pública de lecciones">
            <span>Guitarra</span>
            <span>Piano</span>
            <span>Canto</span>
            <span>Batería</span>
            <span>Bajo</span>
            <span>Producción musical</span>
          </div>
          <figure className={styles.desktop}>
            <a
              href="/projects/academy-lessons-v4.webp"
              target="_blank"
              rel="noreferrer"
              aria-label="Ampliar lecciones de 4U"
            >
              <Image
                src="/projects/academy-lessons-v4.webp"
                width={1440}
                height={1000}
                alt="Lecciones en la web pública de 4U Studio Academy"
                sizes="92vw"
              />
            </a>
            <figcaption>Web pública / Lecciones / 21 de septiembre de 2026</figcaption>
          </figure>
          <div className={styles.mobileStory}>
            <div>
              <p className={styles.kicker}>De la intención a la clase</p>
              <h3>
                Elegir.
                <br />
                Conocer.
                <br />
                Agendar.
              </h3>
              <p>
                La oferta reúne instrumentos y disciplinas. Cada lección presenta su enfoque y
                conduce a la agenda, manteniendo la identidad de la academia también en móvil.
              </p>
              <a href="https://4ustudioacademy.com/agendar" target="_blank" rel="noreferrer">
                Conocer la agenda
                <ArrowUpRight size={18} aria-hidden />
              </a>
            </div>
            <figure>
              <a
                href="/projects/academy-lessons-mobile-v4.webp"
                target="_blank"
                rel="noreferrer"
                aria-label="Ampliar lecciones en móvil"
              >
                <Image
                  src="/projects/academy-lessons-mobile-v4.webp"
                  width={390}
                  height={844}
                  alt="Lecciones de 4U Studio Academy en móvil"
                  sizes="(max-width:760px) 75vw, 320px"
                />
              </a>
              <figcaption>La misma oferta, en móvil.</figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.direction} aria-labelledby="academy-direction-title">
          <h2 id="academy-direction-title">
            Del sonido
            <br />
            al espacio.
          </h2>
          <div>
            <p>
              El estudio conceptual lleva el universo musical de 4U a tres dimensiones. El piano
              organiza la escena; guitarra, micrófono y percusión completan el conjunto.
            </p>
            <p>
              Los acabados distinguen cada objeto: teclas satinadas, madera de instrumento, metal y
              superficies acústicas. Una interpretación de marca, no una reproducción de la sede.
            </p>
          </div>
        </section>
        <section className={styles.stack} aria-label="Tecnologías de 4U Studio Academy">
          <p className={styles.kicker}>Tecnologías</p>
          <div>
            {PORTFOLIO_TECHNOLOGIES.filter((item) => item.projectIds.includes(project.id)).map(
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
        <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">
          Hablemos de tu proyecto
          <ArrowUpRight size={24} aria-hidden />
        </a>
        <nav aria-label="Recorrido de proyectos">
          {previous && (
            <button type="button" onClick={() => onSelect(previous.id)}>
              <span>Proyecto anterior</span>
              <ArrowLeft size={22} aria-hidden />
              {previous.name}
            </button>
          )}
          {next && (
            <button type="button" onClick={() => onSelect(next.id)}>
              <span>Siguiente proyecto</span>
              {next.name}
              <ArrowRight size={22} aria-hidden />
            </button>
          )}
        </nav>
      </footer>
    </main>
  );
}
