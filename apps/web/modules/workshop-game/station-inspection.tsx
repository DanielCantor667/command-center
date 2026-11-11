import { useId, useState, type RefObject } from 'react';
import { ArrowUpRight, ArrowLeft, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { useDictionary } from '../../i18n/locale-provider';
import type { StationId } from './stations';
import styles from './workshop-game.module.css';
export function StationInspection({ station, buttonRef, computerButtonRef, onOpen, onBack, onComputer }: { station: StationId; buttonRef: RefObject<HTMLButtonElement | null>; computerButtonRef?: RefObject<HTMLButtonElement | null>; onOpen: () => void; onBack: () => void; onComputer?: () => void }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const { workshop: t } = useDictionary();
  const entry = t.stations[station];
  return <section className={styles.inspection} aria-labelledby="station-title" data-open={open}>
    <span className={styles.roomLabel}>{t.inspection.inside}</span><h1 id="station-title">{entry.name}</h1>
    <div className={styles.inspectionActions}>
      <button ref={buttonRef} type="button" className={styles.primary} onClick={onOpen}>{entry.action}<ArrowUpRight size={17} aria-hidden="true" /></button>
      {onComputer && <button ref={computerButtonRef} className={styles.computer} type="button" onClick={onComputer}>{t.inspection.enterDesk}<Terminal size={15} aria-hidden="true" /></button>}
      <button className={styles.fold} type="button" aria-label={open ? t.inspection.hideDetails : t.inspection.showDetails} aria-controls={detailsId} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? t.inspection.hide : t.inspection.details}{open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}</button>
    </div>
    <div className={styles.inspectionDetails} id={detailsId}>
      <p>{entry.description}</p>
      <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" />{t.inspection.back}</button>
    </div>
  </section>;
}
