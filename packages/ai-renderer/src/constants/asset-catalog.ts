export const ASSET_IDS = [
  'office',
  'meeting_room',
  'warehouse',
  'truck',
  'rack',
  'computer',
  'employee',
  'desk',
  'chair',
  'tree',
  'reception',
  'factory',
] as const;

export type AssetId = (typeof ASSET_IDS)[number];
