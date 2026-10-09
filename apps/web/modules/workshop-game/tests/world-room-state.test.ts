import { describe, expect, it } from 'vitest';
import { initialWorldState, worldReducer } from '../world-state';
const inside = () => initialWorldState({ point: 'hub', camera: null });
describe('room requests in the workshop', () => {
  it('waits for the selected room frame before starting its journey', () => {
    const loading = worldReducer(inside(), { type: 'go', point: 'kliniu' });
    expect(loading).toMatchObject({ status: 'room-loading', point: 'hub', destination: 'kliniu', pendingRoom: 'kliniu', activeRoom: null });
    expect(worldReducer(loading, { type: 'room-ready', room: 'kliniu', token: loading.token })).toMatchObject({ status: 'moving', pendingRoom: 'kliniu' });
  });
  it('ignores ready and failure callbacks from a superseded request', () => {
    const first = worldReducer(inside(), { type: 'go', point: 'kliniu' });
    const second = worldReducer(first, { type: 'go', point: 'academy' });
    expect(worldReducer(second, { type: 'room-ready', room: 'kliniu', token: first.token })).toBe(second);
    expect(worldReducer(second, { type: 'room-failed', room: 'kliniu', token: first.token })).toBe(second);
    expect(worldReducer(second, { type: 'room-ready', room: 'academy', token: second.token })).toMatchObject({ status: 'moving', destination: 'academy' });
  });
  it('cancels room loading without discarding the stable origin', () => {
    const first = worldReducer(initialWorldState({ point: 'kliniu', camera: null }), { type: 'go', point: 'drokex' });
    const cancelled = worldReducer(first, { type: 'cancel' });
    expect(cancelled).toMatchObject({ status: 'exploring', point: 'kliniu', destination: 'kliniu', activeRoom: 'kliniu', pendingRoom: null });
    expect(worldReducer(cancelled, { type: 'room-ready', room: 'drokex', token: first.token })).toBe(cancelled);
  });
  it('keeps origin geometry until arrival, then retains only the new room', () => {
    const load = worldReducer(initialWorldState({ point: 'kliniu', camera: null }), { type: 'go', point: 'lorigine' });
    const moving = worldReducer(load, { type: 'room-ready', room: 'lorigine', token: load.token });
    expect(moving.activeRoom).toBe('kliniu');
    expect(worldReducer(moving, { type: 'arrived', token: moving.token })).toMatchObject({ status: 'exploring', point: 'lorigine', activeRoom: 'lorigine', pendingRoom: null });
  });
  it('retries optional errors without resetting the core or accepting the old request', () => {
    const load = worldReducer(inside(), { type: 'go', point: 'drokex' });
    const failed = worldReducer(load, { type: 'room-failed', room: 'drokex', token: load.token });
    expect(failed).toMatchObject({ status: 'room-error', point: 'hub', destination: 'drokex' });
    const retry = worldReducer(failed, { type: 'retry-room' });
    expect(retry).toMatchObject({ status: 'room-loading', point: 'hub', pendingRoom: 'drokex' });
    expect(worldReducer(retry, { type: 'room-ready', room: 'drokex', token: load.token })).toBe(retry);
  });
  it('can leave a failed room and rejects its delayed callback', () => {
    const load = worldReducer(inside(), { type: 'go', point: 'academy' });
    const failed = worldReducer(load, { type: 'room-failed', room: 'academy', token: load.token });
    const hub = worldReducer(failed, { type: 'go', point: 'hub' });
    expect(hub).toMatchObject({ status: 'moving', destination: 'hub', pendingRoom: null });
    expect(worldReducer(hub, { type: 'room-ready', room: 'academy', token: load.token })).toBe(hub);
  });
  it('keeps the global GPU error when a pending room later fails', () => {
    const load = worldReducer(inside(), { type: 'go', point: 'academy' });
    const gpuError = worldReducer(load, { type: 'failed', token: load.token });
    expect(gpuError.status).toBe('error');
    expect(worldReducer(gpuError, { type: 'room-failed', room: 'academy', token: load.token })).toBe(gpuError);
    expect(worldReducer(gpuError, { type: 'room-ready', room: 'academy', token: load.token })).toBe(gpuError);
  });
  it('does not replay a journey when the stable destination is selected again', () => {
    const current = initialWorldState({ point: 'academy', camera: null });
    expect(worldReducer(current, { type: 'go', point: 'academy' })).toBe(current);
  });
});
