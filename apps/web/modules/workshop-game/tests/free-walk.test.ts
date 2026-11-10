import { describe, expect, it } from 'vitest';
import { COLLISION } from '../lab-collision';
import { canStand, nearestFree, slide, spotInView } from '../free-walk';

/** Walks the whole room in fine steps, in every direction, and checks nobody ends up inside something. */
describe('free walk', () => {
  it('has a closed room: nothing outside the walls can be stood on', () => {
    expect(canStand(0, 1)).toBe(true);
    for (const [x, z] of [[-4.1, 0], [4.1, 0], [0, 6.2], [0, -5], [9, 9]] as const) expect(canStand(x, z)).toBe(false);
  });

  it('never lets a straight run cross a wall or a piece of furniture', () => {
    for (const angle of [0, .6, 1.2, 2, 3, 4, 5, 5.8]) {
      let [x, z] = nearestFree(0, 1);
      for (let i = 0; i < 2000; i++) {
        [x, z] = slide(x, z, Math.cos(angle) * .02, Math.sin(angle) * .02);
        expect(canStand(x, z)).toBe(true);
      }
    }
  });

  it('slides along a wall instead of stopping dead', () => {
    let [x, z] = nearestFree(0, 1);
    const start = z;
    for (let i = 0; i < 400; i++) [x, z] = slide(x, z, .02, -.02);
    expect(x).toBeGreaterThan(.5);
    expect(z).toBeLessThan(start);
  });

  it('finds a place to stand from over the furniture', () => {
    const [x, z] = nearestFree(COLLISION.x0 + 1.5, -3);
    expect(canStand(x, z)).toBe(true);
  });

  it('picks the spot ahead and within reach', () => {
    const spots = [{ at: [0, 1, -2] as const, item: 'near' }, { at: [0, 1, -2.5] as const, item: 'far' }, { at: [2, 1, 0] as const, item: 'side' }];
    expect(spotInView(spots, 0, 0, 0, -1)).toBe('near');
    expect(spotInView(spots, 0, 0, 1, 0)).toBe('side');
    expect(spotInView(spots, 0, 0, 0, 1)).toBeNull();
    expect(spotInView(spots, 0, 9, 0, -1)).toBeNull();
  });

  it('selects the gallery picture actually aimed at over a nearby generic stop', () => {
    const spots = [
      { at: [3.55, 1.6, -3] as const, item: 'contact' },
      { at: [3.75, 2.45, -2.4] as const, item: 'projects' },
      { at: [3.88, 2.03, -2.96] as const, item: 'lorigine', surface: { width: .7, height: .44, rotationY: Math.PI * 1.5 } },
      { at: [3.88, 2.03, -2.14] as const, item: 'academy', surface: { width: .7, height: .44, rotationY: Math.PI * 1.5 } },
    ];
    expect(spotInView(spots, 2, -2.96, 1, 0, .43 / 1.88)).toBe('lorigine');
    expect(spotInView(spots, 2, -2.96, 1, .82 / 1.88, .43 / 1.88)).toBe('academy');
    expect(spotInView(spots, 2, -2.96, 1, 0, 0)).toBe('contact');
  });

  it('does not select a gallery picture outside reach or from behind its wall', () => {
    const spots = [{ at: [3.88, 2.03, -2.96] as const, item: 'lorigine', surface: { width: .7, height: .44, rotationY: Math.PI * 1.5 } }];
    expect(spotInView(spots, 0, -2.96, 1, 0, .43 / 3.88)).toBeNull();
    expect(spotInView(spots, 4.1, -2.96, -1, 0, .43 / .22)).toBeNull();
  });

});
