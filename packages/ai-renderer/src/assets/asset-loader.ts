import { getAssetMetadata } from './asset-registry';
import type { AssetId } from '../constants/asset-catalog';

export function resolveModelUrl(id: AssetId): string {
  return getAssetMetadata(id).modelPath;
}

export function resolveThumbnailUrl(id: AssetId): string {
  return getAssetMetadata(id).thumbnailPath;
}
