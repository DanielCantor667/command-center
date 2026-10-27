import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useId, useState, type RefObject } from 'react';
import { PROJECTS } from '../../data/projects';
import { CORNER_PROJECTS } from './world-state';
import styles from './workshop-game.module.css';

const PUBLIC_PROJECTS = PROJECTS.filter(project => project.public);
const FIRST_CORNER = CORNER_PROJECTS[0], LAST_CORNER = CORNER_PROJECTS[CORNER_PROJECTS.length - 1];

/** Keyboard and screen-reader route to every screen on the project wall. */
export function ProjectsInspection({ buttonRef, onOpen, onBack, onFocus }: { buttonRef: RefObject<HTMLButtonElement | null>; onOpen: (projectId: string) => void; onBack: () => void; onFocus?: (projectId: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  return <section className={styles.inspection} aria-labelledby="projects-inspection-title" data-open={open}>
    <span className={styles.roomLabel}>Pared de proyectos</span><h1 id="projects-inspection-title">Proyectos</h1>
    <div className={styles.inspectionActions}>
      <button ref={buttonRef} className={styles.fold} type="button" aria-controls={detailsId} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Ocultar lista' : 'Ver lista'}{open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}</button>
    </div>
    <div className={styles.inspectionDetails} id={detailsId}>
      <p>Elige una pantalla o un proyecto de la lista para leer su caso.</p>
      <ul className={styles.projectList}>
        {PUBLIC_PROJECTS.map(project => <li key={project.id}><button type="button" className={styles.back} aria-label={`Abrir caso de ${project.name}`} onClick={() => onOpen(project.id)}
          onMouseEnter={() => onFocus?.(project.id)} onMouseLeave={() => onFocus?.(null)} onFocus={() => onFocus?.(project.id)} onBlur={() => onFocus?.(null)}>{project.name}<ArrowUpRight size={15} aria-hidden="true" /></button></li>)}
      </ul>
      <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Volver al taller</button>
    </div>
  </section>;
}

/** One project corner: its case, the neighbouring corners (step -1 / +1; the wall before the first) and the way out. */
export function CornerInspection({ projectId, buttonRef, onOpen, onStep, onAll, onBack, onFocus }: {
  projectId: string; buttonRef: RefObject<HTMLButtonElement | null>; onOpen: (projectId: string) => void;
  onStep: (step: -1 | 1) => void; onAll: () => void; onBack: () => void; onFocus?: (projectId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const project = PROJECTS.find(entry => entry.id === projectId)!;
  return <section className={styles.inspection} aria-labelledby="corner-title" data-open={open}>
    <span className={styles.roomLabel}>Rincón de proyecto</span><h1 id="corner-title">{project.name}</h1>
    <div className={styles.inspectionActions}>
      <button ref={buttonRef} type="button" className={styles.primary} aria-label={`Abrir caso de ${project.name}`} onClick={() => onOpen(project.id)}
        onMouseEnter={() => onFocus?.(project.id)} onMouseLeave={() => onFocus?.(null)}>Leer caso<ArrowUpRight size={17} aria-hidden="true" /></button>
      <button className={styles.fold} type="button" aria-label={open ? 'Ocultar detalles' : 'Ver detalles'} aria-controls={detailsId} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Ocultar' : 'Detalles'}{open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}</button>
    </div>
    <div className={styles.inspectionDetails} id={detailsId}>
      <p>{project.summary}</p>
      <div className={styles.inspectionActions}>
        <button className={styles.back} type="button" onClick={() => onStep(-1)}><ChevronLeft size={15} aria-hidden="true" />{projectId === FIRST_CORNER ? 'Pared de proyectos' : 'Anterior'}</button>
        {projectId !== LAST_CORNER && <button className={styles.back} type="button" onClick={() => onStep(1)}>Siguiente<ChevronRight size={15} aria-hidden="true" /></button>}
      </div>
      <button className={styles.back} type="button" onClick={onAll}>Ver todos los proyectos</button>
      <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" />Volver al taller</button>
    </div>
  </section>;
}
