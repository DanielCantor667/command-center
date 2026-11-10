import { COLLISION } from './lab-collision';

/** R.5 (specs/workshop-realism.md): movement rules of the free walk, on the grid of blender/export_collision.py. */
export const EYE_HEIGHT = 1.6;
const RADIUS = .25;
const SPAWN: [number, number] = [0, 1];

/** What the devices are asking for right now; the keyboard, the mouse and the touch pad write here. */
export const walkInput = { forward: 0, strafe: 0, yaw: 0, pitch: 0 };

function blocked(x: number, z: number) {
  const row = COLLISION.rows[Math.floor((COLLISION.zFront - z) / COLLISION.cell)];
  return row?.[Math.floor((x - COLLISION.x0) / COLLISION.cell)] !== '.';
}

/** Eight points around the body: walls and furniture are thicker than the gaps between them. */
export function canStand(x: number, z: number) {
  if (blocked(x, z)) return false;
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    if (blocked(x + Math.cos(angle) * RADIUS, z + Math.sin(angle) * RADIUS)) return false;
  }
  return true;
}

/** One axis at a time, so a diagonal into a wall slides along it. */
export function slide(x: number, z: number, dx: number, dz: number): [number, number] {
  const nextX = canStand(x + dx, z) ? x + dx : x;
  return [nextX, canStand(nextX, z + dz) ? z + dz : z];
}

/** The closest place to stand: the guided cameras may float over furniture. */
export function nearestFree(x: number, z: number): [number, number] {
  for (let ring = 0; ring < 30; ring++) {
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8, px = x + Math.cos(angle) * ring * .2, pz = z + Math.sin(angle) * ring * .2;
      if (canStand(px, pz)) return [px, pz];
    }
  }
  return SPAWN;
}

export interface WalkSpot<T> { at: readonly [number, number, number]; item: T; surface?: { width: number; height: number; rotationY: number } }
const REACH = 2.6, CONE = Math.cos(Math.PI / 5);
/** Aimed screens take precedence; other stops retain their original proximity-based selection. */
export function spotInView<T>(spots: readonly WalkSpot<T>[], x: number, z: number, forwardX: number, forwardZ: number, forwardY = 0): T | null {
  const length = Math.hypot(forwardX, forwardZ) || 1;
  let best: T | null = null, bestDistance = REACH;
  let screen: T | null = null, screenDistance = REACH;
  for (const { at, item, surface } of spots) {
    const dx = at[0] - x, dz = at[2] - z;
    if (surface) {
      const normalX = Math.sin(surface.rotationY), normalZ = Math.cos(surface.rotationY);
      const toward = forwardX * normalX + forwardZ * normalZ;
      if (toward >= -1e-6) continue;
      const t = (dx * normalX + dz * normalZ) / toward;
      const distance = t * length;
      if (t <= 0 || distance >= screenDistance) continue;
      const hitX = x + t * forwardX - at[0], hitZ = z + t * forwardZ - at[2];
      const across = hitX * Math.cos(surface.rotationY) - hitZ * Math.sin(surface.rotationY);
      const height = EYE_HEIGHT + t * forwardY - at[1];
      if (Math.abs(across) <= surface.width / 2 && Math.abs(height) <= surface.height / 2) { screen = item; screenDistance = distance; }
      continue;
    }
    const distance = Math.hypot(dx, dz);
    if (distance < bestDistance && (dx * forwardX + dz * forwardZ) / (distance * length || 1) > CONE) { best = item; bestDistance = distance; }
  }
  return screen ?? best;
}
