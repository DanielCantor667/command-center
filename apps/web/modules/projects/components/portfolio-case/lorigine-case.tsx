'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '../../../../data/projects';
import { PUBLIC_PROFILE } from '../../../../data/public-profile';
import { PORTFOLIO_TECHNOLOGIES } from '../../../../data/portfolio-technologies';
import type { PortfolioCaseProps } from './component';
import { LorigineGallery } from './lorigine-gallery';
import styles from './lorigine-case.module.css';

export function LorigineCase({
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
    <main className={styles.case} data-project="lorigine">
      <header className={styles.header}>
        <button
          className={styles.identity}
          type="button"
          onClick={onReturn}
          aria-label="Daniel Cantor, inicio"
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
        <section className={styles.hero} aria-labelledby="lorigine-title">
          <picture>
            <source media="(max-width:760px)" srcSet="/experience/lorigine-hero-mobile-v4.webp" />
            <Image
              className={styles.heroImage}
            src="/experience/lorigine-hero-wide-v4.webp"
              alt="Galería conceptual L’ORIGINE creada en Blender"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
            />
          </picture>
          <div className={styles.heroTitle}>
            <p>Marca y comercio digital</p>
            <h1 ref={heading} tabIndex={-1} id="lorigine-title">
              L&apos;ORIGINE
            </h1>
          </div>
          <div className={styles.heroFoot}>
            <p data-case-context="lorigine" className={styles.context}>
              <span>Tienda de cuidado capilar profesional.</span>
              <strong>{project.role.title}</strong>
            </p>
            <a href="#lorigine-gallery">
              Recorrer la galería
              <ArrowDown size={20} aria-hidden />
            </a>
            <a href={project.links.live} target="_blank" rel="noreferrer">
              Visitar sitio
              <ArrowUpRight size={20} aria-hidden />
            </a>
          </div>
        </section>

        <section className={styles.intro} aria-labelledby="lorigine-intro">
          <p className={styles.kicker}>El proyecto</p>
          <h2 id="lorigine-intro">
            La marca se reconoce.
            <br />
            El producto se entiende.
          </h2>
          <div>
            <p>
              Una tienda de cuidado capilar profesional donde fotografía, contenido y catálogo
              forman parte de la misma experiencia. La identidad acompaña la exploración, desde la
              colección hasta la ficha de producto.
            </p>
            <dl>
              <div>
                <dt>Participación</dt>
                <dd>Desarrollo full-stack y producto</dd>
              </div>
              <div>
                <dt>Entorno</dt>
                <dd>Web, escritorio y móvil</dd>
              </div>
            </dl>
          </div>
        </section>

        <LorigineGallery />

        <section className={styles.evidence} aria-labelledby="lorigine-evidence">
          <div className={styles.evidenceTitle}>
            <p className={styles.kicker}>La experiencia publicada</p>
            <h2 id="lorigine-evidence">
              Del objeto
              <br />a la elección.
            </h2>
            <p>
              El catálogo permite explorar por categoría y ordenar la colección. La ficha reúne
              imagen, presentación y acceso a la compra.
            </p>
            <a href="https://www.lorigine.com.co/productos" target="_blank" rel="noreferrer">
              Ver catálogo real
              <ArrowUpRight size={17} aria-hidden />
            </a>
          </div>
          <figure className={styles.catalog}>
            <a
              href="/projects/lorigine-catalog-v4.webp"
              target="_blank"
              rel="noreferrer"
              aria-label="Ampliar catálogo de L’ORIGINE"
            >
              <Image
                src="/projects/lorigine-catalog-v4.webp"
                alt="Catálogo público de L’ORIGINE"
                width={1440}
                height={1000}
                sizes="(max-width:760px) 92vw, 65vw"
              />
            </a>
            <figcaption>Catálogo público. Captura del 18 de septiembre de 2026.</figcaption>
          </figure>
          <figure className={styles.mobile}>
            <a
              href="/projects/lorigine-product-mobile-v4.webp"
              target="_blank"
              rel="noreferrer"
              aria-label="Ampliar ficha móvil de L’ORIGINE"
            >
              <Image
                src="/projects/lorigine-product-mobile-v4.webp"
                alt="Ficha pública de L’ORIGINE en móvil"
                width={390}
                height={844}
                sizes="(max-width:760px) 70vw, 280px"
              />
            </a>
            <figcaption>La ficha, en móvil.</figcaption>
          </figure>
          <div className={styles.observation}>
            <span>Continuidad de marca</span>
            <p>
              Los tonos minerales, el ámbar del envase y la fotografía mantienen una identidad
              reconocible entre catálogo y producto.
            </p>
          </div>
        </section>

        <section className={styles.craft} aria-labelledby="lorigine-craft">
          <div>
            <p className={styles.kicker}>Decisiones de implementación</p>
            <h2 id="lorigine-craft">
              El ritmo también
              <br />
              es parte del producto.
            </h2>
            <p className={styles.craftNote}>
              Decisiones contrastadas con el código del proyecto. Sin atribuir resultados
              comerciales no medidos.
            </p>
          </div>
          <div className={styles.decisions}>
            <section>
              <h3>Una selección que vive en la URL.</h3>
              <p>
                Categoría y orden se resuelven desde los parámetros de la página de productos. El
                catálogo puede enlazarse con esa selección y renderiza los productos
                correspondientes en el servidor.
              </p>
              <span>Fuente: productos/page.tsx</span>
            </section>
            <section>
              <h3>Un vocabulario compartido de movimiento.</h3>
              <p>
                Duraciones, curvas y distancias están definidas en tokens. Las variantes reutilizan
                ese vocabulario para dar continuidad a las transiciones.
              </p>
              <span>Fuente: lib/motion.ts y motion/variants.ts</span>
            </section>
            <section>
              <h3>El contenido no depende de la animación.</h3>
              <p>
                El componente Reveal devuelve contenido sin animación cuando está activa la
                preferencia de movimiento reducido.
              </p>
              <span>Fuente: motion/reveal.tsx</span>
            </section>
          </div>
        </section>
        <section className={styles.stack} aria-label="Tecnologías de L’ORIGINE">
          <p className={styles.kicker}>Tecnologías</p>
          <div>
            {PORTFOLIO_TECHNOLOGIES.filter((item) => item.projectIds.includes('lorigine')).map(
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
          <ArrowUpRight size={22} aria-hidden />
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
