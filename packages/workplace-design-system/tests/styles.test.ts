import { describe, expect, it } from 'vitest';
import { STYLE_IDS } from '../src/constants';
import { styleSchema, getStyle, listStyles } from '../src/styles';

describe('styles', () => {
  it('has a valid, schema-conformant entry for every style id', () => {
    for (const id of STYLE_IDS) {
      expect(() => styleSchema.parse(getStyle(id))).not.toThrow();
    }
  });

  it('lists all 6 styles', () => {
    expect(listStyles()).toHaveLength(STYLE_IDS.length);
  });

  it('gives tech_startup a high space density and executive_premium a low one', () => {
    expect(getStyle('tech_startup').spaceDensity).toBe('high');
    expect(getStyle('executive_premium').spaceDensity).toBe('low');
  });
});
