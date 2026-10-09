'use client';
import { Html } from '@react-three/drei';
import type { Object3D } from 'three';
import { STATIONS, stationForPoint } from './stations';
import type { WorldPoint } from './world-state';
import styles from './workshop-game.module.css';
export function StationGeometry({ model, point, onGo }: { model: Object3D; point: WorldPoint; onGo: (point: WorldPoint) => void }) {
  return <group onClick={event => {
    event.stopPropagation();
    if (event.delta >= 5) return;
    const id = event.object.name.startsWith('stationhit__') ? stationForPoint(event.object.name.slice(12)) : null;
    if (id) onGo(id);
  }}>
    <primitive object={model} dispose={null} />
    {Object.values(STATIONS).filter(station => station.id !== point).map(station => <Html key={station.id} position={station.hotspot} occlude center distanceFactor={4}>
      <button type="button" className={styles.hotspot} onClick={() => onGo(station.id)}>Ir a {station.name}</button>
    </Html>)}
  </group>;
}
