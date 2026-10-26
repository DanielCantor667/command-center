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

const bed = '/audio/workshop/hub-v1.mp3';
const settle = () => act(() => { vi.advanceTimersByTime(1_200); });
const playing = () => players.filter(player => !player.paused && player.volume > 0).map(player => player.src);
const expectSilence = () => expect(players.every(player => player.paused && player.volume === 0)).toBe(true);

function startWithSound() {
  const props = {
    initialSnapshot: { point: 'projects' as const, camera: null },
    onSave: vi.fn(), onOpenCase: vi.fn(), onPortfolio: vi.fn(),
  };
  const view = render(<WorkshopGame {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Sonido' }));
  settle();
  expect(playing()).toEqual([bed]);
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
  it('silences the bed immediately while reading the map and resumes it after closing', () => {
    startWithSound();
    fireEvent.click(screen.getByRole('button', { name: 'Mapa' }));
    expect(screen.getByRole('dialog', { name: 'Mapa del taller' })).toBeInTheDocument();
    expectSilence();
    settle();
    expectSilence();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar lectura' }));
    settle();
    expect(playing()).toEqual([bed]);
    expect(players).toHaveLength(1);
  });

  it('stays silent during travel and resumes only after arrival', () => {
    startWithSound();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Contacto' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'moving');
    expectSilence();
    settle();
    expectSilence();
    act(() => scene.onArrived(scene.token));
    settle();
    expect(playing()).toEqual([bed]);
  });

  it('stays silent while suspended and reading, then resumes the same media', () => {
    const { view, props } = startWithSound();
    view.rerender(<WorkshopGame {...props} suspended />);
    expectSilence();
    view.rerender(<WorkshopGame {...props} reading={{ kind: 'map' }} />);
    expect(screen.getByRole('dialog', { name: 'Mapa del taller' })).toBeInTheDocument();
    expectSilence();
    settle();
    expectSilence();
    view.rerender(<WorkshopGame {...props} reading={null} />);
    settle();
    expect(playing()).toEqual([bed]);
    expect(players).toHaveLength(1);
  });
});
