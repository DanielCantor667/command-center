import { describe, expect, it } from 'vitest';
import { getAssetColor } from '../lib/asset-color';

describe('getAssetColor', () => {
  it('returns a color for every asset category', () => {
    expect(getAssetColor('furniture')).toMatch(/^#[0-9a-f]{6}$/);
    expect(getAssetColor('building')).toMatch(/^#[0-9a-f]{6}$/);
    expect(getAssetColor('vehicle')).toMatch(/^#[0-9a-f]{6}$/);
    expect(getAssetColor('nature')).toMatch(/^#[0-9a-f]{6}$/);
    expect(getAssetColor('people')).toMatch(/^#[0-9a-f]{6}$/);
  });
});
