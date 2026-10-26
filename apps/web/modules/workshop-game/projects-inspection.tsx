import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useId, useState, type RefObject } from 'react';
import { PROJECTS } from '../../data/projects';
import styles from './workshop-game.module.css';

const PUBLIC_PROJECTS = PROJECTS.filter(project => project.public);

/** Keyboard and screen-reader route to every screen on the project wall. */
export function ProjectsInspection({ buttonRef, onOpen, onBack }: { buttonRef: RefObject<HTMLButtonElement | null>; onOpen: (projectId: string) => void; onBack: () => void }) {
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
        {PUBLIC_PROJECTS.map(project => <li key={project.id}><button type="button" className={styles.back} aria-label={`Abrir caso de ${project.name}`} onClick={() => onOpen(project.id)}>{project.name}<ArrowUpRight size={15} aria-hidden="true" /></button></li>)}
      </ul>
      <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Volver al taller</button>
    </div>
  </section>;
}
