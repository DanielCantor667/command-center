import { describe, expect, it } from 'vitest';
import { ASSET_IDS } from '../src/constants/asset-catalog';
import { getAssetMetadata, listAssets, listAssetsByCategory } from '../src/assets/asset-registry';
import { resolveModelUrl, resolveThumbnailUrl } from '../src/assets/asset-loader';
import { assetMetadataSchema } from '../src/schemas/asset-metadata.schema';

describe('asset registry', () => {
  it('has metadata for every asset id', () => {
    for (const id of ASSET_IDS) {
      expect(() => assetMetadataSchema.parse(getAssetMetadata(id))).not.toThrow();
    }
  });

  it('lists all assets', () => {
    expect(listAssets()).toHaveLength(ASSET_IDS.length);
  });

  it('filters assets by category', () => {
    const furniture = listAssetsByCategory('furniture');
    expect(furniture.length).toBeGreaterThan(0);
    expect(furniture.every((asset) => asset.category === 'furniture')).toBe(true);
  });

  it('resolves model and thumbnail urls from the registry', () => {
    expect(resolveModelUrl('desk')).toBe(getAssetMetadata('desk').modelPath);
    expect(resolveThumbnailUrl('desk')).toBe(getAssetMetadata('desk').thumbnailPath);
  });
});
