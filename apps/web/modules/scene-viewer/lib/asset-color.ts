import type { AssetCategory } from '@command-center/ai-renderer';

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  building: '#8a8f98',
  furniture: '#c08a4f',
  vehicle: '#4f7fc0',
  nature: '#4fa06a',
  people: '#c05f8a',
};

export function getAssetColor(category: AssetCategory): string {
  return CATEGORY_COLORS[category];
}
