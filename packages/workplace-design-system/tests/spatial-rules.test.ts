import { describe, expect, it } from 'vitest';
import { spatialRulesSchema, SPATIAL_RULES } from '../src/spatial-rules';

describe('spatial rules', () => {
  it('is schema-conformant', () => {
    expect(() => spatialRulesSchema.parse(SPATIAL_RULES)).not.toThrow();
  });

  it('has strictly increasing meeting room tiers by area', () => {
    const { small, medium, large } = SPATIAL_RULES.meeting;
    expect(small.minAreaSqm).toBeLessThan(medium.minAreaSqm);
    expect(medium.minAreaSqm).toBeLessThan(large.minAreaSqm);
  });

  it('has all six rule groups', () => {
    expect(Object.keys(SPATIAL_RULES).sort()).toEqual(
      ['accessibility', 'circulation', 'furniture', 'meeting', 'planning', 'safety'].sort(),
    );
  });
});
