'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import type { WorkshopReading } from './reading';
import { cornerProject, type WorldPoint } from './world-state';
import { stationForPoint } from './stations';
import { localePath } from '../../i18n/config';
import { fill } from '../../i18n/format';
import { useDictionary, useLocale } from '../../i18n/locale-provider';
import { placeNames } from './place-names';
import styles from './workshop-reader.module.css';
import { useContent } from '../../data/content/content';
export interface WorldMapProps {
  currentPoint: WorldPoint;
  worldAvailable: boolean;
  onRead: (reading: WorkshopReading) => void;
  onGo: (point: Exclude<WorldPoint, 'entrance'>) => void;
  onOpenCase: (id: string) => void;
}
type Destination = Exclude<WorldPoint, 'entrance' | `corner-${string}`>;
const destinations: Destination[] = ['hub', 'projects', 'technologies', 'trajectory', 'contact'];
/** Top-down plan of the lab: open front at the bottom, pegboard left, screens right, whiteboard at the back. */
const markers: Record<Destination, [number, number]> = {
  hub: [280, 300], projects: [470, 185], technologies: [90, 185], trajectory: [280, 62], contact: [455, 260],
};

export function WorldMap({ currentPoint: reached, worldAvailable, onRead, onGo, onOpenCase }: WorldMapProps) {
  const locale = useLocale();
  const { workshop } = useDictionary();
  const t = workshop.map;
  const names = placeNames(workshop);
  const publicProjects = useContent().projects.filter(project => project.public);
  // A project corner shows as the projects place on the plan.
  const currentPoint: Exclude<WorldPoint, `corner-${string}`> = cornerProject(reached) ? 'projects' : reached as Exclude<WorldPoint, `corner-${string}`>;
  const read = (point: Destination) => {
    const station = stationForPoint(point);
    if (station === 'technologies') onRead({ kind: 'technologies', technologyId: 'nextjs' });
    else if (station) onRead({ kind: station });
  };
  // Without the 3D world every wall is still readable: stations open their reading, projects their case.
  const available = worldAvailable ? destinations : destinations.filter(point => stationForPoint(point));
  return <div>
    <p className={styles.mapIntro}>{worldAvailable ? t.introWorld : t.introReading}</p>
    <div className={styles.mapLayout}>
      <figure className={styles.mapFigure}>
        <svg viewBox="0 0 560 400" role="img" aria-label={t.plan}>
          <path d="M60 352V30H500V352" fill="#eef1ea" stroke="#78917d" strokeWidth="3" />
          <rect x="66" y="120" width="18" height="140" fill="#b8c6b0" />
          <rect x="476" y="110" width="18" height="150" fill="#9fc2cf" />
          <rect x="220" y="36" width="120" height="12" fill="#b8c6b0" />
          <rect x="400" y="215" width="70" height="95" rx="3" fill="#c5b495" stroke="#a49477" />
          <rect x="128" y="140" width="45" height="80" rx="3" fill="#c5b495" stroke="#a49477" />
          <path d="M60 352H500" stroke="#315749" strokeWidth="2" strokeDasharray="6 6" />
          <text x="280" y="378" textAnchor="middle" fill="#52624f" fontSize="12">{names.entrance}</text>
          {available.map(point => {
            const [x, y] = markers[point];
            const active = worldAvailable && currentPoint === point;
            return <g key={point}>
              <circle cx={x} cy={y} r={active ? 7 : 4} fill={active ? '#315749' : '#bc9b63'} stroke={active ? '#f4f5eb' : '#937a4f'} strokeWidth="1.5" />
              <text x={x} y={y + 20} textAnchor="middle" fill="#293c30" fontSize="11">{names[point]}</text>
            </g>;
          })}
        </svg>
        <figcaption>{worldAvailable && currentPoint !== 'entrance' ? fill(t.youAreIn, { name: names[currentPoint] }) : t.selectDestination}</figcaption>
      </figure>
      <nav className={styles.mapDestinations} aria-label={t.destinations}>
        {available.map(point => <button key={point} type="button" aria-current={worldAvailable && currentPoint === point ? 'location' : undefined} onClick={() => (worldAvailable ? onGo(point) : read(point))}>
          <span><strong>{names[point]}</strong><small>{worldAvailable ? t.go : t.read}</small></span>
          {worldAvailable ? <MapPin size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
        </button>)}
        {!worldAvailable && publicProjects.map(project => <button key={project.id} type="button" onClick={() => onOpenCase(project.id)}>
          <span><strong>{project.name}</strong><small>{t.readCase}</small></span><ArrowUpRight size={16} aria-hidden="true" />
        </button>)}
      </nav>
    </div>
    <a className={styles.creditsLink} href={localePath(locale, '/creditos')}>{workshop.credits}</a>
  </div>;
}
