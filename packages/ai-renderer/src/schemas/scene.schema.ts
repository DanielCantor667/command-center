import { z } from 'zod';
import { sceneObjectSchema } from './scene-object.schema';

const sceneMetadataSchema = z.object({
  name: z.string().optional(),
  createdAt: z.string().optional(),
});

export const sceneSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  metadata: sceneMetadataSchema.default({}),
  objects: z.array(sceneObjectSchema),
});

export type Scene = z.infer<typeof sceneSchema>;
