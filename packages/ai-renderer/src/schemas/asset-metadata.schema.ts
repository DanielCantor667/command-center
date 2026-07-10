import { z } from 'zod';
import { ASSET_IDS } from '../constants/asset-catalog';

export const assetCategorySchema = z.enum(['furniture', 'building', 'vehicle', 'nature', 'people']);

export const assetMetadataSchema = z.object({
  id: z.enum(ASSET_IDS),
  label: z.string(),
  category: assetCategorySchema,
  modelPath: z.string(),
  thumbnailPath: z.string(),
  tags: z.array(z.string()).default([]),
});

export type AssetCategory = z.infer<typeof assetCategorySchema>;
export type AssetMetadata = z.infer<typeof assetMetadataSchema>;
