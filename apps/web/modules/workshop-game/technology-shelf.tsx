'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, SRGBColorSpace } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PORTFOLIO_TECHNOLOGIES, TECHNOLOGY_CATEGORIES } from '../../data/portfolio-technologies';
import { TECHNOLOGY_ICON_PATHS } from '../../data/technology-icons';
import { LAB_ANCHORS } from './lab-anchors';
import { ease, HIGHLIGHT_LEVEL, labelTexture, pointer } from './lab-content';
import type { WorldPoint } from './world-state';

/**
 * The Tecnologías board: one plate per real technology, one row per category.
 * Plates carry the Simple Icons mark when one is stored locally and typographic
 * initials otherwise (the same rule as the HTML explorer; no invented logos).
 */
const COLS = 8;
const ROWS = TECHNOLOGY_CATEGORIES.length;
/** Lab pegboard (left wall), matching the baked plate backs from blender/prototype_workshop_room_v2.py. */
const PITCH = .19;
const TILE = .165;
const DEPTH = .02;
const FRONT_X = -3.912;
const TOP_Y = 2.45;
const FIRST_Z = -1.95;
const CELL = 128;

export interface ShelfTile { id: string; col: number; row: number }
export function shelfLayout(): ShelfTile[] {
  return TECHNOLOGY_CATEGORIES.flatMap((category, row) =>
    PORTFOLIO_TECHNOLOGIES.filter(entry => entry.category === category.id).slice(0, COLS).map((entry, col) => ({ id: entry.id, col, row })));
}
const centre = (tile: ShelfTile) => ({ y: TOP_Y - tile.row * PITCH, z: FIRST_Z - tile.col * PITCH });
/** Face centre of a technology's plate (the board faces +X), or null when it is not on the board. */
export function plateCentre(technologyId: string): [number, number, number] | null {
  const tile = shelfLayout().find(item => item.id === technologyId);
  if (!tile) return null;
  const { y, z } = centre(tile);
  return [FRONT_X, y, z];
}

