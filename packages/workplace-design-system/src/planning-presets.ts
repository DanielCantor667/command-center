import { z } from 'zod';
import { MODULE_IDS, STYLE_IDS } from './constants';

export const planningPresetSchema = z.object({
  id: z.string(),
  label: z.string(),
  minOccupants: z.number(),
  maxOccupants: z.number().nullable(),
  recommendedModules: z.array(z.enum(MODULE_IDS)),
  targetStyle: z.enum(STYLE_IDS).optional(),
});

export type PlanningPreset = z.infer<typeof planningPresetSchema>;

export const PLANNING_PRESETS: PlanningPreset[] = [
  {
    id: 'small_office',
    label: 'Small Office',
    minOccupants: 1,
    maxOccupants: 10,
    recommendedModules: ['reception', 'waiting_area', 'open_workspace', 'meeting_room', 'break_room'],
    targetStyle: 'tech_startup',
  },
  {
    id: 'medium_office',
    label: 'Medium Office',
    minOccupants: 11,
    maxOccupants: 40,
    recommendedModules: [
      'reception',
      'waiting_area',
      'open_workspace',
      'meeting_room',
      'break_room',
      'phone_booth',
      'print_area',
      'private_office',
    ],
    targetStyle: 'corporate_standard',
  },
  {
    id: 'large_office',
    label: 'Large Office',
    minOccupants: 41,
    maxOccupants: 120,
    recommendedModules: [
      'reception',
      'waiting_area',
      'open_workspace',
      'meeting_room',
      'break_room',
      'phone_booth',
      'print_area',
      'private_office',
      'collaboration_area',
      'cafeteria',
      'server_room',
      'storage',
    ],
    targetStyle: 'corporate_standard',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    minOccupants: 121,
    maxOccupants: null,
    recommendedModules: [
      'reception',
      'waiting_area',
      'open_workspace',
      'meeting_room',
      'break_room',
      'phone_booth',
      'print_area',
      'private_office',
      'collaboration_area',
      'cafeteria',
      'server_room',
      'storage',
      'executive_office',
      'training_room',
    ],
    targetStyle: 'executive_premium',
  },
];

export function getPlanningPreset(id: string): PlanningPreset | undefined {
  return PLANNING_PRESETS.find((preset) => preset.id === id);
}

export function listPlanningPresets(): PlanningPreset[] {
  return PLANNING_PRESETS;
}
