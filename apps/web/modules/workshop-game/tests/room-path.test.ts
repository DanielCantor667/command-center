import { expect, it } from 'vitest';
import { WORLD_VIEWS } from '../world-state';
import { cameraPath } from '../world-path';
it('walks between every room and central point through door openings and clear corridors', () => {
  const points = ['hub', 'workbench', 'kliniu', 'lorigine', 'academy', 'drokex', 'technologies', 'trajectory', 'contact'] as const;
  for (const a of points) for (const b of points) {
    if (a === b) continue;
    const path = [WORLD_VIEWS[a].position, ...cameraPath(WORLD_VIEWS[a].position, WORLD_VIEWS[b].position)];
    for (let i = 1; i < path.length; i++) for (let s = 0; s <= 200; s++) {
      const t = s / 200, from = path[i - 1]!, to = path[i]!;
      const x = from[0] + (to[0] - from[0]) * t, z = from[2] + (to[2] - from[2]) * t;
      const crossingRearWall = Math.abs(z + 3) < .06 && ((x > -9.35 && x < -1.05) || (x > 1.05 && x < 7.35));
      const rearDoor = Math.abs(x + 5.1) < 1.05 || Math.abs(x - 4.8) < 1.05;
      const crossingSidePortal = Math.abs(Math.abs(x) - 4) < .06 && z > 4.2 && z < 7.65;
      const frontDoor = Math.abs(z - 5.7) < 1.05;
      const crossingFrontRoomBack = Math.abs(z - 4.2) < .06 && Math.abs(x) > 4.06;
      expect(Math.abs(x) < 2.8 && z > -2.3 && z < .7, `${a}→${b}: bench at ${x},${z}`).toBe(false);
      expect(crossingRearWall && !rearDoor, `${a}→${b}: rear wall at ${x},${z}`).toBe(false);
      expect(crossingSidePortal && !frontDoor, `${a}→${b}: side wall at ${x},${z}`).toBe(false);
      expect(crossingFrontRoomBack, `${a}→${b}: front room back wall at ${x},${z}`).toBe(false);
      expect(x > -9.4 && x < -8.6 && z > .4 && z < 2.8, `${a}→${b}: technical wall at ${x},${z}`).toBe(false);
      expect(x > -9 && x < -7.2 && z > -2.92 && z < -2.38, `${a}→${b}: archive at ${x},${z}`).toBe(false);
      expect(x > 5.6 && x < 7.8 && z > 1 && z < 1.9, `${a}→${b}: contact desk at ${x},${z}`).toBe(false);
      expect(x > -8.97 && x < -8.45 && z > -.73 && z < .52, `${a}→${b}: cabinet at ${x},${z}`).toBe(false);
    }
  }
});
