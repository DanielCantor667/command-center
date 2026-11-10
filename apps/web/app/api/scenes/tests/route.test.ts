import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../route';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('scene planning API', () => {
  it('returns a local plan even when an AI key and prompt are present', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('External network disabled'); }));
    const response = await POST(new Request('http://localhost/api/scenes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ occupants: 12, style: 'tech_startup', prompt: 'An office' }),
    }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.source).toBe('planner');
    expect(result.scene.objects.length).toBeGreaterThan(0);
  });

  it('rejects an invalid occupant count', async () => {
    const response = await POST(new Request('http://localhost/api/scenes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ occupants: 0 }),
    }));
    expect(response.status).toBe(400);
  });
});
