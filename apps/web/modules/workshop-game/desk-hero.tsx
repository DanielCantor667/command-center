'use client';
import { Html, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { SRGBColorSpace } from 'three';
import { ROOM_IDS, WORKSHOP_ROOMS } from './rooms';
import type { WorldPoint } from './world-state';
import { OptionalBoundary } from './workshop-props';
import styles from './workshop-game.module.css';

/**
 * Sprint 11.2: the work desk as the protagonist. The monitor cycles the real project
 * captures (the same evidence the rooms show); the laptop and notebook lead to the stations.
 */
const MONITOR: [number, number, number] = [.55, 1, -1.35];
const NOTEBOOK: [number, number, number] = [-1.15, 1, .05];
const LAPTOP: [number, number, number] = [1.0, 1.32, .15];
const SCREEN = [1.28, .8] as const;

function Monitor({ labelled, reducedMotion, onGo }: { labelled: boolean; reducedMotion: boolean; onGo: (point: WorldPoint) => void }) {
  const textures = useTexture(ROOM_IDS.map(id => WORKSHOP_ROOMS[id].evidence));
  const { invalidate } = useThree();
  const [index, setIndex] = useState(0);
  useEffect(() => { textures.forEach(t => { t.colorSpace = SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; }); invalidate(); }, [textures, invalidate]);
  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => { setIndex(value => (value + 1) % ROOM_IDS.length); invalidate(); }, 4000);
    return () => clearInterval(timer);
  }, [reducedMotion, invalidate]);
  const room = ROOM_IDS[index]!;
  return <group position={MONITOR} onPointerOver={pointer(true)} onPointerOut={pointer(false)} onClick={event => { event.stopPropagation(); if (event.delta < 5) onGo(room); }}>
    <mesh position={[0, .01, 0]} castShadow receiveShadow><boxGeometry args={[.28, .02, .18]} /><meshStandardMaterial color="#2a302d" roughness={.5} metalness={.4} /></mesh>
    <mesh position={[0, .2, -.02]} castShadow><boxGeometry args={[.05, .4, .03]} /><meshStandardMaterial color="#2a302d" roughness={.5} metalness={.4} /></mesh>
    <mesh position={[0, .62, 0]} castShadow><boxGeometry args={[SCREEN[0] + .04, SCREEN[1] + .04, .03]} /><meshStandardMaterial color="#1c211f" roughness={.4} /></mesh>
    <mesh position={[0, .62, .016]}><planeGeometry args={SCREEN} /><meshBasicMaterial map={textures[index]} toneMapped={false} /></mesh>
    {labelled && <Html position={[0, 1.15, 0]} center><button type="button" className={styles.hotspot} onClick={() => onGo(room)}>Proyecto: {WORKSHOP_ROOMS[room].name}</button></Html>}
  </group>;
}

function Notebook({ onGo }: { onGo: (point: WorldPoint) => void }) {
  return <group position={NOTEBOOK} rotation={[0, .35, 0]} onPointerOver={pointer(true)} onPointerOut={pointer(false)} onClick={event => { event.stopPropagation(); if (event.delta < 5) onGo('contact'); }}>
    <mesh position={[0, .009, 0]} castShadow receiveShadow><boxGeometry args={[.21, .018, .28]} /><meshStandardMaterial color="#2f5d4a" roughness={.85} /></mesh>
    <mesh position={[.02, .019, 0]}><boxGeometry args={[.17, .002, .26]} /><meshStandardMaterial color="#efe9da" roughness={.95} /></mesh>
    <mesh position={[.06, .022, .02]} rotation={[0, .5, Math.PI / 2]} castShadow><cylinderGeometry args={[.005, .005, .15, 8]} /><meshStandardMaterial color="#c49a52" metalness={.6} roughness={.35} /></mesh>
  </group>;
}

const TURNTABLE: [number, number, number] = [-.5, 1, -.05];
const LABELS: { point: WorldPoint; text: string; at: [number, number, number] }[] = [
  { point: 'trajectory', text: 'Trayectoria', at: LAPTOP },
  { point: 'contact', text: 'Contacto', at: [NOTEBOOK[0], 1.2, NOTEBOOK[2]] },
];
const pointer = (on: boolean) => () => { document.body.style.cursor = on ? 'pointer' : ''; };
/** Invisible box over a prop so the whole object is a target (props come from GLBs without names). */
function Hit({ at, size, onSelect }: { at: [number, number, number]; size: [number, number, number]; onSelect: () => void }) {
  return <mesh position={[at[0], at[1] + size[1] / 2, at[2]]} onPointerOver={pointer(true)} onPointerOut={pointer(false)} onClick={event => { event.stopPropagation(); if (event.delta < 5) onSelect(); }}>
    <boxGeometry args={size} /><meshBasicMaterial visible={false} />
  </mesh>;
}

export function DeskHero({ point, reducedMotion, sound, onGo, onSound }: { point: WorldPoint; reducedMotion: boolean; sound: boolean; onGo: (point: WorldPoint) => void; onSound: () => void }) {
  useEffect(() => () => { document.body.style.cursor = ''; }, []);
  return <OptionalBoundary>
    <Suspense fallback={null}><Monitor labelled={point === 'workbench'} reducedMotion={reducedMotion} onGo={onGo} /></Suspense>
    <Notebook onGo={onGo} />
    <Hit at={[1.0, 1, .15]} size={[.4, .26, .3]} onSelect={() => onGo('trajectory')} />
    <Hit at={TURNTABLE} size={[.36, .2, .3]} onSelect={onSound} />
    {/* Labels only at the desk, like the door labels only in the hub. */}
    {point === 'workbench' && LABELS.map(label => <Html key={label.text} position={label.at} center>
      <button type="button" className={styles.hotspot} onClick={() => onGo(label.point)}>{label.text}</button>
    </Html>)}
    {point === 'workbench' && <Html position={[TURNTABLE[0], 1.3, TURNTABLE[2]]} center>
      <button type="button" className={styles.hotspot} aria-pressed={sound} onClick={onSound}>{sound ? 'Pausar música' : 'Poner música'}</button>
    </Html>}
  </OptionalBoundary>;
}
