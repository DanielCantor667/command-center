'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Database, FileText, LayoutGrid, MessageCircle, Network, ShoppingBag } from 'lucide-react';
import styles from '../experience.module.css';

export const KLINIU_TOUR_STOPS = [
  { id: 'catalog', label: 'Catálogo', icon: LayoutGrid, position: [-0.95, 1.1, 0.7] },
  { id: 'purchase', label: 'Compra', icon: ShoppingBag, position: [0.9, 0.9, 0.85] },
  { id: 'architecture', label: 'Arquitectura', icon: Network, position: [0.25, 2, -0.5] },
] as const;
export type KliniuTourStop = (typeof KLINIU_TOUR_STOPS)[number]['id'];

const evidence = {
  catalog: {
    title: 'Un catálogo para cada espacio.',
    text: 'Dispensadores e higiene institucional. Categorías, búsqueda y productos destacados conectan la necesidad del cliente con la ficha de cada referencia.',
    image: '/projects/kliniu-tour-catalog.jpg',
    alt: 'Catálogo real de Kliniu',
    caption: 'Sitio público · Productos destacados',
  },
  purchase: {
    title: 'Del producto a la cotización.',
    text: 'La ficha reúne galería, especificaciones y selección de cantidades. La consulta comercial continúa con una cotización o contacto por WhatsApp.',
    image: '/projects/kliniu-tour-purchase.jpg',
    alt: 'Ficha real de producto de Kliniu',
    caption: 'Sitio público · Ficha de producto',
  },
  architecture: {
    title: 'La estructura del producto.',
    text: 'Next.js y React sostienen la experiencia web. El proyecto combina lógica de negocio en servidor y acceso a PostgreSQL mediante Supabase y Prisma.',
    image: null,
    alt: '',
    caption: 'Esquema técnico · Basado en el repositorio',
  },
};

export function KliniuTour({ stop, onSelect, onCase, onContact }: {
  stop: KliniuTourStop;
  onSelect: (stop: KliniuTourStop) => void;
  onCase: () => void;
  onContact: () => void;
}) {
  const content = evidence[stop];
  return (
    <section className={styles.kliniuTour} aria-label="Recorrido de Kliniu">
      <div className={styles.tourStops} role="group" aria-label="Puntos del recorrido de Kliniu">
        {KLINIU_TOUR_STOPS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-pressed={stop === id} aria-controls="kliniu-tour-evidence"
            onClick={() => onSelect(id)}>
            <Icon size={17} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </div>
      <div id="kliniu-tour-evidence" className={styles.tourEvidence}>
        <figure className={styles.tourFigure}>
          {content.image ? (
            <a href={content.image} target="_blank" rel="noreferrer" aria-label={`Ampliar: ${content.alt}`}>
              <Image src={content.image} alt={content.alt} width={1440} height={1000}
                sizes="(max-width:800px) 100vw, 40vw" />
              <ArrowUpRight size={18} className={styles.tourEnlarge} aria-hidden="true" />
            </a>
          ) : (
            <div className={styles.tourArchitecture} aria-label="Arquitectura de Kliniu">
              <div><LayoutGrid size={22} /><span>Experiencia web<strong>Next.js · React</strong></span></div>
              <ArrowDown size={18} aria-hidden="true" />
              <div><Network size={22} /><span>Lógica de negocio<strong>Servidor · TypeScript</strong></span></div>
              <ArrowDown size={18} aria-hidden="true" />
              <div><Database size={22} /><span>Persistencia<strong>PostgreSQL</strong><small>Supabase · Prisma</small></span></div>
            </div>
          )}
          <figcaption>{content.caption}</figcaption>
        </figure>
        <div className={styles.tourCopy}>
          <p className={styles.projectType}>Kliniu / {KLINIU_TOUR_STOPS.find(item => item.id === stop)?.label}</p>
          <h3 aria-live="polite" aria-atomic="true">{content.title}</h3>
          <p>{content.text}</p>
          <div className={styles.tourActions}>
            <button type="button" onClick={onCase} aria-label="Abrir caso completo de Kliniu"><FileText size={16} />Caso completo</button>
            <a href="https://kliniucolombia.com/" target="_blank" rel="noreferrer">Abrir Kliniu<ArrowUpRight size={16} /></a>
            <button type="button" onClick={onContact}><MessageCircle size={16} />Hablemos de tu proyecto</button>
          </div>
        </div>
      </div>
    </section>
  );
}
