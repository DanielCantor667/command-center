import { z } from 'zod';
import { MODULE_IDS, type ModuleId } from './constants';

export const moduleRelationSchema = z.object({
  id: z.enum(MODULE_IDS),
  adjacentTo: z.array(z.enum(MODULE_IDS)),
  avoidAdjacentTo: z.array(z.enum(MODULE_IDS)),
});

export type ModuleRelation = z.infer<typeof moduleRelationSchema>;

export const MODULE_RELATIONS: Record<ModuleId, ModuleRelation> = {
  reception: { id: 'reception', adjacentTo: ['waiting_area'], avoidAdjacentTo: ['server_room', 'storage'] },
  waiting_area: { id: 'waiting_area', adjacentTo: ['reception', 'open_workspace'], avoidAdjacentTo: ['server_room'] },
  open_workspace: {
    id: 'open_workspace',
    adjacentTo: ['waiting_area', 'collaboration_area', 'meeting_room', 'print_area'],
    avoidAdjacentTo: ['server_room'],
  },
  private_office: { id: 'private_office', adjacentTo: ['open_workspace'], avoidAdjacentTo: ['cafeteria', 'break_room'] },
  meeting_room: {
    id: 'meeting_room',
    adjacentTo: ['open_workspace', 'collaboration_area'],
    avoidAdjacentTo: ['server_room', 'storage'],
  },
  phone_booth: { id: 'phone_booth', adjacentTo: ['open_workspace', 'collaboration_area'], avoidAdjacentTo: [] },
  collaboration_area: {
    id: 'collaboration_area',
    adjacentTo: ['open_workspace', 'meeting_room'],
    avoidAdjacentTo: ['server_room'],
  },
  cafeteria: {
    id: 'cafeteria',
    adjacentTo: ['break_room'],
    avoidAdjacentTo: ['server_room', 'private_office', 'executive_office'],
  },
  break_room: {
    id: 'break_room',
    adjacentTo: ['cafeteria', 'open_workspace'],
    avoidAdjacentTo: ['server_room', 'executive_office'],
  },
  print_area: { id: 'print_area', adjacentTo: ['open_workspace'], avoidAdjacentTo: ['cafeteria'] },
  server_room: {
    id: 'server_room',
    adjacentTo: ['storage'],
    avoidAdjacentTo: ['break_room', 'meeting_room', 'cafeteria', 'reception', 'waiting_area'],
  },
  storage: { id: 'storage', adjacentTo: ['server_room', 'print_area'], avoidAdjacentTo: ['reception', 'executive_office'] },
  executive_office: {
    id: 'executive_office',
    adjacentTo: ['private_office'],
    avoidAdjacentTo: ['server_room', 'storage', 'print_area', 'cafeteria'],
  },
  training_room: { id: 'training_room', adjacentTo: ['collaboration_area'], avoidAdjacentTo: ['server_room'] },
};

export function getModuleRelations(id: ModuleId): ModuleRelation {
  return MODULE_RELATIONS[id];
}

export function listModuleRelations(): ModuleRelation[] {
  return Object.values(MODULE_RELATIONS);
}
