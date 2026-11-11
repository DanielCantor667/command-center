'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Database, FileText, LayoutGrid, MessageCircle, Network, ShoppingBag } from 'lucide-react';
import { usePick } from '../../../i18n/use-pick';
import styles from '../experience.module.css';

export const KLINIU_TOUR_STOPS = [
  { id: 'catalog', label: ['Catálogo', 'Catalog'], icon: LayoutGrid, position: [-0.95, 1.1, 0.7] },
  { id: 'purchase', label: ['Compra', 'Purchase'], icon: ShoppingBag, position: [0.9, 0.9, 0.85] },
  { id: 'architecture', label: ['Arquitectura', 'Architecture'], icon: Network, position: [0.25, 2, -0.5] },
] as const;
export type KliniuTourStop = (typeof KLINIU_TOUR_STOPS)[number]['id'];

const evidence = {
  catalog: {
    title: ['Un catálogo para cada espacio.', 'A catalog for every space.'],
    text: ['Dispensadores e higiene institucional. Categorías, búsqueda y productos destacados conectan la necesidad del cliente con la ficha de cada referencia.', 'Dispensers and institutional hygiene. Categories, search and featured products connect the customer’s need with the page of each reference.'],
    image: '/projects/kliniu-tour-catalog.jpg',
    alt: ['Catálogo real de Kliniu', 'Real Kliniu catalog'],
    caption: ['Sitio público · Productos destacados', 'Public site · Featured products'],
  },
  purchase: {
    title: ['Del producto a la cotización.', 'From product to quote.'],
    text: ['La ficha reúne galería, especificaciones y selección de cantidades. La consulta comercial continúa con una cotización o contacto por WhatsApp.', 'The product page brings together the gallery, specifications and quantity selection. The sales inquiry continues with a quote or a WhatsApp contact.'],
    image: '/projects/kliniu-tour-purchase.jpg',
    alt: ['Ficha real de producto de Kliniu', 'Real Kliniu product page'],
    caption: ['Sitio público · Ficha de producto', 'Public site · Product page'],
  },
  architecture: {
    title: ['La estructura del producto.', 'The structure of the product.'],
    text: ['Next.js y React sostienen la experiencia web. El proyecto combina lógica de negocio en servidor y acceso a PostgreSQL mediante Supabase y Prisma.', 'Next.js and React support the web experience. The project combines server-side business logic with access to PostgreSQL through Supabase and Prisma.'],
    image: null,
    alt: ['', ''],
    caption: ['Esquema técnico · Basado en el repositorio', 'Technical diagram · Based on the repository'],
  },
} as const;

export function KliniuTour({ stop, onSelect, onCase, onContact }: {
  stop: KliniuTourStop;
  onSelect: (stop: KliniuTourStop) => void;
  onCase: () => void;
  onContact: () => void;
}) {
  const pick = usePick();
  const content = evidence[stop];
  return (
    <section className={styles.kliniuTour} aria-label={pick(['Recorrido de Kliniu', 'Kliniu tour'])}>
      <div className={styles.tourStops} role="group" aria-label={pick(['Puntos del recorrido de Kliniu', 'Kliniu tour stops'])}>
        {KLINIU_TOUR_STOPS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-pressed={stop === id} aria-controls="kliniu-tour-evidence"
            onClick={() => onSelect(id)}>
            <Icon size={17} aria-hidden="true" /><span>{pick(label)}</span>
          </button>
        ))}
      </div>
      <div id="kliniu-tour-evidence" className={styles.tourEvidence}>
        <figure className={styles.tourFigure}>
          {content.image ? (
            <a href={content.image} target="_blank" rel="noreferrer" aria-label={`${pick(['Ampliar', 'Enlarge'])}: ${pick(content.alt)}`}>
              <Image src={content.image} alt={pick(content.alt)} width={1440} height={1000}
                sizes="(max-width:800px) 100vw, 40vw" />
              <ArrowUpRight size={18} className={styles.tourEnlarge} aria-hidden="true" />
            </a>
          ) : (
            <div className={styles.tourArchitecture} aria-label={pick(['Arquitectura de Kliniu', 'Kliniu architecture'])}>
              <div><LayoutGrid size={22} /><span>{pick(['Experiencia web', 'Web experience'])}<strong>Next.js · React</strong></span></div>
              <ArrowDown size={18} aria-hidden="true" />
              <div><Network size={22} /><span>{pick(['Lógica de negocio', 'Business logic'])}<strong>{pick(['Servidor · TypeScript', 'Server · TypeScript'])}</strong></span></div>
              <ArrowDown size={18} aria-hidden="true" />
              <div><Database size={22} /><span>{pick(['Persistencia', 'Persistence'])}<strong>PostgreSQL</strong><small>Supabase · Prisma</small></span></div>
            </div>
          )}
          <figcaption>{pick(content.caption)}</figcaption>
        </figure>
        <div className={styles.tourCopy}>
          <p className={styles.projectType}>Kliniu / {pick(KLINIU_TOUR_STOPS.find(item => item.id === stop)!.label)}</p>
          <h3 aria-live="polite" aria-atomic="true">{pick(content.title)}</h3>
          <p>{pick(content.text)}</p>
          <div className={styles.tourActions}>
            <button type="button" onClick={onCase} aria-label={pick(['Abrir caso completo de Kliniu', 'Open the full Kliniu case study'])}><FileText size={16} />{pick(['Caso completo', 'Full case study'])}</button>
            <a href="https://kliniucolombia.com/" target="_blank" rel="noreferrer">{pick(['Abrir Kliniu', 'Open Kliniu'])}<ArrowUpRight size={16} /></a>
            <button type="button" onClick={onContact}><MessageCircle size={16} />{pick(['Hablemos de tu proyecto', 'Let’s talk about your project'])}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
