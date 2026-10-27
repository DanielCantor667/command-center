'use client';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial, type Texture } from 'three';
import { PORTFOLIO_CAREER } from '../../data/portfolio-career';
import { PROJECTS } from '../../data/projects';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import { ambient } from './ambient';
import { LAB_ANCHORS, type LabAnchor } from './lab-anchors';
import { PROJECT_CAPTURES } from './lab';
import { STATIONS } from './stations';

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

function nameScreen(name: string) {
  return canvasTexture(1024, 640, g => {
    g.fillStyle = '#071317'; g.fillRect(0, 0, 1024, 640);
    g.strokeStyle = '#0b1d22';
    for (let y = 0; y < 640; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#2fe6ff'; fitFont(g, name, 900, 110, 'ui-monospace, Menlo, monospace'); g.fillText(name, 512, 300);
    g.fillStyle = '#4f7f88'; g.font = '500 34px ui-monospace, Menlo, monospace'; g.fillText('sin captura publicada', 512, 410);
  });
}

/** Crop a capture like CSS object-fit: cover, anchored to the top of the page. */
function cover(texture: Texture, aspect: number) {
  const image = texture.image as { width: number; height: number };
  const ratio = image.width / image.height;
  if (ratio < aspect) { texture.repeat.set(1, ratio / aspect); texture.offset.set(0, 1 - ratio / aspect); }
  else { texture.repeat.set(aspect / ratio, 1); texture.offset.set((1 - aspect / ratio) / 2, 0); }
  texture.colorSpace = SRGBColorSpace; texture.anisotropy = 8; texture.needsUpdate = true;
  return texture;
}

function Plane({ anchor, map, onSelect }: { anchor: LabAnchor; map: Texture; onSelect?: () => void }) {
  return <mesh position={anchor.position} rotation={[0, anchor.rotationY, 0]}
    onClick={onSelect && (event => { event.stopPropagation(); if (event.delta < 5) onSelect(); })}
    onPointerOver={onSelect && pointer(true)} onPointerOut={onSelect && pointer(false)}>
    <planeGeometry args={anchor.size} /><meshBasicMaterial map={map} toneMapped={false} />
  </mesh>;
}

const SCREEN_PROJECTS = PROJECTS.filter(project => project.public && LAB_ANCHORS[`screen_${project.id}`]);

/** A project screen: eases between lit, dimmed and idle; a cyan frame (bloom) rings it when lit. */
function Screen({ anchor, label, map, labelMap, highlight, onSelect, onHover }: {
  anchor: LabAnchor; label?: LabAnchor; map: Texture; labelMap: Texture; highlight: Highlight; onSelect: () => void; onHover: (on: boolean) => void;
}) {
  const screen = useRef<MeshBasicMaterial>(null), caption = useRef<MeshBasicMaterial>(null), frame = useRef<MeshBasicMaterial>(null);
  const level = useRef(1), glow = useRef(0);
  useFrame((_, delta) => {
    level.current = ease(level.current, HIGHLIGHT_LEVEL[highlight], delta);
    glow.current = ease(glow.current, highlight === 'lit' ? 1 : 0, delta);
    // Captures are mostly white: above 1 they would bloom out; the cyan frame marks the lit screen.
    screen.current?.color.setScalar(Math.min(1, level.current));
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
      <mesh {...events}><planeGeometry args={anchor.size} /><meshBasicMaterial ref={screen} map={map} toneMapped={false} /></mesh>
    </group>
    {label && <mesh position={label.position} rotation={[0, label.rotationY, 0]} {...events}>
      <planeGeometry args={label.size} /><meshBasicMaterial ref={caption} map={labelMap} toneMapped={false} />
    </mesh>}
  </>;
}

/** One screen per public project, on the wall above the desk. */
export function ProjectWall({ lit, focused, onSelect, onHover }: {
  lit: Set<string>; focused: boolean; onSelect: (projectId: string) => void; onHover: (projectId: string | null) => void;
}) {
  const captured = SCREEN_PROJECTS.filter(project => PROJECT_CAPTURES[project.id]);
  const captures = useTexture(captured.map(project => PROJECT_CAPTURES[project.id]!));
  const maps = useMemo(() => new Map(SCREEN_PROJECTS.map(project => {
    const anchor = LAB_ANCHORS[`screen_${project.id}`]!;
    const index = captured.indexOf(project);
    return [project.id, {
      screen: index >= 0 ? cover(captures[index]!, anchor.size[0] / anchor.size[1]) : nameScreen(project.name),
      label: labelTexture(project.name, '#e6f2f4'),
    }];
  // eslint-disable-next-line react-hooks/exhaustive-deps -- projects are static data; captures settle once
  })), [captures]);
  return <>{SCREEN_PROJECTS.map(project => {
    const textures = maps.get(project.id)!;
    return <Screen key={project.id} anchor={LAB_ANCHORS[`screen_${project.id}`]!} label={LAB_ANCHORS[`label_${project.id}`]}
      map={textures.screen} labelMap={textures.label} highlight={lit.has(project.id) ? 'lit' : focused ? 'dim' : 'idle'}
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
    <mesh position={[x, .02, z]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => {}}>
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

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = '';
  for (const word of text.split(' ')) {
    if (line && g.measureText(`${line} ${word}`).width > maxWidth) { g.fillText(line, x, y); y += lineHeight; line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  g.fillText(line, x, y);
}

/** The ultrawide on the desk: the real availability note and public profile links (no invented email). */
const MONITOR = { position: [2.818, 1.18, -3.0] as [number, number, number], rotationY: -Math.PI / 2, size: [1.1, .46] as [number, number] };
export function ContactMonitor({ onSelect }: { onSelect: () => void }) {
  const map = useMemo(() => canvasTexture(1100, 460, g => {
    const sky = g.createLinearGradient(0, 0, 1100, 460);
    sky.addColorStop(0, '#1c1240'); sky.addColorStop(1, '#3a1d6e');
    g.fillStyle = sky; g.fillRect(0, 0, 1100, 460);
    g.fillStyle = '#ffffff'; g.font = '600 76px system-ui, sans-serif'; g.fillText('Conversemos', 60, 120);
    g.fillStyle = '#cdbff5'; g.font = '400 30px system-ui, sans-serif'; wrap(g, PUBLIC_PROFILE.availability, 62, 185, 960, 40);
    g.fillStyle = '#2fe6ff'; g.font = '500 28px ui-monospace, Menlo, monospace';
    g.fillText(PUBLIC_PROFILE.github.replace('https://', ''), 62, 360);
    g.fillText(PUBLIC_PROFILE.linkedin.replace('https://www.', ''), 62, 405);
  }), []);
  return <Plane anchor={MONITOR} map={map} onSelect={onSelect} />;
}

/** Trayectoria board: the career entries from the profile data, so the board reads without opening the panel. */
export function Whiteboard({ onSelect }: { onSelect: () => void }) {
  const anchor = LAB_ANCHORS.whiteboard;
  const map = useMemo(() => canvasTexture(1200, 800, g => {
    g.fillStyle = '#e9ece8'; g.fillRect(0, 0, 1200, 800);
    g.fillStyle = '#1b2a30'; g.font = '600 84px system-ui, sans-serif'; g.fillText('Trayectoria', 60, 120);
    g.fillStyle = '#36525a'; g.font = '500 34px system-ui, sans-serif'; g.fillText(STATIONS.trajectory.description, 64, 180);
    const column = (title: string, x: number, items: readonly { period: string; title: string; organization: string }[]) => {
      g.fillStyle = '#e06a3a'; g.font = '700 32px system-ui, sans-serif'; g.fillText(title.toUpperCase(), x, 270);
      g.fillStyle = '#2fa8c0'; g.fillRect(x, 288, 6, items.length * 190 - 30);
      items.forEach((item, i) => {
        const y = 330 + i * 190;
        g.fillStyle = '#36525a'; g.font = '500 28px ui-monospace, Menlo, monospace'; g.fillText(item.period, x + 28, y);
        g.fillStyle = '#1b2a30'; g.font = '600 38px system-ui, sans-serif'; wrap(g, item.title, x + 28, y + 46, 500, 42);
        g.fillStyle = '#36525a'; g.font = '400 28px system-ui, sans-serif'; g.fillText(item.organization, x + 28, y + 140);
      });
    };
    column('Experiencia', 60, PORTFOLIO_CAREER.experience);
    column('Formación', 650, PORTFOLIO_CAREER.education);
  }), []);
  return anchor ? <Plane anchor={anchor} map={map} onSelect={onSelect} /> : null;
}
