'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial, type Texture } from 'three';
import { PORTFOLIO_CAREER } from '../../data/portfolio-career';
import { PROJECTS } from '../../data/projects';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import { ambient } from './ambient';
import { DomScreen } from './dom-screens';
import { LAB_ANCHORS, type LabAnchor } from './lab-anchors';
import { PROJECT_CAPTURES } from './lab';
import { STATIONS } from './stations';
import styles from './workshop-game.module.css';

/** Focus states shared by screens and plates: lit (the focus or related), dimmed (unrelated), idle. */
export type Highlight = 'lit' | 'dim' | 'idle';
// Linear values: .15 reads as about 40 % on screen. Lit plates go above 1 to catch the bloom.
export const HIGHLIGHT_LEVEL: Record<Highlight, number> = { lit: 1.15, dim: .15, idle: 1 };
/** Eases towards a level; under reduced motion (no ambient clock) it jumps straight there. */
export const ease = (from: number, to: number, delta: number) => ambient.enabled ? from + (to - from) * (1 - Math.exp(-8 * delta)) : to;

export const pointer = (on: boolean) => () => { document.body.style.cursor = on ? 'pointer' : ''; };

export function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d')!);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace; texture.anisotropy = 8;
  return texture;
}

function fitFont(g: CanvasRenderingContext2D, text: string, maxWidth: number, size: number, family: string) {
  g.font = `600 ${size}px ${family}`;
  while (size > 10 && g.measureText(text).width > maxWidth) { size -= 1; g.font = `600 ${size}px ${family}`; }
}

export function labelTexture(text: string, colour: string) {
  return canvasTexture(512, 88, g => {
    g.fillStyle = '#0d1417'; g.fillRect(0, 0, 512, 88);
    g.fillStyle = colour; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitFont(g, text, 488, 46, 'ui-monospace, Menlo, monospace');
    g.fillText(text, 256, 46);
  });
}

const select = (onSelect: () => void) => ({
  onClick: (event: { stopPropagation: () => void; delta: number }) => { event.stopPropagation(); if (event.delta < 5) onSelect(); },
  onPointerOver: pointer(true), onPointerOut: pointer(false),
});

const SCREEN_PROJECTS = PROJECTS.filter(project => project.public && LAB_ANCHORS[`screen_${project.id}`]);

/** A project screen (HTML): eases between lit, dimmed and idle; a cyan frame (bloom) rings it when lit. */
function Screen({ anchor, label, name, capture, labelMap, highlight, onSelect, onHover }: {
  anchor: LabAnchor; label?: LabAnchor; name: string; capture?: string; labelMap: Texture; highlight: Highlight; onSelect: () => void; onHover: (on: boolean) => void;
}) {
  const caption = useRef<MeshBasicMaterial>(null), frame = useRef<MeshBasicMaterial>(null);
  const level = useRef(1), glow = useRef(0);
  useFrame((_, delta) => {
    level.current = ease(level.current, HIGHLIGHT_LEVEL[highlight], delta);
    glow.current = ease(glow.current, highlight === 'lit' ? 1 : 0, delta);
    caption.current?.color.setScalar(Math.min(1, level.current));
    if (frame.current) { frame.current.opacity = glow.current; frame.current.visible = glow.current > .01; }
  });
  const events = {
    onClick: (event: { stopPropagation: () => void; delta: number }) => { event.stopPropagation(); if (event.delta < 5) onSelect(); },
    onPointerOver: () => { pointer(true)(); onHover(true); },
    onPointerOut: () => { pointer(false)(); onHover(false); },
  };
  return <>
    <group position={anchor.position} rotation={[0, anchor.rotationY, 0]}>
      <mesh position={[0, 0, -.004]} raycast={() => {}}>
        <planeGeometry args={[anchor.size[0] + .06, anchor.size[1] + .06]} />
        <meshBasicMaterial ref={frame} color={[.6, 2.4, 3]} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
    {/* Captures are mostly white: they never go above 1 (no bloom); the cyan frame marks the lit screen. */}
    <DomScreen anchor={anchor} width={1024} brightness={level} {...events}>
      {/* eslint-disable-next-line @next/next/no-img-element -- plain DOM inside the 3D layer, outside Next's image pipeline */}
      {capture ? <img className={styles.screenCapture} src={capture} alt="" /> : <div className={styles.screenName}>{name}<small>sin captura publicada</small></div>}
    </DomScreen>
    {label && <mesh position={label.position} rotation={[0, label.rotationY, 0]} {...events}>
      <planeGeometry args={label.size} /><meshBasicMaterial ref={caption} map={labelMap} toneMapped={false} />
    </mesh>}
  </>;
}

