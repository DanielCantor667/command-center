'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import type { WorkshopReading } from './reading';
import type { WorldPoint } from './world-state';
import { ROOM_IDS, WORKSHOP_ROOMS, roomForPoint } from './rooms';
import { STATIONS } from './stations';
import styles from './workshop-reader.module.css';
export interface WorldMapProps {
  currentPoint: WorldPoint;
  worldAvailable: boolean;
  onRead: (reading: WorkshopReading) => void;
  onGo: (point: Exclude<WorldPoint, 'entrance'>) => void;
  onOpenCase: (id: string) => void;
}
type Destination = Exclude<WorldPoint, 'entrance'>;
const destinations: Destination[] = ['hub', 'workbench', ...ROOM_IDS, 'technologies', 'trajectory', 'contact'];
const names: Record<Destination, string> = {
  hub: 'El taller', workbench: 'Mesa de trabajo', kliniu: WORKSHOP_ROOMS.kliniu.name,
  lorigine: WORKSHOP_ROOMS.lorigine.name, academy: WORKSHOP_ROOMS.academy.name, drokex: WORKSHOP_ROOMS.drokex.name,
  technologies: STATIONS.technologies.name, trajectory: STATIONS.trajectory.name, contact: STATIONS.contact.name,
};
const markers: Record<Destination, [number, number]> = {
  hub: [280, 278], workbench: [280, 195], kliniu: [155, 73], lorigine: [386, 73],
  academy: [115, 268], drokex: [445, 268], technologies: [80, 205], trajectory: [95, 150], contact: [450, 195],
};

export function WorldMap({ currentPoint, worldAvailable, onRead, onGo, onOpenCase }: WorldMapProps) {
  const activate = (point: Destination) => {
    if (worldAvailable) { onGo(point); return; }
    const room = roomForPoint(point);
    if (room) { onOpenCase(WORKSHOP_ROOMS[room].projectId); return; }
    if (point === 'technologies') onRead({ kind: 'technologies', technologyId: 'nextjs' });
    else if (point === 'trajectory' || point === 'contact') onRead({ kind: point });
  };
  return <div>
    <p className={styles.mapIntro}>{worldAvailable ? 'Elige un destino para acercarte.' : 'Lee los proyectos y conoce a Daniel desde aquí. Para recorrer el espacio, cierra el mapa y entra al taller.'}</p>
    <div className={styles.mapLayout}>
      <figure className={styles.mapFigure}>
        <svg viewBox="0 0 560 400" role="img" aria-label="Plano del taller">
          <rect x="36" y="22" width="488" height="330" rx="4" fill="#f4f5eb" stroke="#78917d" strokeWidth="2" />
          <path d="M36 129H255M305 129H524M255 22V129M305 22V129M36 233H184V300H36M524 233H376V300H524" fill="none" stroke="#78917d" strokeWidth="2" />
          <path d="M184 249V278M376 249V278M137 129H175M365 129H405" fill="none" stroke="#f4f5eb" strokeWidth="6" />
          <rect x="242" y="169" width="76" height="43" rx="3" fill="#c5b495" stroke="#a49477" />
          <rect x="57" y="178" width="16" height="48" fill="#b8c6b0" />
          <rect x="70" y="135" width="49" height="16" fill="#b8c6b0" />
          <rect x="424" y="176" width="51" height="33" rx="2" fill="#c5b495" stroke="#a49477" />
          <path d="M222 352H338" stroke="#315749" strokeWidth="5" />
          <text x="280" y="378" textAnchor="middle" fill="#52624f" fontSize="12">Entrada</text>
          {destinations.map(point => {
            const [x, y] = markers[point];
            const active = worldAvailable && currentPoint === point;
            return <g key={point}>
              <circle cx={x} cy={y} r={active ? 7 : 4} fill={active ? '#315749' : '#bc9b63'} stroke={active ? '#f4f5eb' : '#937a4f'} strokeWidth="1.5" />
              <text x={x} y={y + 20} textAnchor="middle" fill="#293c30" fontSize="11">{point === 'workbench' ? 'Mesa' : point === 'academy' ? 'Academy' : names[point]}</text>
            </g>;
          })}
        </svg>
        <figcaption>{worldAvailable && currentPoint !== 'entrance' ? `Estás en: ${names[currentPoint]}` : 'Selecciona un destino en la lista.'}</figcaption>
      </figure>
      <nav className={styles.mapDestinations} aria-label="Destinos del taller">
        {destinations.map(point => {
          const disabled = !worldAvailable && (point === 'hub' || point === 'workbench');
          const room = roomForPoint(point);
          return <button key={point} type="button" disabled={disabled} aria-current={worldAvailable && currentPoint === point ? 'location' : undefined} onClick={() => activate(point)}>
            <span><strong>{names[point]}</strong><small>{disabled ? 'Entrar al taller primero' : worldAvailable ? 'Ir al destino' : room ? 'Leer caso' : 'Leer información'}</small></span>
            {worldAvailable ? <MapPin size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
          </button>;
        })}
      </nav>
    </div>
  </div>;
}
