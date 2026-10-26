'use client';
import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';
import { PROJECTS } from '../../data/projects';
import { LAB_ANCHORS, type LabAnchor } from './lab-anchors';
import { PROJECT_CAPTURES } from './lab';
import { STATIONS } from './stations';

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

/** One screen per public project, on the wall above the desk. */
export function ProjectWall({ onSelect }: { onSelect: (projectId: string) => void }) {
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
    const label = LAB_ANCHORS[`label_${project.id}`];
    return <group key={project.id}>
      <Plane anchor={LAB_ANCHORS[`screen_${project.id}`]!} map={textures.screen} onSelect={() => onSelect(project.id)} />
      {label && <Plane anchor={label} map={textures.label} onSelect={() => onSelect(project.id)} />}
    </group>;
  })}</>;
}

/** Trayectoria board: the station's own description; the timeline marks are decoration, not data. */
export function Whiteboard({ onSelect }: { onSelect: () => void }) {
  const anchor = LAB_ANCHORS.whiteboard;
  const map = useMemo(() => canvasTexture(1200, 800, g => {
    g.fillStyle = '#e9ece8'; g.fillRect(0, 0, 1200, 800);
    g.fillStyle = '#1b2a30'; g.font = '600 96px system-ui, sans-serif'; g.fillText('Trayectoria', 60, 150);
    g.fillStyle = '#36525a'; g.font = '500 40px system-ui, sans-serif'; g.fillText(STATIONS.trajectory.description, 64, 230);
    g.fillStyle = '#1b2a30'; g.fillRect(80, 517, 1040, 6);
    [140, 380, 620, 860, 1100].forEach((x, i) => { g.fillStyle = i % 2 ? '#e06a3a' : '#2fa8c0'; g.beginPath(); g.arc(x, 520, 18, 0, Math.PI * 2); g.fill(); });
    [[150, 600, '#ffe27a'], [420, 360, '#9fe3ef'], [690, 600, '#ffc0a8'], [960, 360, '#c8f2a6']].forEach(([x, y, c]) => { g.fillStyle = c as string; g.fillRect(x as number, y as number, 170, 120); });
  }), []);
  return anchor ? <Plane anchor={anchor} map={map} onSelect={onSelect} /> : null;
}
