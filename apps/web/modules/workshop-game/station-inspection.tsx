import type { RefObject } from 'react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { STATIONS, type StationId } from './stations';
import styles from './workshop-game.module.css';
export function StationInspection({ station, buttonRef, onOpen, onBack }: { station: StationId; buttonRef: RefObject<HTMLButtonElement | null>; onOpen: () => void; onBack: () => void }) {
  const entry = STATIONS[station];
  return <section className={styles.inspection} aria-labelledby="station-title">
    <span className={styles.roomLabel}>Dentro del taller</span><h1 id="station-title">{entry.name}</h1><p>{entry.description}</p>
    <button ref={buttonRef} type="button" className={styles.primary} onClick={onOpen}>{entry.label}<ArrowUpRight size={17} aria-hidden="true" /></button>
    <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" />Volver al taller</button>
  </section>;
}
