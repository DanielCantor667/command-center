import { useId, useState, type RefObject } from 'react';
import { ArrowUpRight, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { STATIONS, type StationId } from './stations';
import styles from './workshop-game.module.css';
export function StationInspection({ station, buttonRef, onOpen, onBack }: { station: StationId; buttonRef: RefObject<HTMLButtonElement | null>; onOpen: () => void; onBack: () => void }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const entry = STATIONS[station];
  return <section className={styles.inspection} aria-labelledby="station-title" data-open={open}>
    <span className={styles.roomLabel}>Dentro del taller</span><h1 id="station-title">{entry.name}</h1>
    <div className={styles.inspectionActions}>
      <button ref={buttonRef} type="button" className={styles.primary} onClick={onOpen}>{entry.label}<ArrowUpRight size={17} aria-hidden="true" /></button>
      <button className={styles.fold} type="button" aria-label={open ? 'Ocultar detalles' : 'Ver detalles'} aria-controls={detailsId} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Ocultar' : 'Detalles'}{open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}</button>
    </div>
    <div className={styles.inspectionDetails} id={detailsId}>
      <p>{entry.description}</p>
      <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" />Volver al taller</button>
    </div>
  </section>;
}
