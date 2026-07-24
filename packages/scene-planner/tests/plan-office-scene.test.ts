import { describe, expect, it } from 'vitest';
import { planOfficeScene } from '../src';

describe('planOfficeScene', () => {
  it('creates an editable office scene for a small team', () => {
    const plan = planOfficeScene({ occupants: 8 });
    expect(plan.presetId).toBe('small_office');
    expect(plan.scene.objects.filter((object) => object.asset === 'desk')).toHaveLength(8);
    expect(plan.scene.objects.some((object) => object.asset === 'reception')).toBe(true);
  });

  it('adds planning-dependent spaces for a large office', () => {
    const plan = planOfficeScene({ occupants: 60, style: 'scandinavian' });
    expect(plan.presetId).toBe('large_office');
    expect(plan.style).toBe('scandinavian');
    expect(plan.scene.objects.some((object) => object.id === 'cafeteria')).toBe(true);
    expect(plan.scene.objects.filter((object) => object.id.startsWith('meeting-room-'))).toHaveLength(5);
  });

  it('rejects invalid headcount', () => {
    expect(() => planOfficeScene({ occupants: 0 })).toThrow('occupants must be a positive integer');
  });
});
