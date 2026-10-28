import { expect, it } from 'vitest';
import { WORLD_VIEWS, type WorldPoint } from '../world-state';

const ROOM = { x: 4, back: -4.9, front: 6.1 };
const inside = ([x, , z]: [number, number, number]) => Math.abs(x) < ROOM.x && z > ROOM.back && z < ROOM.front;

it('provides camera destinations for every point of the tour, all inside the lab', () => {
  for (const id of Object.keys(WORLD_VIEWS) as WorldPoint[]) {
    expect(WORLD_VIEWS[id]).toBeDefined();
    expect(inside(WORLD_VIEWS[id].position)).toBe(true);
  }
});
it('aims each close-up at its wall: pegboard left, screens right, whiteboard at the back', () => {
  expect(WORLD_VIEWS.technologies.target[0]).toBeLessThan(-3.8);
  expect(WORLD_VIEWS.projects.target[0]).toBeGreaterThan(3.8);
  expect(WORLD_VIEWS.trajectory.target[2]).toBeLessThan(-4.8);
});
