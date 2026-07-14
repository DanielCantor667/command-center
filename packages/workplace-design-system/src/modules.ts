import { z } from 'zod';
import { MODULE_CATEGORIES, MODULE_IDS, MODULE_PRIORITIES, type ModuleId } from './constants';

export const moduleSchema = z
  .object({
    id: z.enum(MODULE_IDS),
    label: z.string(),
    category: z.enum(MODULE_CATEGORIES),
    priority: z.enum(MODULE_PRIORITIES),
    minAreaSqm: z.number().positive().optional(),
    areaPerOccupantSqm: z.number().positive().optional(),
    requiredAssets: z.array(z.string()),
  })
  .refine((module) => (module.minAreaSqm === undefined) !== (module.areaPerOccupantSqm === undefined), {
    message: 'exactly one of minAreaSqm or areaPerOccupantSqm must be set',
  });

export type Module = z.infer<typeof moduleSchema>;

export const MODULE_REGISTRY: Record<ModuleId, Module> = {
  reception: {
    id: 'reception',
    label: 'Reception',
    category: 'arrival',
    priority: 'required',
    minAreaSqm: 20,
    requiredAssets: ['reception_desk', 'logo_wall', 'sofa', 'side_table', 'planter', 'display_screen'],
  },
  waiting_area: {
    id: 'waiting_area',
    label: 'Waiting Area',
    category: 'arrival',
    priority: 'required',
    minAreaSqm: 15,
    requiredAssets: ['waiting_chair', 'side_table', 'planter', 'magazine_rack'],
  },
  open_workspace: {
    id: 'open_workspace',
    label: 'Open Workspace',
    category: 'work',
    priority: 'required',
    areaPerOccupantSqm: 6,
    requiredAssets: ['desk', 'office_chair', 'monitor', 'laptop_dock', 'waste_bin', 'planter'],
  },
  private_office: {
    id: 'private_office',
    label: 'Private Office',
    category: 'work',
    priority: 'optional',
    minAreaSqm: 10,
    requiredAssets: ['desk', 'office_chair', 'guest_chair', 'bookshelf', 'planter'],
  },
  meeting_room: {
    id: 'meeting_room',
    label: 'Meeting Room',
    category: 'meeting',
    priority: 'required',
    minAreaSqm: 8,
    requiredAssets: ['conference_table', 'meeting_chair', 'wall_tv', 'conference_camera', 'whiteboard', 'acoustic_panel'],
  },
  phone_booth: {
    id: 'phone_booth',
    label: 'Phone Booth',
    category: 'meeting',
    priority: 'optional',
    minAreaSqm: 2,
    requiredAssets: ['booth_stool', 'booth_desk', 'acoustic_panel'],
  },
  collaboration_area: {
    id: 'collaboration_area',
    label: 'Collaboration Area',
    category: 'work',
    priority: 'optional',
    minAreaSqm: 20,
    requiredAssets: ['lounge_seating', 'low_table', 'whiteboard', 'planter'],
  },
  cafeteria: {
    id: 'cafeteria',
    label: 'Cafeteria',
    category: 'amenity',
    priority: 'optional',
    areaPerOccupantSqm: 1.8,
    requiredAssets: ['dining_table', 'dining_chair', 'counter', 'vending_machine'],
  },
  break_room: {
    id: 'break_room',
    label: 'Break Room',
    category: 'amenity',
    priority: 'optional',
    minAreaSqm: 15,
    requiredAssets: ['kitchenette', 'dining_table', 'dining_chair', 'refrigerator', 'coffee_machine'],
  },
  print_area: {
    id: 'print_area',
    label: 'Print Area',
    category: 'support',
    priority: 'optional',
    minAreaSqm: 6,
    requiredAssets: ['printer', 'supply_cabinet', 'waste_bin'],
  },
  server_room: {
    id: 'server_room',
    label: 'Server Room',
    category: 'support',
    priority: 'optional',
    minAreaSqm: 10,
    requiredAssets: ['server_rack', 'cooling_unit', 'access_panel'],
  },
  storage: {
    id: 'storage',
    label: 'Storage',
    category: 'support',
    priority: 'optional',
    minAreaSqm: 10,
    requiredAssets: ['storage_shelving', 'storage_bin'],
  },
  executive_office: {
    id: 'executive_office',
    label: 'Executive Office',
    category: 'work',
    priority: 'optional',
    minAreaSqm: 20,
    requiredAssets: ['executive_desk', 'bookshelf', 'sofa', 'artwork', 'planter'],
  },
  training_room: {
    id: 'training_room',
    label: 'Training Room',
    category: 'meeting',
    priority: 'optional',
    areaPerOccupantSqm: 2,
    requiredAssets: ['training_table', 'training_chair', 'projector_screen', 'whiteboard'],
  },
};

export function getModule(id: ModuleId): Module {
  return MODULE_REGISTRY[id];
}

export function listModules(): Module[] {
  return Object.values(MODULE_REGISTRY);
}
