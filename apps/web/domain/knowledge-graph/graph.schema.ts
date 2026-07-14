import { z } from 'zod';

import { EDGE_TYPE, NODE_TYPE } from './graph.types';

export const nodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(NODE_TYPE),
    label: z.string().min(1),
    metadata: z.record(z.string(), z.unknown()),
  })
  .readonly();

export const edgeSchema = z
  .object({
    source: z.string().min(1),
    target: z.string().min(1),
    type: z.enum(EDGE_TYPE),
    weight: z.number().positive(),
    metadata: z.record(z.string(), z.unknown()),
  })
  .readonly();

export const knowledgeGraphSchema = z
  .object({
    nodes: z.array(nodeSchema).readonly(),
    edges: z.array(edgeSchema).readonly(),
  })
  .readonly();
