import { useEffect, useRef } from 'react';
import { roomForPoint, ROOM_IDS } from './rooms';
import type { WorldPoint } from './world-state';

type TrackId = 'hub' | typeof ROOM_IDS[number];
const TRACKS: TrackId[] = ['hub', ...ROOM_IDS];
export const trackUrl = (id: TrackId) => `/audio/workshop/${id}-v1.mp3`;
const FADE_STEP = .04;

/**
 * Off by default and only ever started from a user gesture (the toggle).
 * The hub bed plays throughout and ducks inside a room; each room adds its own track.
 */
export function useWorkshopAudio({ enabled, point, paused }: { enabled: boolean; point: WorldPoint; paused: boolean }) {
  const players = useRef<Partial<Record<TrackId, HTMLAudioElement>>>({});
  const room = roomForPoint(point);
  useEffect(() => {
    const target = (id: TrackId) => !enabled || paused ? 0 : id === 'hub' ? (room ? .22 : .45) : id === room ? .7 : 0;
    for (const id of TRACKS) {
      if (target(id) === 0 || players.current[id]) continue;
      const audio = new Audio(trackUrl(id));
      audio.loop = true; audio.volume = 0; audio.preload = 'auto';
      players.current[id] = audio;
    }
    for (const id of TRACKS) {
      const audio = players.current[id];
      if (audio && target(id) > 0 && audio.paused) audio.play()?.catch(() => { /* blocked or unavailable: stay silent */ });
    }
    const timer = window.setInterval(() => {
      let settled = true;
      for (const id of TRACKS) {
        const audio = players.current[id];
        if (!audio) continue;
        const goal = target(id);
        const next = Math.abs(goal - audio.volume) <= FADE_STEP ? goal : audio.volume + Math.sign(goal - audio.volume) * FADE_STEP;
        audio.volume = Math.min(1, Math.max(0, next));
        if (next === 0 && !audio.paused) audio.pause();
        if (next !== goal) settled = false;
      }
      if (settled) window.clearInterval(timer);
    }, 60);
    return () => window.clearInterval(timer);
  }, [enabled, paused, room]);
  useEffect(() => () => { Object.values(players.current).forEach(audio => audio?.pause()); players.current = {}; }, []);
}
