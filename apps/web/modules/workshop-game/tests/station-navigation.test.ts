import { expect, it } from 'vitest';
import { WORLD_VIEWS, type WorldPoint } from '../world-state';

const ROOM = { x: 3, back: -4.9, front: 3 };
const inside = ([x, , z]: [number, number, number]) => Math.abs(x) < ROOM.x && z > ROOM.back && z < ROOM.front;

it('provides camera destinations for every point of the tour, all inside the lab', () => {
  for (const id of ['hub', 'projects', 'technologies', 'trajectory', 'contact'] as WorldPoint[]) {
    expect(WORLD_VIEWS[id]).toBeDefined();
    expect(inside(WORLD_VIEWS[id].position)).toBe(true);
  }
});
it('aims each close-up at its wall: pegboard left, screens right, whiteboard at the back', () => {
  expect(WORLD_VIEWS.technologies.target[0]).toBeLessThan(-2.8);
  expect(WORLD_VIEWS.projects.target[0]).toBeGreaterThan(2.8);
  expect(WORLD_VIEWS.trajectory.target[2]).toBeLessThan(-4.8);
});
