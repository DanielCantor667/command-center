import { useEffect, useRef } from 'react';
import { soundscape } from './lab-soundscape';

export const WORKSHOP_TRACK_URL = '/audio/workshop/hub-v1.mp3';
const VOLUME = .45;
const FADE_STEP = .04;

/** Off by default and only ever started from a user gesture (the toggle). One ambient bed plus the positional sounds. */
export function useWorkshopAudio({ enabled, paused }: { enabled: boolean; paused: boolean }) {
  const player = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const goal = !enabled || paused ? 0 : VOLUME;
    // A hidden tab may throttle fades indefinitely: stop now instead of waiting for a timer to mute it.
    if (goal === 0) {
      if (player.current) { player.current.volume = 0; player.current.pause(); }
      return;
    }
    if (!player.current) {
      const audio = new Audio(WORKSHOP_TRACK_URL);
      audio.loop = true; audio.volume = 0; audio.preload = 'auto';
      player.current = audio;
    }
    const audio = player.current;
    if (audio.paused) audio.play()?.catch(() => { /* blocked or unavailable: stay silent */ });
    const timer = window.setInterval(() => {
      audio.volume = Math.min(1, Math.abs(goal - audio.volume) <= FADE_STEP ? goal : audio.volume + FADE_STEP);
      if (audio.volume === goal) window.clearInterval(timer);
    }, 60);
    return () => window.clearInterval(timer);
  }, [enabled, paused]);
  useEffect(() => {
    if (!enabled) { soundscape.stop(); return; }
    soundscape.start();
    soundscape.pause(paused);
  }, [enabled, paused]);
  useEffect(() => () => { if (player.current) { player.current.volume = 0; player.current.pause(); } player.current = null; soundscape.stop(); }, []);
}
