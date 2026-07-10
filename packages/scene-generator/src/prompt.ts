import { ASSET_IDS } from '@command-center/ai-renderer';

export function buildSystemPrompt(): string {
  return [
    'You generate 3D scenes for Command Center as strict JSON matching this contract:',
    '{ "version": 1, "id": string, "metadata"?: { "name"?: string }, "objects": [',
    '  { "id": string, "asset": AssetId, "transform": { "position": {x,y,z}, "rotation"?: {x,y,z}, "scale"?: number } }',
    '] }',
    `AssetId must be one of: ${ASSET_IDS.join(', ')}.`,
    'Respond with JSON only, no prose, no markdown code fences.',
  ].join('\n');
}
