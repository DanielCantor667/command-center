import { describe, expect, it } from 'vitest';
import {
  MODULE_IDS,
  MODULE_CATEGORIES,
  MODULE_PRIORITIES,
  MATERIAL_FAMILIES,
  MATERIAL_IDS,
  MATERIAL_FINISHES,
  STYLE_IDS,
  SPACE_DENSITIES,
} from '../src/constants';

describe('constants', () => {
  it('has exactly 14 unique module ids', () => {
    expect(MODULE_IDS).toHaveLength(14);
    expect(new Set(MODULE_IDS).size).toBe(MODULE_IDS.length);
  });

  it('has exactly 16 unique material ids', () => {
    expect(MATERIAL_IDS).toHaveLength(16);
    expect(new Set(MATERIAL_IDS).size).toBe(MATERIAL_IDS.length);
  });

  it('has exactly 6 unique style ids', () => {
    expect(STYLE_IDS).toHaveLength(6);
    expect(new Set(STYLE_IDS).size).toBe(STYLE_IDS.length);
  });

  it('has 5 module categories, 2 module priorities, 4 material families, 3 material finishes, 3 space densities', () => {
    expect(MODULE_CATEGORIES).toHaveLength(5);
    expect(MODULE_PRIORITIES).toHaveLength(2);
    expect(MATERIAL_FAMILIES).toHaveLength(4);
    expect(MATERIAL_FINISHES).toHaveLength(3);
    expect(SPACE_DENSITIES).toHaveLength(3);
  });
});
