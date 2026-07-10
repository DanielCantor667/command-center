import type { AssetId } from '../constants/asset-catalog';
import { MODELS_BASE_PATH, THUMBNAILS_BASE_PATH } from '../constants/models-path';
import type { AssetMetadata } from '../schemas/asset-metadata.schema';

const buildEntry = (id: AssetId, label: string, category: AssetMetadata['category'], tags: string[]): AssetMetadata => ({
  id,
  label,
  category,
  modelPath: `${MODELS_BASE_PATH}/${id}.glb`,
  thumbnailPath: `${THUMBNAILS_BASE_PATH}/${id}.webp`,
  tags,
});

export const ASSET_REGISTRY: Readonly<Record<AssetId, AssetMetadata>> = {
  office: buildEntry('office', 'Office', 'building', ['space', 'corporate']),
  meeting_room: buildEntry('meeting_room', 'Meeting Room', 'building', ['space', 'corporate']),
  warehouse: buildEntry('warehouse', 'Warehouse', 'building', ['space', 'logistics']),
  truck: buildEntry('truck', 'Truck', 'vehicle', ['logistics']),
  rack: buildEntry('rack', 'Rack', 'furniture', ['storage', 'logistics']),
  computer: buildEntry('computer', 'Computer', 'furniture', ['tech']),
  employee: buildEntry('employee', 'Employee', 'people', ['character']),
  desk: buildEntry('desk', 'Desk', 'furniture', ['office']),
  chair: buildEntry('chair', 'Chair', 'furniture', ['office']),
  tree: buildEntry('tree', 'Tree', 'nature', ['outdoor']),
  reception: buildEntry('reception', 'Reception', 'furniture', ['office']),
  factory: buildEntry('factory', 'Factory', 'building', ['space', 'industrial']),
};

export function getAssetMetadata(id: AssetId): AssetMetadata {
  return ASSET_REGISTRY[id];
}

export function listAssets(): AssetMetadata[] {
  return Object.values(ASSET_REGISTRY);
}

export function listAssetsByCategory(category: AssetMetadata['category']): AssetMetadata[] {
  return listAssets().filter((asset) => asset.category === category);
}
