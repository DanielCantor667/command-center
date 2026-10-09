import { describe, expect, it } from 'vitest';
import { workshopHitAt } from '../workshop-hit';

describe('world object selection', () => {
  it('selects the actual bench and Kliniu monitor while leaving floor and facade alone', () => {
    expect(workshopHitAt({ x: -.85, y: 1.3, z: -.7 })).toBe('workbench');
    expect(workshopHitAt({ x: -5.1, y: 1.17, z: -5.35 })).toBe('kliniu');
    expect(workshopHitAt({ x: -.85, y: 0, z: -.7 })).toBeNull();
    expect(workshopHitAt({ x: 0, y: 1.65, z: 8 })).toBeNull();
    expect(workshopHitAt({ x: 8, y: 1.3, z: -.7 })).toBeNull();
  });
});
