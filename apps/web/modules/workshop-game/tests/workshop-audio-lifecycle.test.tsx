import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkshopGame } from '../component';
import type { WorldSceneProps } from '../world-scene';

let scene: WorldSceneProps;
let players: TestAudio[];

vi.mock('../renderer-support', () => ({ supportsWorldRenderer: () => true }));
vi.mock('../world-scene', () => ({ resetWorkshopResource: vi.fn() }));
vi.mock('next/dynamic', () => ({ default: () => (props: WorldSceneProps) => { scene = props; return null; } }));

// Only replace unsupported browser media playback and the WebGL boundary.
// WorkshopGame, its reducer, reader and useWorkshopAudio run together.
class TestAudio {
  paused = true;
  volume = 1;
  loop = false;
  preload = 'none';
  constructor(readonly src: string) { players.push(this); }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const hub = '/audio/workshop/hub-v1.mp3';
const kliniu = '/audio/workshop/kliniu-v1.mp3';
const academy = '/audio/workshop/academy-v1.mp3';
const settle = () => act(() => { vi.advanceTimersByTime(1_200); });
const playing = () => players.filter(player => !player.paused && player.volume > 0).map(player => player.src);
const expectSilence = () => expect(players.every(player => player.paused && player.volume === 0)).toBe(true);

function startWithSound() {
  const props = {
    initialSnapshot: { point: 'kliniu' as const, camera: null },
    onSave: vi.fn(), onOpenCase: vi.fn(), onPortfolio: vi.fn(),
  };
  const view = render(<WorkshopGame {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Sonido' }));
  settle();
  expect(playing()).toEqual([hub, kliniu]);
  return { view, props };
}

beforeEach(() => {
  players = [];
  vi.useFakeTimers();
  vi.stubGlobal('Audio', TestAudio);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('WorkshopGame audio across navigation and overlays', () => {
  it('silences the room immediately while reading the map and resumes it after closing', () => {
    startWithSound();
    fireEvent.click(screen.getByRole('button', { name: 'Mapa' }));
    expect(screen.getByRole('dialog', { name: 'Mapa del taller' })).toBeInTheDocument();
    expectSilence();
    settle();
    expectSilence();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar lectura' }));
    settle();
    expect(playing()).toEqual([hub, kliniu]);
    expect(players).toHaveLength(2);
  });

  it('stops the origin during loading and travel and starts the destination only after arrival', () => {
    startWithSound();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a 4U Studio Academy' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'room-loading');
    expectSilence();
    expect(players.some(player => player.src === academy)).toBe(false);
    act(() => scene.onRoomReady('academy', scene.token));
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'moving');
    expectSilence();
    settle();
    expectSilence();
    expect(players.some(player => player.src === academy)).toBe(false);
    act(() => scene.onArrived(scene.token));
    settle();
    expect(playing()).toEqual([hub, academy]);
    expect(players.find(player => player.src === kliniu)).toMatchObject({ paused: true, volume: 0 });
  });

  it('stays silent while suspended and reading, then resumes only the current room', () => {
    const { view, props } = startWithSound();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a 4U Studio Academy' }));
    act(() => scene.onRoomReady('academy', scene.token));
    act(() => scene.onArrived(scene.token));
    settle();
    expect(playing()).toEqual([hub, academy]);
    view.rerender(<WorkshopGame {...props} suspended />);
    expectSilence();
    view.rerender(<WorkshopGame {...props} reading={{ kind: 'map' }} />);
    expect(screen.getByRole('dialog', { name: 'Mapa del taller' })).toBeInTheDocument();
    expectSilence();
    settle();
    expectSilence();
    view.rerender(<WorkshopGame {...props} reading={null} />);
    settle();
    expect(playing()).toEqual([hub, academy]);
    expect(players.find(player => player.src === kliniu)).toMatchObject({ paused: true, volume: 0 });
    expect(players).toHaveLength(3);
  });
});
