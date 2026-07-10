import { z } from 'zod';
import { vector3Schema } from './vector3.schema';

export const transformSchema = z.object({
  position: vector3Schema.default({ x: 0, y: 0, z: 0 }),
  rotation: vector3Schema.default({ x: 0, y: 0, z: 0 }),
  scale: z.number().default(1),
});

export type Transform = z.infer<typeof transformSchema>;
