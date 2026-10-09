'use client';

import { ArrowUpRight, Code, MessageSquare, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PORTFOLIO_CAREER } from '../../data/portfolio-career';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import { TechnologyExplorer, type TechnologyFilters } from '../experience/components/technology-explorer';
import type { WorkshopReading } from './reading';
import type { WorldPoint } from './world-state';
import { WorldMap } from './world-map';
import styles from './workshop-reader.module.css';
export interface WorkshopReaderProps {
  reading: WorkshopReading;
  currentPoint: WorldPoint;
  worldAvailable: boolean;
  technologyFilters: TechnologyFilters;
  onTechnologyFiltersChange: (filters: TechnologyFilters) => void;
  onRead: (reading: WorkshopReading) => void;
  onGo: (point: Exclude<WorldPoint, 'entrance'>) => void;
  onOpenCase: (id: string) => void;
  onClose: () => void;
}
const titles = { technologies: 'Tecnologías', trajectory: 'Trayectoria', contact: 'Contacto', map: 'Mapa del taller' } as const;

export function WorkshopReader({ reading, currentPoint, worldAvailable, technologyFilters, onTechnologyFiltersChange, onRead, onGo, onOpenCase, onClose }: WorkshopReaderProps) {
  const titleId = useId();
  const panel = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const close = useRef(onClose); close.current = onClose;

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    heading.current?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]') ?? [])]
        .filter(node => !node.closest('[hidden],[inert],[aria-hidden="true"]'));
      const first = nodes[0], last = nodes.at(-1);
      if (!first || !last) { event.preventDefault(); panel.current?.focus(); return; }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === heading.current || !panel.current?.contains(active))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (active === last || !panel.current?.contains(active))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', keydown, true);
    return () => {
      document.removeEventListener('keydown', keydown, true);
      document.body.style.overflow = overflow;
      if (opener?.isConnected && !opener.closest('[inert],[aria-hidden="true"]')) opener.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [reading.kind]);

  if (typeof document === 'undefined') return null;
  return createPortal(<div className={styles.backdrop} onPointerDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-workshop-reading={reading.kind}>
      <header className={styles.header}>
        <div><span className={styles.workshop}>El taller de Daniel</span><h1 ref={heading} id={titleId} tabIndex={-1}>{titles[reading.kind]}</h1></div>
        <button type="button" className={styles.close} aria-label="Cerrar lectura" onClick={onClose}><X size={22} aria-hidden="true" /></button>
      </header>
      <div className={styles.content}>
        {reading.kind === 'technologies' && <TechnologyExplorer presentation="html" selectedId={reading.technologyId} onSelect={technologyId => onRead({ kind: 'technologies', technologyId })} initialFilters={technologyFilters} onFiltersChange={onTechnologyFiltersChange} onProjectSelect={onOpenCase} />}
        {reading.kind === 'trajectory' && <div className={styles.career}>
          <section aria-labelledby={`${titleId}-experience`}><h2 id={`${titleId}-experience`}>Experiencia</h2><div className={styles.timeline}>{PORTFOLIO_CAREER.experience.map(item => <article key={item.id}><p className={styles.period}>{item.period}</p><h3>{item.title}</h3><p className={styles.organization}>{item.organization}</p><p>{item.description}</p></article>)}</div></section>
          <section aria-labelledby={`${titleId}-education`}><h2 id={`${titleId}-education`}>Formación</h2><div className={styles.timeline}>{PORTFOLIO_CAREER.education.map(item => <article key={item.id}><p className={styles.period}>{item.period}</p><h3>{item.title}</h3><p className={styles.organization}>{item.organization}</p></article>)}</div></section>
          <section className={styles.languages} aria-labelledby={`${titleId}-languages`}><h2 id={`${titleId}-languages`}>Idiomas</h2>{PORTFOLIO_CAREER.languages.map(item => <p key={item.name}><strong>{item.name}</strong><span>{item.level}</span></p>)}</section>
        </div>}
        {reading.kind === 'contact' && <div className={styles.contact}>
          <div className={styles.profile}><h2>{PUBLIC_PROFILE.name}</h2><p className={styles.role}>{PUBLIC_PROFILE.role}</p><p className={styles.location}>{PUBLIC_PROFILE.location}</p></div>
          <p className={styles.availability}>{PUBLIC_PROFILE.availability}</p>
          <nav className={styles.contactLinks} aria-label="Canales públicos de Daniel">
            <a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer"><MessageSquare size={22} aria-hidden="true" /><span>Hablemos en LinkedIn</span><ArrowUpRight size={20} aria-hidden="true" /></a>
            <a href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer"><Code size={22} aria-hidden="true" /><span>Explorar mi GitHub</span><ArrowUpRight size={20} aria-hidden="true" /></a>
          </nav>
        </div>}
        {reading.kind === 'map' && <WorldMap currentPoint={currentPoint} worldAvailable={worldAvailable} onRead={onRead} onGo={onGo} onOpenCase={onOpenCase} />}
      </div>
    </section>
  </div>, document.body);
}
