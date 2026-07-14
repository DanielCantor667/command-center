export const MODULE_IDS = [
  'reception',
  'waiting_area',
  'open_workspace',
  'private_office',
  'meeting_room',
  'phone_booth',
  'collaboration_area',
  'cafeteria',
  'break_room',
  'print_area',
  'server_room',
  'storage',
  'executive_office',
  'training_room',
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const MODULE_CATEGORIES = ['arrival', 'work', 'meeting', 'support', 'amenity'] as const;
export type ModuleCategory = (typeof MODULE_CATEGORIES)[number];

export const MODULE_PRIORITIES = ['required', 'optional'] as const;
export type ModulePriority = (typeof MODULE_PRIORITIES)[number];

export const MATERIAL_FAMILIES = ['floor', 'wall', 'furniture', 'fabric'] as const;
export type MaterialFamily = (typeof MATERIAL_FAMILIES)[number];

export const MATERIAL_IDS = [
  'concrete',
  'wood',
  'carpet',
  'stone',
  'white_paint',
  'gray_paint',
  'wood_panels',
  'glass',
  'oak',
  'walnut',
  'black_metal',
  'white_metal',
  'gray',
  'blue',
  'green',
  'black',
] as const;
export type MaterialId = (typeof MATERIAL_IDS)[number];

export const MATERIAL_FINISHES = ['matte', 'glossy', 'textured'] as const;
export type MaterialFinish = (typeof MATERIAL_FINISHES)[number];

export const STYLE_IDS = [
  'corporate_standard',
  'tech_startup',
  'executive_premium',
  'minimal',
  'scandinavian',
  'creative_studio',
] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export const SPACE_DENSITIES = ['low', 'medium', 'high'] as const;
export type SpaceDensity = (typeof SPACE_DENSITIES)[number];
