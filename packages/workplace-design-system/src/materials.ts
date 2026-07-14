import { z } from 'zod';
import { MATERIAL_FAMILIES, MATERIAL_FINISHES, MATERIAL_IDS, type MaterialId, type StyleId } from './constants';
import { listStyles } from './styles';

export const materialSchema = z.object({
  id: z.enum(MATERIAL_IDS),
  label: z.string(),
  family: z.enum(MATERIAL_FAMILIES),
  baseColorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  finish: z.enum(MATERIAL_FINISHES),
});

export type Material = z.infer<typeof materialSchema>;

export const MATERIAL_REGISTRY: Record<MaterialId, Material> = {
  concrete: { id: 'concrete', label: 'Concrete', family: 'floor', baseColorHex: '#B7B8B6', finish: 'textured' },
  wood: { id: 'wood', label: 'Wood', family: 'floor', baseColorHex: '#A9754F', finish: 'matte' },
  carpet: { id: 'carpet', label: 'Carpet', family: 'floor', baseColorHex: '#5B6470', finish: 'textured' },
  stone: { id: 'stone', label: 'Stone', family: 'floor', baseColorHex: '#8C8A85', finish: 'matte' },
  white_paint: { id: 'white_paint', label: 'White Paint', family: 'wall', baseColorHex: '#F5F4F0', finish: 'matte' },
  gray_paint: { id: 'gray_paint', label: 'Gray Paint', family: 'wall', baseColorHex: '#9CA0A6', finish: 'matte' },
  wood_panels: { id: 'wood_panels', label: 'Wood Panels', family: 'wall', baseColorHex: '#8A5A34', finish: 'matte' },
  glass: { id: 'glass', label: 'Glass', family: 'wall', baseColorHex: '#CFE8F0', finish: 'glossy' },
  oak: { id: 'oak', label: 'Oak', family: 'furniture', baseColorHex: '#C69A63', finish: 'matte' },
  walnut: { id: 'walnut', label: 'Walnut', family: 'furniture', baseColorHex: '#5B3A29', finish: 'matte' },
  black_metal: { id: 'black_metal', label: 'Black Metal', family: 'furniture', baseColorHex: '#232323', finish: 'matte' },
  white_metal: { id: 'white_metal', label: 'White Metal', family: 'furniture', baseColorHex: '#E7E7E4', finish: 'matte' },
  gray: { id: 'gray', label: 'Gray', family: 'fabric', baseColorHex: '#8D8F92', finish: 'textured' },
  blue: { id: 'blue', label: 'Blue', family: 'fabric', baseColorHex: '#3A5A78', finish: 'textured' },
  green: { id: 'green', label: 'Green', family: 'fabric', baseColorHex: '#4C6B54', finish: 'textured' },
  black: { id: 'black', label: 'Black', family: 'fabric', baseColorHex: '#1D1D1D', finish: 'textured' },
};

export function getMaterial(id: MaterialId): Material {
  return MATERIAL_REGISTRY[id];
}

export function listMaterials(): Material[] {
  return Object.values(MATERIAL_REGISTRY);
}

export function getCompatibleStyles(materialId: MaterialId): StyleId[] {
  return listStyles()
    .filter((style) => Object.values(style.materialPalette).includes(materialId))
    .map((style) => style.id);
}