function drawAtlas(tiles: ShelfTile[]) {
  const canvas = document.createElement('canvas');
  canvas.width = COLS * CELL; canvas.height = ROWS * CELL;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#11181b'; g.fillRect(0, 0, canvas.width, canvas.height);
  for (const tile of tiles) {
    const entry = PORTFOLIO_TECHNOLOGIES.find(item => item.id === tile.id)!;
    const x = tile.col * CELL; const y = tile.row * CELL;
    g.fillStyle = '#11181b'; g.fillRect(x, y, CELL, CELL);
    g.strokeStyle = '#2b3a3f'; g.lineWidth = 3; g.strokeRect(x + 4, y + 4, CELL - 8, CELL - 16);
    g.fillStyle = entry.color; g.fillRect(x, y + CELL - 8, CELL, 8);
    const paths = TECHNOLOGY_ICON_PATHS[entry.icon];
    g.fillStyle = entry.color;
    if (paths?.length) {
      g.save(); g.translate(x + CELL / 2 - 30, y + 14); g.scale(60 / 24, 60 / 24);
      paths.forEach(d => g.fill(new Path2D(d)));
      g.restore();
    } else {
      g.font = '700 40px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(entry.shortName, x + CELL / 2, y + 46);
    }
    g.fillStyle = '#e6f2f4'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    let size = 17; g.font = `600 ${size}px system-ui, sans-serif`;
    while (g.measureText(entry.name).width > CELL - 14 && size > 10) { size -= 1; g.font = `600 ${size}px system-ui, sans-serif`; }
    g.fillText(entry.name, x + CELL / 2, y + CELL - 20);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace; texture.anisotropy = 8;
  return texture;
}

function buildGeometry(tiles: ShelfTile[]) {
  const position: number[] = []; const uv: number[] = []; const normal: number[] = []; const index: number[] = [];
  const bodies: BoxGeometry[] = [];
  tiles.forEach((tile, i) => {
    const { y, z } = centre(tile);
    const h = TILE / 2;
    // Facing +X; screen-right is -Z, so u grows toward -Z.
    position.push(FRONT_X, y - h, z + h, FRONT_X, y - h, z - h, FRONT_X, y + h, z - h, FRONT_X, y + h, z + h);
    const u0 = tile.col / COLS; const u1 = (tile.col + 1) / COLS;
    const v1 = 1 - tile.row / ROWS; const v0 = 1 - (tile.row + 1) / ROWS;
    uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
    normal.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
    bodies.push(new BoxGeometry(DEPTH, TILE, TILE).translate(FRONT_X - DEPTH / 2, y, z));
  });
  const front = new BufferGeometry();
  front.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
  front.setAttribute('normal', new BufferAttribute(new Float32Array(normal), 3));
  front.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  // Per-plate brightness for the focus highlight (four vertices per plate).
  front.setAttribute('color', new BufferAttribute(new Float32Array(tiles.length * 12).fill(1), 3));
  front.setIndex(index);
  const body = mergeGeometries(bodies, false)!;
  bodies.forEach(geometry => geometry.dispose());
  return { front, body };
}

/**
 * Away from the board a click walks up to it; at the board it opens the technology.
 * Hovering a plate focuses it; a focus lights the related plates and dims the rest.
 */
export function TechnologyShelf({ point, lit, focused, onGo, onSelect, onHover }: {
  point: WorldPoint; lit: Set<string>; focused: boolean; onGo: (point: WorldPoint) => void; onSelect: (technologyId: string) => void; onHover: (technologyId: string | null) => void;
}) {
  const { tiles, texture, front, body, labels } = useMemo(() => {
    const tiles = shelfLayout();
    const labels = TECHNOLOGY_CATEGORIES.map(category => ({ id: category.id, anchor: LAB_ANCHORS[`cat_${category.id}`], map: labelTexture(category.label, '#7fd8e6') }));
    return { tiles, texture: drawAtlas(tiles), labels, ...buildGeometry(tiles) };
  }, []);
  const tileAt = (faceIndex?: number | null) => tiles[Math.floor((faceIndex ?? 0) / 2)];
  const choose = (faceIndex?: number | null) => {
    if (point !== 'technologies') { onGo('technologies'); return; }
    const tile = tileAt(faceIndex);
    if (tile) onSelect(tile.id);
  };
  const hovered = useRef<string | null>(null);
  const levels = useRef(new Float32Array(tiles.length).fill(1));
  useFrame((_, delta) => {
    const colour = front.getAttribute('color') as BufferAttribute;
    let changed = false;
    tiles.forEach((tile, i) => {
      const goal = HIGHLIGHT_LEVEL[lit.has(tile.id) ? 'lit' : focused ? 'dim' : 'idle'];
      const next = ease(levels.current[i]!, goal, delta);
      if (Math.abs(next - levels.current[i]!) < 1e-4) return;
      levels.current[i] = next; changed = true;
      for (let v = 0; v < 4; v++) colour.setXYZ(i * 4 + v, next, next, next);
    });
    if (changed) colour.needsUpdate = true;
  });
  return <group>
    <mesh geometry={body}><meshBasicMaterial color="#0c0e10" /></mesh>
    <mesh geometry={front}
      onClick={event => { event.stopPropagation(); if (event.delta < 5) choose(event.faceIndex); }}
      onPointerOver={pointer(true)}
      onPointerMove={event => { const id = tileAt(event.faceIndex)?.id ?? null; if (id !== hovered.current) { hovered.current = id; onHover(id); } }}
      onPointerOut={() => { pointer(false)(); hovered.current = null; onHover(null); }}>
      <meshBasicMaterial map={texture} vertexColors toneMapped={false} />
    </mesh>
    {labels.map(({ id, anchor, map }) => anchor && <mesh key={id} position={anchor.position} rotation={[0, anchor.rotationY, 0]}>
      <planeGeometry args={anchor.size} /><meshBasicMaterial map={map} toneMapped={false} />
    </mesh>)}
  </group>;
}
