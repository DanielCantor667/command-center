'use client';
import { Html } from '@react-three/drei';
import type { Object3D } from 'three';
import { STATIONS, stationForPoint } from './stations';
import { TechnologyShelf } from './technology-shelf';
import type { WorldPoint } from './world-state';
import styles from './workshop-game.module.css';
export function StationGeometry({ model, point, onGo, onTechnology }: { model: Object3D; point: WorldPoint; onGo: (point: WorldPoint) => void; onTechnology?: (technologyId: string) => void }) {
  return <><group onClick={event => {
    event.stopPropagation();
    if (event.delta >= 5) return;
    const id = event.object.name.startsWith('stationhit__') ? stationForPoint(event.object.name.slice(12)) : null;
    if (id) onGo(id);
  }}>
    <primitive object={model} dispose={null} />
    {/* Same rule as the room doors: constant size, readable from the hub only. */}
    {point === 'hub' && Object.values(STATIONS).map(station => <Html key={station.id} position={station.hotspot} occlude center>
      <button type="button" className={styles.hotspot} onClick={() => onGo(station.id)}>Ir a {station.name}</button>
    </Html>)}
  </group>
  {/* Outside the clickable group above: it stops every click, which would swallow the plates. */}
  {onTechnology && <TechnologyShelf onSelect={onTechnology} />}
  </>;
}
