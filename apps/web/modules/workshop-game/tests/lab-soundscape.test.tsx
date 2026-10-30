import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { soundscape } from '../lab-soundscape';
import { useWorkshopAudio } from '../workshop-audio';

const param = () => ({ value: 0 });
const node = () => {
  const self = { connect: (target: unknown) => target, start: vi.fn(), gain: param(), frequency: param(), Q: param(), positionX: param(), positionY: param(), positionZ: param() };
  return self;
};
let contexts: TestContext[];
class TestContext {
  sampleRate = 8;
  destination = node();
  listener = { positionX: param(), positionY: param(), positionZ: param(), forwardX: param(), forwardY: param(), forwardZ: param(), upX: param(), upY: param(), upZ: param() };
  panners: ReturnType<typeof node>[] = [];
  suspend = vi.fn(() => Promise.resolve());
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  constructor() { contexts.push(this); }
  createGain = node; createBiquadFilter = node; createOscillator = node; createBufferSource = node;
  createPanner = () => { const panner = node(); this.panners.push(panner); return panner; };
  createBuffer = (_: number, length: number) => ({ getChannelData: () => new Float32Array(length) });
}

beforeEach(() => { contexts = []; vi.stubGlobal('AudioContext', TestContext); vi.stubGlobal('Audio', class { play() { return Promise.resolve(); } pause() {} volume = 0; paused = true; }); });
afterEach(() => { cleanup(); soundscape.stop(); vi.unstubAllGlobals(); });

describe('lab soundscape', () => {
  it('creates no AudioContext while sound is off', () => {
    renderHook(() => useWorkshopAudio({ enabled: false, paused: false }));
    soundscape.listen([1, 1, 1], [0, 0, -1], [0, 1, 0]);
    soundscape.move('robot-quad', 1, 1, 1);
    expect(contexts).toHaveLength(0);
  });

  it('starts once with its eight sources and suspends with the world', () => {
    const { rerender } = renderHook(props => useWorkshopAudio(props), { initialProps: { enabled: true, paused: false } });
    expect(contexts).toHaveLength(1);
    expect(contexts[0]!.panners).toHaveLength(8);
    rerender({ enabled: true, paused: true });
    expect(contexts[0]!.suspend).toHaveBeenCalled();
    expect(contexts).toHaveLength(1);
  });

  it('closes the context when sound goes off or the game unmounts', () => {
    const { rerender } = renderHook(props => useWorkshopAudio(props), { initialProps: { enabled: true, paused: false } });
    rerender({ enabled: false, paused: false });
    expect(contexts[0]!.close).toHaveBeenCalled();
  });

  it('follows the camera and the walkers', () => {
    soundscape.start();
    soundscape.listen([1, 2, 3], [0, 0, -1], [0, 1, 0]);
    expect(contexts[0]!.listener.positionZ.value).toBe(3);
    expect(contexts[0]!.listener.forwardZ.value).toBe(-1);
    soundscape.move('robot-quad', 4, .5, -2);
    expect(contexts[0]!.panners[6]!.positionX.value).toBe(4);
  });
});
