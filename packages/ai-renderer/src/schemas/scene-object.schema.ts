import { z } from 'zod';
import { ASSET_IDS } from '../constants/asset-catalog';
import { transformSchema } from './transform.schema';

export const sceneObjectSchema = z.object({
  id: z.string(),
  asset: z.enum(ASSET_IDS),
  transform: transformSchema.default({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
  }),
  properties: z.object({}).default({}),
});

export type SceneObject = z.infer<typeof sceneObjectSchema>;
