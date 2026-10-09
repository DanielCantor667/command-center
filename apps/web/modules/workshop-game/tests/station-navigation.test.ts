import { expect, it } from 'vitest';
import { WORLD_VIEWS, initialWorldState, worldReducer, type WorldPoint } from '../world-state';
it('provides safe camera destinations for the three reading stations', () => {
  for (const id of ['technologies', 'trajectory', 'contact']) expect(WORLD_VIEWS[id as WorldPoint]).toBeDefined();
});
it('invalidates a pending room when switching to a reading station', () => {
  const state = worldReducer(initialWorldState({ point: 'hub', camera: null }), { type: 'go', point: 'kliniu' });
  const station = worldReducer(state, { type: 'go', point: 'technologies' as WorldPoint });
  expect(station.pendingRoom).toBeNull(); expect(station.status).toBe('moving');
  expect(worldReducer(station, { type: 'room-ready', room: 'kliniu', token: state.token })).toBe(station);
});
