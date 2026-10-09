import { describe, expect, it } from 'vitest';
import { cameraPath } from '../world-path';

describe('camera path around the bench', () => {
  it.each([
    [[.8, 1.65, 2.3], [-5.1, 1.65, -1.9]],
    [[-5.1, 1.65, -1.9], [.8, 1.65, 2.3]],
  ] as const)('keeps the walk between %j and %j outside the central workbench', (from, to) => {
    const path: [number, number, number][] = [[...from], ...cameraPath([...from], [...to])];
    for (let i = 1; i < path.length; i++) {
      for (let sample = 0; sample <= 100; sample++) {
        const previous = path[i - 1]!;
        const next = path[i]!;
        const t = sample / 100;
        const x = previous[0] + (next[0] - previous[0]) * t;
        const z = previous[2] + (next[2] - previous[2]) * t;
        expect(Math.abs(x) < 2.8 && z > -2.3 && z < .7, `inside the workbench at ${x},${z}`).toBe(false);
      }
    }
  });
});
