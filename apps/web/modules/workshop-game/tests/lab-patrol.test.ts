import { describe, expect, it } from 'vitest';
import { patrolAt, type Patrol } from '../lab-patrol';

const square: Patrol = { points: [[0, 0], [2, 0], [2, 2], [0, 2]], speed: 1, loop: true, turn: 0 };
const there: Patrol = { points: [[0, 0], [4, 0]], speed: 1, loop: false, turn: 0 };

describe('patrolAt', () => {
  it('walks a loop and closes it', () => {
    expect(patrolAt(square, 1)).toMatchObject({ x: 1, z: 0 });
    expect(patrolAt(square, 3)).toMatchObject({ x: 2, z: 1 });
    expect(patrolAt(square, 8)).toMatchObject({ x: 0, z: 0 }); // full lap (perimeter 8)
  });
  it('turns round at the end of an open route', () => {
    expect(patrolAt(there, 4)).toMatchObject({ x: 4, z: 0 });
    expect(patrolAt(there, 6)).toMatchObject({ x: 2, z: 0 });
    expect(patrolAt(there, 6).heading).toBeCloseTo(-Math.PI / 2); // heading -x on the way back
  });
  it('heads along +x as yaw pi/2 and applies the model turn', () => {
    expect(patrolAt(square, .5).heading).toBeCloseTo(Math.PI / 2);
    expect(patrolAt({ ...square, turn: Math.PI }, .5).heading).toBeCloseTo(Math.PI * 1.5);
  });
});
