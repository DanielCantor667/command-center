'use client';
import { useMemo } from 'react';
import { BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, SRGBColorSpace } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PORTFOLIO_TECHNOLOGIES, TECHNOLOGY_CATEGORIES } from '../../data/portfolio-technologies';
import { TECHNOLOGY_ICON_PATHS } from '../../data/technology-icons';

/**
 * The Tecnologías board: one plate per real technology, one row per category.
 * Plates carry the Simple Icons mark when one is stored locally and typographic
 * initials otherwise (the same rule as the HTML explorer; no invented logos).
 */
const COLS = 8;
const ROWS = TECHNOLOGY_CATEGORIES.length;
const PITCH = .205;
const TILE = .18;
const DEPTH = .04;
const FRONT_X = -8.99;
const TOP_Y = 1.93;
const FIRST_Z = 2.27;
const CELL = 128;

export interface ShelfTile { id: string; col: number; row: number }
export function shelfLayout(): ShelfTile[] {
  return TECHNOLOGY_CATEGORIES.flatMap((category, row) =>
    PORTFOLIO_TECHNOLOGIES.filter(entry => entry.category === category.id).slice(0, COLS).map((entry, col) => ({ id: entry.id, col, row })));
}
const centre = (tile: ShelfTile) => ({ y: TOP_Y - tile.row * PITCH, z: FIRST_Z - tile.col * PITCH });

function drawAtlas(tiles: ShelfTile[]) {
  const canvas = document.createElement('canvas');
  canvas.width = COLS * CELL; canvas.height = ROWS * CELL;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#f1eee3'; g.fillRect(0, 0, canvas.width, canvas.height);
  for (const tile of tiles) {
    const entry = PORTFOLIO_TECHNOLOGIES.find(item => item.id === tile.id)!;
    const x = tile.col * CELL; const y = tile.row * CELL;
    g.fillStyle = '#f1eee3'; g.fillRect(x, y, CELL, CELL);
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
    g.fillStyle = '#273b30'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
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
  front.setIndex(index);
  const body = mergeGeometries(bodies, false)!;
  bodies.forEach(geometry => geometry.dispose());
  return { front, body };
}

export function TechnologyShelf({ onSelect }: { onSelect: (technologyId: string) => void }) {
  const { tiles, texture, front, body } = useMemo(() => {
    const tiles = shelfLayout();
    return { tiles, texture: drawAtlas(tiles), ...buildGeometry(tiles) };
  }, []);
  const choose = (faceIndex?: number | null) => {
    const tile = tiles[Math.floor((faceIndex ?? 0) / 2)];
    if (tile) onSelect(tile.id);
  };
  return <group>
    <mesh geometry={body} receiveShadow castShadow><meshStandardMaterial color="#e7e3d8" roughness={.85} /></mesh>
    <mesh geometry={front}
      onClick={event => { event.stopPropagation(); if (event.delta < 5) choose(event.faceIndex); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}>
      <meshStandardMaterial map={texture} roughness={.7} />
    </mesh>
  </group>;
}
