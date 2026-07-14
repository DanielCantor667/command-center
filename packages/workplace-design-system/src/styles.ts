import { z } from 'zod';
import { MATERIAL_IDS, SPACE_DENSITIES, STYLE_IDS, type StyleId } from './constants';

export const styleSchema = z.object({
  id: z.enum(STYLE_IDS),
  label: z.string(),
  description: z.string(),
  materialPalette: z.object({
    floor: z.enum(MATERIAL_IDS),
    wall: z.enum(MATERIAL_IDS),
    furniture: z.enum(MATERIAL_IDS),
    fabric: z.enum(MATERIAL_IDS),
  }),
  spaceDensity: z.enum(SPACE_DENSITIES),
  mood: z.array(z.string()),
});

export type Style = z.infer<typeof styleSchema>;

export const STYLE_REGISTRY: Record<StyleId, Style> = {
  corporate_standard: {
    id: 'corporate_standard',
    label: 'Corporate Standard',
    description: 'The default professional office typology: neutral, reliable, low visual risk.',
    materialPalette: { floor: 'carpet', wall: 'gray_paint', furniture: 'black_metal', fabric: 'gray' },
    spaceDensity: 'medium',
    mood: ['professional', 'neutral', 'reliable'],
  },
  tech_startup: {
    id: 'tech_startup',
    label: 'Tech Startup',
    description: 'Open, casual, high-density tech company office with an energetic feel.',
    materialPalette: { floor: 'concrete', wall: 'white_paint', furniture: 'black_metal', fabric: 'green' },
    spaceDensity: 'high',
    mood: ['energetic', 'open', 'casual'],
  },
  executive_premium: {
    id: 'executive_premium',
    label: 'Executive Premium',
    description: 'Low-density, high-finish typology for leadership-heavy or client-facing offices.',
    materialPalette: { floor: 'wood', wall: 'wood_panels', furniture: 'walnut', fabric: 'black' },
    spaceDensity: 'low',
    mood: ['premium', 'quiet', 'refined'],
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean, uncluttered, bright typology with the fewest materials and the most negative space.',
    materialPalette: { floor: 'concrete', wall: 'white_paint', furniture: 'white_metal', fabric: 'gray' },
    spaceDensity: 'low',
    mood: ['clean', 'uncluttered', 'bright'],
  },
  scandinavian: {
    id: 'scandinavian',
    label: 'Scandinavian',
    description: 'Warm, natural-material typology with light woods and soft, muted accent colors.',
    materialPalette: { floor: 'wood', wall: 'white_paint', furniture: 'oak', fabric: 'green' },
    spaceDensity: 'medium',
    mood: ['warm', 'natural', 'light'],
  },
  creative_studio: {
    id: 'creative_studio',
    label: 'Creative Studio',
    description: 'High-density, expressive typology for design/creative teams that favors flexible collaboration space.',
    materialPalette: { floor: 'wood', wall: 'gray_paint', furniture: 'black_metal', fabric: 'blue' },
    spaceDensity: 'high',
    mood: ['playful', 'expressive', 'flexible'],
  },
};

export function getStyle(id: StyleId): Style {
  return STYLE_REGISTRY[id];
}

export function listStyles(): Style[] {
  return Object.values(STYLE_REGISTRY);
}
