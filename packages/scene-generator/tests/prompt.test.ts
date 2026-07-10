import { describe, expect, it } from 'vitest';
import { ASSET_IDS } from '@command-center/ai-renderer';
import { buildSystemPrompt } from '../src/prompt';

describe('buildSystemPrompt', () => {
  it('lists every asset id', () => {
    const prompt = buildSystemPrompt();
    for (const id of ASSET_IDS) {
      expect(prompt).toContain(id);
    }
  });
});
