import { describe, expect, it } from 'vitest';
import {
  MODULE_IDS,
  getModule,
  listModules,
  getModuleRelations,
  listModuleRelations,
  getStyle,
  listStyles,
  getMaterial,
  listMaterials,
  getCompatibleStyles,
  SPATIAL_RULES,
  getPlanningPreset,
  listPlanningPresets,
} from '../src/index';

describe('public API', () => {
  it('exposes every registry accessor through the barrel', () => {
    expect(listModules()).toHaveLength(MODULE_IDS.length);
    expect(getModule('reception').label).toBe('Reception');
    expect(getModuleRelations('reception').adjacentTo).toContain('waiting_area');
    expect(listModuleRelations().length).toBeGreaterThan(0);
    expect(getStyle('minimal').spaceDensity).toBe('low');
    expect(listStyles().length).toBe(6);
    expect(getMaterial('oak').family).toBe('furniture');
    expect(listMaterials().length).toBe(16);
    expect(getCompatibleStyles('walnut')).toContain('executive_premium');
    expect(SPATIAL_RULES.circulation.mainCorridorWidthM).toBe(1.5);
    expect(getPlanningPreset('enterprise')?.maxOccupants).toBeNull();
    expect(listPlanningPresets().length).toBe(4);
  });
});
