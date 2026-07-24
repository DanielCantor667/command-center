import { describe, expect, it } from 'vitest';
import { sceneSchema } from '@command-center/ai-renderer';
import { evaluateSceneReadiness } from '../lib/scene-readiness';

describe('scene readiness', () => {
  it('flags missing core office elements', () => {
    const scene = sceneSchema.parse({ version: 1, id: 'incomplete', objects: [{ id: 'desk', asset: 'desk' }] });
    expect(evaluateSceneReadiness(scene).map((issue) => issue.id)).toEqual(expect.arrayContaining(['office-shell', 'reception', 'chairs', 'meeting-rooms']));
  });

  it('accepts a compact render-ready office', () => {
    const scene = sceneSchema.parse({
      version: 1,
      id: 'complete',
      objects: [
        { id: 'office', asset: 'office', transform: { scale: 2 } },
        { id: 'reception', asset: 'reception' },
        { id: 'desk', asset: 'desk' },
        { id: 'chair', asset: 'chair' },
        { id: 'meeting', asset: 'meeting_room' },
      ],
    });
    expect(evaluateSceneReadiness(scene)).toEqual([]);
  });
});
