import type { WorldPoint } from './world-state';
export function workshopHitAt({ x, y, z }: { x: number; y: number; z: number }): WorldPoint | null {
  if (y < .65 || y > 2.5) return null;
  if (x >= -2.5 && x <= 2.5 && z >= -2 && z <= .5) return 'workbench';
  if (x >= -7.1 && x <= -3.2 && z >= -5.9 && z <= -4.5) return 'kliniu';
  return null;
}
