import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkshopAudio, WORKSHOP_TRACK_URL } from '../workshop-audio';

type AudioOptions = Parameters<typeof useWorkshopAudio>[0];
let players: TestAudio[];

// jsdom cannot play media. Keep the playback state at the browser boundary;
// the real hook owns volume, timers and resource lifetime.
class TestAudio {
  paused = true;
  volume = 1;
  loop = false;
  preload = 'none';
  constructor(readonly src: string) { players.push(this); }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const initial: AudioOptions = { enabled: true, paused: false };
const settle = () => act(() => { vi.advanceTimersByTime(1_200); });

beforeEach(() => {
  players = [];
  vi.useFakeTimers();
  vi.stubGlobal('Audio', TestAudio);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Workshop audio lifecycle', () => {
  it('allocates no media before sound is enabled', () => {
    renderHook(() => useWorkshopAudio({ ...initial, enabled: false }));
    settle();
    expect(players).toHaveLength(0);
  });

  it('plays one looping ambient bed after its fade in', () => {
    renderHook(() => useWorkshopAudio(initial));
    settle();
    expect(players).toHaveLength(1);
    expect(players[0]).toMatchObject({ src: WORKSHOP_TRACK_URL, paused: false, volume: .45, loop: true });
  });

  it.each([
    ['sound disabled', { ...initial, enabled: false }],
    ['world paused', { ...initial, paused: true }],
  ] as const)('silences the bed immediately with %s even while fades cannot run', (_, options) => {
    const { rerender } = renderHook(options => useWorkshopAudio(options), { initialProps: initial });
    settle();
    rerender(options);
    expect(players[0]).toMatchObject({ paused: true, volume: 0 });
    settle();
    expect(players[0]).toMatchObject({ paused: true, volume: 0 });
  });

  it('reuses the same media after a pause', () => {
    const { rerender } = renderHook(options => useWorkshopAudio(options), { initialProps: initial });
    settle();
    rerender({ ...initial, paused: true });
    rerender(initial);
    settle();
    expect(players).toHaveLength(1);
    expect(players[0]).toMatchObject({ paused: false, volume: .45 });
  });

  it('silences the bed on unmount and leaves no fade that can revive it', () => {
    const { unmount } = renderHook(() => useWorkshopAudio(initial));
    act(() => { vi.advanceTimersByTime(120); });
    expect(players[0]!.volume).toBeGreaterThan(0);
    unmount();
    expect(players[0]).toMatchObject({ paused: true, volume: 0 });
    settle();
    expect(players[0]).toMatchObject({ paused: true, volume: 0 });
  });
});
