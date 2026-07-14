import { describe, expect, it } from 'vitest';
import { MATERIAL_IDS } from '../src/constants';
import { materialSchema, getMaterial, listMaterials, getCompatibleStyles } from '../src/materials';
import { listStyles } from '../src/styles';

describe('materials', () => {
  it('has a valid, schema-conformant entry for every material id', () => {
    for (const id of MATERIAL_IDS) {
      expect(() => materialSchema.parse(getMaterial(id))).not.toThrow();
    }
  });

  it('lists all 16 materials', () => {
    expect(listMaterials()).toHaveLength(MATERIAL_IDS.length);
  });

  it('derives style compatibility from every style palette, with no drift', () => {
    for (const style of listStyles()) {
      for (const materialId of Object.values(style.materialPalette)) {
        expect(getCompatibleStyles(materialId)).toContain(style.id);
      }
    }
  });

  it('returns an empty list for a material no style palette references', () => {
    // stone is not used in any of the 6 v1 style palettes
    expect(getCompatibleStyles('stone')).toEqual([]);
  });
});
