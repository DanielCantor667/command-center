import { describe, expect, it } from 'vitest';
import { generateScene } from '../src/generate-scene';
import type { ScenePromptClient } from '../src/scene-prompt-client';

const validSceneJson = JSON.stringify({
  version: 1,
  id: 'generated-scene',
  objects: [
    { id: 'obj-1', asset: 'desk', transform: { position: { x: 0, y: 0, z: 0 } } },
  ],
});

function fakeClient(response: string): ScenePromptClient {
  return { generate: async () => response };
}

describe('generateScene', () => {
  it('parses a valid scene response', async () => {
    const scene = await generateScene('a small office', fakeClient(validSceneJson));
    expect(scene.id).toBe('generated-scene');
    expect(scene.objects).toHaveLength(1);
  });

  it('strips markdown code fences from the response', async () => {
    const fenced = '```json\n' + validSceneJson + '\n```';
    const scene = await generateScene('a small office', fakeClient(fenced));
    expect(scene.id).toBe('generated-scene');
  });

  it('throws on invalid JSON', async () => {
    await expect(generateScene('bad', fakeClient('not json'))).rejects.toThrow();
  });

  it('throws when the response does not match the scene schema', async () => {
    const invalid = JSON.stringify({ version: 1, id: 'x', objects: [{ id: 'o1', asset: 'not_a_real_asset', transform: { position: { x: 0, y: 0, z: 0 } } }] });
    await expect(generateScene('bad asset', fakeClient(invalid))).rejects.toThrow();
  });
});
