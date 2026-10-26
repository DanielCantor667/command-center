import { describe, expect, it } from 'vitest';
import { initialWorldState, worldReducer } from '../world-state';

describe('workshop navigation', () => {
  it('rejects a ready callback after loading was cancelled and restarted, then dollies into the overview', () => {
    const first = worldReducer(initialWorldState(), { type: 'start' });
    const cancelled = worldReducer(first, { type: 'cancel' });
    expect(cancelled.status).toBe('landing');
    const second = worldReducer(cancelled, { type: 'start' });
    expect(worldReducer(second, { type: 'ready', token: first.token }).status).toBe('loading');
    expect(worldReducer(second, { type: 'ready', token: second.token })).toMatchObject({ status: 'moving', destination: 'hub' });
  });
  it('ignores an old arrival after the visitor chooses another destination', () => {
    const inside = initialWorldState({ point: 'hub', camera: null });
    const first = worldReducer(inside, { type: 'go', point: 'projects' });
    const second = worldReducer(first, { type: 'go', point: 'contact' });
    expect(worldReducer(second, { type: 'arrived', token: first.token })).toMatchObject({ status: 'moving', destination: 'contact', point: 'hub' });
    expect(worldReducer(second, { type: 'arrived', token: second.token })).toMatchObject({ status: 'exploring', point: 'contact' });
  });
  it('cancels a movement to the last stable point instead of the pending destination', () => {
    const moving = worldReducer(initialWorldState({ point: 'hub', camera: null }), { type: 'go', point: 'projects' });
    const cancelled = worldReducer(moving, { type: 'cancel' });
    expect(cancelled).toMatchObject({ status: 'exploring', point: 'hub', destination: 'hub' });
    expect(worldReducer(cancelled, { type: 'arrived', token: moving.token }).point).toBe('hub');
  });
  it('restores a visit without forcing the entrance again and exposes real load errors', () => {
    expect(initialWorldState({ point: 'projects', camera: null })).toMatchObject({ status: 'exploring', point: 'projects' });
    const loading = worldReducer(initialWorldState(), { type: 'start' });
    expect(worldReducer(loading, { type: 'failed', token: loading.token }).status).toBe('error');
    const retried = worldReducer(worldReducer(loading, { type: 'failed', token: loading.token }), { type: 'start' });
    expect(worldReducer(retried, { type: 'failed', token: loading.token }).status).toBe('loading');
  });
  it('ignores navigation before the world is ready and repeated requests for the current point', () => {
    expect(worldReducer(initialWorldState(), { type: 'go', point: 'projects' }).status).toBe('landing');
    const inside = initialWorldState({ point: 'projects', camera: null });
    expect(worldReducer(inside, { type: 'go', point: 'projects' })).toBe(inside);
  });
});
