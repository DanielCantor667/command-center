import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkshopAudio } from '../workshop-audio';

type AudioOptions = Parameters<typeof useWorkshopAudio>[0];
let players: TestAudio[];

// jsdom cannot play media. Keep the playback state at the browser boundary;
// the real hook owns track selection, volume, timers and resource lifetime.
class TestAudio {
  paused = true;
  volume = 1;
  loop = false;
  preload = 'none';
  constructor(readonly src: string) { players.push(this); }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const initial: AudioOptions = { enabled: true, point: 'kliniu', paused: false };
const track = (src: string) => players.find(player => player.src === src)!;
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

  it('keeps the hub bed and current room playing after their fade in', () => {
    renderHook(() => useWorkshopAudio(initial));
    settle();
    expect(players).toHaveLength(2);
    expect(track('/audio/workshop/hub-v1.mp3')).toMatchObject({ paused: false, volume: .22, loop: true });
    expect(track('/audio/workshop/kliniu-v1.mp3')).toMatchObject({ paused: false, volume: .7, loop: true });
  });

  it('stops the previous room immediately when returning to the hub, before timers can run', () => {
    const { rerender } = renderHook(options => useWorkshopAudio(options), { initialProps: initial });
    settle();
    rerender({ ...initial, point: 'hub' });
    expect(track('/audio/workshop/kliniu-v1.mp3')).toMatchObject({ paused: true, volume: 0 });
    expect(track('/audio/workshop/hub-v1.mp3').paused).toBe(false);
    settle();
    expect(track('/audio/workshop/hub-v1.mp3').volume).toBe(.45);
  });

  it('does not overlap room loops when switching rooms without a timer tick', () => {
    const { rerender } = renderHook(options => useWorkshopAudio(options), { initialProps: initial });
    settle();
    rerender({ ...initial, point: 'academy' });
    expect(track('/audio/workshop/kliniu-v1.mp3')).toMatchObject({ paused: true, volume: 0 });
    settle();
    expect(players.filter(player => !player.paused).map(player => player.src)).toEqual([
      '/audio/workshop/hub-v1.mp3', '/audio/workshop/academy-v1.mp3',
    ]);
  });

  it.each([
    ['sound disabled', { ...initial, enabled: false }],
    ['world paused', { ...initial, paused: true }],
  ] as const)('silences all tracks immediately with %s even while fades cannot run', (_, options) => {
    const { rerender } = renderHook(options => useWorkshopAudio(options), { initialProps: initial });
    settle();
    rerender(options);
    expect(players.every(player => player.paused && player.volume === 0)).toBe(true);
    settle();
    expect(players.every(player => player.paused && player.volume === 0)).toBe(true);
  });

  it('resumes only the selected room and reuses its existing media after repeated visits', () => {
    const { rerender } = renderHook(options => useWorkshopAudio(options), { initialProps: initial });
    settle();
    const original = track('/audio/workshop/kliniu-v1.mp3');
    rerender({ ...initial, paused: true });
    rerender({ ...initial, point: 'academy', paused: true });
    rerender({ ...initial, point: 'academy' });
    settle();
    rerender(initial);
    settle();
    expect(players).toHaveLength(3);
    expect(track('/audio/workshop/kliniu-v1.mp3')).toBe(original);
    expect(original).toMatchObject({ paused: false, volume: .7 });
    expect(track('/audio/workshop/academy-v1.mp3')).toMatchObject({ paused: true, volume: 0 });
  });

  it('silences every allocated track on unmount and leaves no fade that can revive it', () => {
    const { unmount } = renderHook(() => useWorkshopAudio(initial));
    act(() => { vi.advanceTimersByTime(120); });
    expect(players.some(player => !player.paused && player.volume > 0)).toBe(true);
    unmount();
    expect(players.every(player => player.paused && player.volume === 0)).toBe(true);
    settle();
    expect(players.every(player => player.paused && player.volume === 0)).toBe(true);
  });
});
