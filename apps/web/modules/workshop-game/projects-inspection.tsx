import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useId, useState, type RefObject } from 'react';
import { PROJECTS } from '../../data/projects';
import { CORNER_PROJECTS } from './world-state';
import { fill } from '../../i18n/format';
import { useDictionary } from '../../i18n/locale-provider';
import styles from './workshop-game.module.css';
import { useContent } from '../../data/content/content';

const FIRST_CORNER = CORNER_PROJECTS[0], LAST_CORNER = CORNER_PROJECTS[CORNER_PROJECTS.length - 1];

/** Keyboard and screen-reader route to every screen on the project wall. */
export function ProjectsInspection({ buttonRef, onOpen, onBack, onFocus }: { buttonRef: RefObject<HTMLButtonElement | null>; onOpen: (projectId: string) => void; onBack: () => void; onFocus?: (projectId: string | null) => void }) {
  const { workshop: { inspection: t } } = useDictionary();
  const publicProjects = useContent().projects.filter(project => project.public);
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  return <section className={styles.inspection} aria-labelledby="projects-inspection-title" data-open={open}>
    <span className={styles.roomLabel}>{t.wall}</span><h1 id="projects-inspection-title">{t.projects}</h1>
    <div className={styles.inspectionActions}>
      <button ref={buttonRef} className={styles.fold} type="button" aria-controls={detailsId} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? t.hideList : t.showList}{open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}</button>
    </div>
    <div className={styles.inspectionDetails} id={detailsId}>
      <p>{t.wallHint}</p>
      <ul className={styles.projectList}>
        {publicProjects.map(project => <li key={project.id}><button type="button" className={styles.back} aria-label={fill(t.openCaseOf, { name: project.name })} onClick={() => onOpen(project.id)}
          onMouseEnter={() => onFocus?.(project.id)} onMouseLeave={() => onFocus?.(null)} onFocus={() => onFocus?.(project.id)} onBlur={() => onFocus?.(null)}>{project.name}<ArrowUpRight size={15} aria-hidden="true" /></button></li>)}
      </ul>
      <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> {t.back}</button>
    </div>
  </section>;
}

/** One project corner: its case, the neighbouring corners (step -1 / +1; the wall before the first) and the way out. */
export function CornerInspection({ projectId, buttonRef, onOpen, onStep, onAll, onBack, onFocus }: {
  projectId: string; buttonRef: RefObject<HTMLButtonElement | null>; onOpen: (projectId: string) => void;
  onStep: (step: -1 | 1) => void; onAll: () => void; onBack: () => void; onFocus?: (projectId: string | null) => void;
}) {
  const { workshop: { inspection: t } } = useDictionary();
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const project = useContent().projects.find(entry => entry.id === projectId) ?? PROJECTS.find(entry => entry.id === projectId)!;
  return <section className={styles.inspection} aria-labelledby="corner-title" data-open={open}>
    <span className={styles.roomLabel}>{t.corner}</span><h1 id="corner-title">{project.name}</h1>
    <div className={styles.inspectionActions}>
      <button ref={buttonRef} type="button" className={styles.primary} aria-label={fill(t.openCaseOf, { name: project.name })} onClick={() => onOpen(project.id)}
        onMouseEnter={() => onFocus?.(project.id)} onMouseLeave={() => onFocus?.(null)}>{t.readCase}<ArrowUpRight size={17} aria-hidden="true" /></button>
      <button className={styles.fold} type="button" aria-label={open ? t.hideDetails : t.showDetails} aria-controls={detailsId} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? t.hide : t.details}{open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}</button>
    </div>
    <div className={styles.inspectionDetails} id={detailsId}>
      <p>{project.summary}</p>
      <div className={styles.inspectionActions}>
        <button className={styles.back} type="button" onClick={() => onStep(-1)}><ChevronLeft size={15} aria-hidden="true" />{projectId === FIRST_CORNER ? t.wall : t.previous}</button>
        {projectId !== LAST_CORNER && <button className={styles.back} type="button" onClick={() => onStep(1)}>{t.next}<ChevronRight size={15} aria-hidden="true" /></button>}
      </div>
      <button className={styles.back} type="button" onClick={onAll}>{t.allProjects}</button>
      <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" />{t.back}</button>
    </div>
  </section>;
}
