'use client';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { RefObject } from 'react';
import { PROJECTS } from '../../data/projects';
import { WORKSHOP_ROOMS, type RoomId } from './rooms';
import styles from './workshop-game.module.css';
export function RoomInspection({ room, buttonRef, onOpen, onBack }: { room: RoomId; buttonRef: RefObject<HTMLButtonElement | null>; onOpen: () => void; onBack: () => void }) {
  const definition = WORKSHOP_ROOMS[room];
  const project = PROJECTS.find(project => project.id === definition.projectId)!;
  return <section className={styles.inspection} aria-labelledby="room-inspection-title" data-room-inspection={room}>
    <span className={styles.roomLabel}>Proyecto</span><h1 id="room-inspection-title">{project.name}</h1>
    <p>{project.summary}</p>
    <figure className={styles.evidencePreview}><Image src={definition.evidence} alt={`Captura real del sitio de ${project.name}`} width={640} height={360} sizes="280px" /><figcaption>Captura del sitio publicado</figcaption></figure>
    {project.ownership.type === 'unconfirmed' && <p className={styles.attribution}>Participación descrita en el CV de Daniel. Propiedad no confirmada.</p>}
    <button ref={buttonRef} className={styles.primary} type="button" onClick={onOpen}>Abrir caso de {project.name}<ArrowUpRight size={18} aria-hidden="true" /></button>
    <button className={styles.back} type="button" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Volver al taller</button>
  </section>;
}
