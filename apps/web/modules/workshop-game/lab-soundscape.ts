/**
 * R.4 (specs/workshop-realism.md): the lab's positional sounds, synthesised with Web Audio over the ambient bed. Each
 * one sits at its object with an HRTF panner, so it changes side and level as the camera moves. All of it exists only
 * while sound is on: with the toggle off no AudioContext is ever created.
 */
type Vector = readonly [number, number, number];
type Voice = (context: AudioContext, noise: AudioBuffer, output: AudioNode) => void;

function filtered(context: AudioContext, noise: AudioBuffer, type: BiquadFilterType, frequency: number, Q = 1) {
  const source = context.createBufferSource();
  source.buffer = noise; source.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = type; filter.frequency.value = frequency; filter.Q.value = Q;
  source.connect(filter); source.start();
  return filter;
}
function level(context: AudioContext, value: number, input: AudioNode, output: AudioNode) {
  const gain = context.createGain();
  gain.gain.value = value;
  input.connect(gain).connect(output);
  return gain;
}
function tone(context: AudioContext, type: OscillatorType, frequency: number) {
  const oscillator = context.createOscillator();
  oscillator.type = type; oscillator.frequency.value = frequency;
  oscillator.start();
  return oscillator;
}
/** A slow tremolo on `gain`: the cat's breath, a servo's duty cycle. */
function pulse(context: AudioContext, gain: GainNode, rate: number, depth: number) {
  const swing = context.createGain();
  swing.gain.value = depth;
  tone(context, 'sine', rate).connect(swing);
  swing.connect(gain.gain);
}

const fan: Voice = (context, noise, output) => { level(context, .5, filtered(context, noise, 'bandpass', 190, .7), output); };
const hum: Voice = (context, _, output) => {
  level(context, .05, tone(context, 'sine', 120), output);
  level(context, .018, tone(context, 'triangle', 240), output);
};
const purr: Voice = (context, noise, output) => {
  const body = level(context, .55, filtered(context, noise, 'lowpass', 140), output);
  pulse(context, body, 24, .4);
};
const rain: Voice = (context, noise, output) => {
  level(context, .32, filtered(context, noise, 'highpass', 1800, .4), output);
  level(context, .2, filtered(context, noise, 'lowpass', 500), output);
};
const servo: Voice = (context, _, output) => {
  const whine = level(context, .02, tone(context, 'sawtooth', 210), output);
  pulse(context, whine, 1.6, .016);
};

/** Fixed sources, in three.js lab coordinates (the Blender placements of the prototype). */
const FIXED: { voice: Voice; at: Vector }[] = [
  { voice: fan, at: [3.65, 1, -3.97] },
  { voice: hum, at: [-3.95, 2.65, -2] },
  { voice: hum, at: [3.97, 2.55, -1.2] },
  { voice: purr, at: [-2.1, .9, -1.85] },
  { voice: rain, at: [1.25, 1.7, -4.9] },
];
const WALKERS = ['robot-humanoid', 'robot-quad', 'robot-trilobite'];
const MASTER = .8;

function place(panner: PannerNode, [x, y, z]: Vector) {
  panner.positionX.value = x; panner.positionY.value = y; panner.positionZ.value = z;
}

interface Scape { context: AudioContext; walkers: Map<string, PannerNode> }
let scape: Scape | null = null;

function build(): Scape | null {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return null;
  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = MASTER;
  master.connect(context.destination);
  const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const source = (voice: Voice, at: Vector) => {
    const panner = context.createPanner();
    panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse';
    panner.refDistance = 1; panner.rolloffFactor = 1.4;
    place(panner, at);
    panner.connect(master);
    voice(context, noise, panner);
    return panner;
  };
  FIXED.forEach(({ voice, at }) => source(voice, at));
  return { context, walkers: new Map(WALKERS.map(id => [id, source(servo, [0, .5, 0])])) };
}

export const soundscape = {
  /** From the sound toggle's effect, right after the user's gesture. Idempotent. */
  start() { scape ??= build(); },
  pause(paused: boolean) {
    if (!scape) return;
    (paused ? scape.context.suspend() : scape.context.resume())?.catch?.(() => { /* blocked: stay silent */ });
  },
  stop() { void scape?.context.close(); scape = null; },
  /** Per frame from the camera. Cheap no-op while sound is off. */
  listen(position: Vector, forward: Vector, up: Vector) {
    const listener = scape?.context.listener;
    if (!listener) return;
    if (!listener.positionX) { // Safari before 18 only has the deprecated setters
      listener.setPosition(...position);
      listener.setOrientation(...forward, ...up);
      return;
    }
    listener.positionX.value = position[0]; listener.positionY.value = position[1]; listener.positionZ.value = position[2];
    listener.forwardX.value = forward[0]; listener.forwardY.value = forward[1]; listener.forwardZ.value = forward[2];
    listener.upX.value = up[0]; listener.upY.value = up[1]; listener.upZ.value = up[2];
  },
  move(id: string, x: number, y: number, z: number) {
    const panner = scape?.walkers.get(id);
    if (panner) place(panner, [x, y, z]);
  },
};