/** One screen per public project, on the wall above the desk. */
export function ProjectWall({ lit, focused, onSelect, onHover }: {
  lit: Set<string>; focused: boolean; onSelect: (projectId: string) => void; onHover: (projectId: string | null) => void;
}) {
  const labels = useMemo(() => new Map(SCREEN_PROJECTS.map(project => [project.id, labelTexture(project.name, '#e6f2f4')])), []);
  return <>{SCREEN_PROJECTS.map(project => {
    return <Screen key={project.id} anchor={LAB_ANCHORS[`screen_${project.id}`]!} label={LAB_ANCHORS[`label_${project.id}`]}
      name={project.name} capture={PROJECT_CAPTURES[project.id]} labelMap={labels.get(project.id)!} highlight={lit.has(project.id) ? 'lit' : focused ? 'dim' : 'idle'}
      onSelect={() => onSelect(project.id)} onHover={on => onHover(on ? project.id : null)} />;
  })}</>;
}

const CORNER_PROJECTS = PROJECTS.filter(project => project.public && LAB_ANCHORS[`zone_${project.id}`]);

/** A project corner (front half): its sign, a cyan floor glow when lit, and the whole footprint as the hit area. */
function Corner({ zone, sign, name, highlight, onSelect, onHover }: {
  zone: LabAnchor; sign?: LabAnchor; name: string; highlight: Highlight; onSelect: () => void; onHover: (on: boolean) => void;
}) {
  const caption = useRef<MeshBasicMaterial>(null), floor = useRef<MeshBasicMaterial>(null);
  const level = useRef(1), glow = useRef(0);
  const map = useMemo(() => labelTexture(name, '#e6f2f4'), [name]);
  useFrame((_, delta) => {
    level.current = ease(level.current, HIGHLIGHT_LEVEL[highlight], delta);
    glow.current = ease(glow.current, highlight === 'lit' ? .35 : 0, delta);
    caption.current?.color.setScalar(Math.min(1, level.current));
    if (floor.current) { floor.current.opacity = glow.current; floor.current.visible = glow.current > .01; }
  });
  // Zones are floor quads: size is [x extent, z extent].
  const [x, , z] = zone.position;
  return <>
    <mesh position={[x, .85, z]} onClick={event => { event.stopPropagation(); if (event.delta < 5) onSelect(); }}
      onPointerOver={() => { pointer(true)(); onHover(true); }} onPointerOut={() => { pointer(false)(); onHover(false); }}>
      <boxGeometry args={[zone.size[0], 1.7, zone.size[1]]} /><meshBasicMaterial visible={false} />
    </mesh>
    <mesh position={[x, zone.position[1] + .01, z]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => {}}>
      <planeGeometry args={zone.size} />
      <meshBasicMaterial ref={floor} color={[.3, 1.6, 2]} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
    {sign && <mesh position={sign.position} rotation={[0, sign.rotationY, 0]} raycast={() => {}}>
      <planeGeometry args={sign.size} /><meshBasicMaterial ref={caption} map={map} toneMapped={false} />
    </mesh>}
  </>;
}

/** The project corners that keep each client's identity (piano, cleaning shelf, barber chair, export pallet). */
export function ProjectCorners({ lit, focused, onSelect, onHover }: {
  lit: Set<string>; focused: boolean; onSelect: (projectId: string) => void; onHover: (projectId: string | null) => void;
}) {
  return <>{CORNER_PROJECTS.map(project => <Corner key={project.id} zone={LAB_ANCHORS[`zone_${project.id}`]!} sign={LAB_ANCHORS[`sign_${project.id}`]}
    name={project.name} highlight={lit.has(project.id) ? 'lit' : focused ? 'dim' : 'idle'}
    onSelect={() => onSelect(project.id)} onHover={on => onHover(on ? project.id : null)} />)}</>;
}

/** The ultrawide on the desk: the real availability note and public profile links (no invented email). */
const MONITOR: LabAnchor = { position: [3.818, 1.18, -3.0], rotationY: -Math.PI / 2, size: [1.1, .46] };
export function ContactMonitor({ onSelect }: { onSelect: () => void }) {
  return <DomScreen anchor={MONITOR} width={1100} className={styles.monitor} {...select(onSelect)}>
    <h2>Conversemos</h2>
    <p>{PUBLIC_PROFILE.availability}</p>
    <span>{PUBLIC_PROFILE.github.replace('https://', '')}</span>
    <span>{PUBLIC_PROFILE.linkedin.replace('https://www.', '')}</span>
    <span>$ clic para usar la PC_</span>
  </DomScreen>;
}

/** Trayectoria board: the career entries from the profile data, so the board reads without opening the panel. */
export function Whiteboard({ onSelect }: { onSelect: () => void }) {
  const anchor = LAB_ANCHORS.whiteboard;
  const column = (title: string, items: readonly { period: string; title: string; organization: string }[]) => <section>
    <h3>{title}</h3>
    <ol>{items.map(item => <li key={`${item.period}${item.title}`}><span>{item.period}</span><b>{item.title}</b><span>{item.organization}</span></li>)}</ol>
  </section>;
  return anchor ? <DomScreen anchor={anchor} width={1200} className={styles.whiteboard} {...select(onSelect)}>
    <h2>Trayectoria</h2>
    <p>{STATIONS.trajectory.description}</p>
    <div>{column('Experiencia', PORTFOLIO_CAREER.experience)}{column('Formación', PORTFOLIO_CAREER.education)}</div>
  </DomScreen> : null;
}
