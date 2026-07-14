import { describe, expect, it } from 'vitest';
import { planningPresetSchema, PLANNING_PRESETS, getPlanningPreset, listPlanningPresets } from '../src/planning-presets';

describe('planning presets', () => {
  it('is schema-conformant for every preset', () => {
    for (const preset of PLANNING_PRESETS) {
      expect(() => planningPresetSchema.parse(preset)).not.toThrow();
    }
  });

  it('has exactly 4 presets: small_office, medium_office, large_office, enterprise', () => {
    expect(listPlanningPresets().map((preset) => preset.id).sort()).toEqual(
      ['enterprise', 'large_office', 'medium_office', 'small_office'].sort(),
    );
  });

  it('covers headcount 1 to infinity with no gaps or overlaps', () => {
    const sorted = [...PLANNING_PRESETS].sort((a, b) => a.minOccupants - b.minOccupants);
    expect(sorted[0].minOccupants).toBe(1);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].minOccupants).toBe((sorted[i - 1].maxOccupants ?? Infinity) + 1);
    }
    expect(sorted[sorted.length - 1].maxOccupants).toBeNull();
  });

  it('finds a preset by id', () => {
    expect(getPlanningPreset('small_office')?.label).toBe('Small Office');
    expect(getPlanningPreset('does_not_exist')).toBeUndefined();
  });
});
