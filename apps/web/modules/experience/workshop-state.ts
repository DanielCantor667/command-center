import type { KliniuTourStop } from './components/kliniu-tour';

export interface CameraSnapshot {
  position: [number, number, number];
  target: [number, number, number];
  factor: number;
  /** View offset as a fraction of the viewport, not pixels. */
  offset: [number, number];
  width: number;
  height: number;
}
export interface CityCameraHandle {
  capture(): CameraSnapshot;
  restore(snapshot: CameraSnapshot): void;
}
export interface WorkshopSnapshot {
  projectId: string;
  detail: boolean;
  exploded: boolean;
  night: boolean;
  sceneEnabled: boolean | null;
  tourStop: KliniuTourStop;
  camera: CameraSnapshot | null;
  scrollY: number;
}

interface EntranceProfile {
  district: string;
  screen: string | null;
  zoom: number;
  position: [number, number, number];
  target: [number, number, number];
}
export const ENTRANCE_PROFILES = {
  kliniu: { district: 'kliniu', screen: '/projects/kliniu-desktop.png', zoom: 4.6, position: [.04, 1.15, 8], target: [0, .92, 1.04] },
  lorigine: { district: 'lorigine', screen: null, zoom: 3.1, position: [-2.5, 2.8, 7], target: [0, .8, 0] },
  '4ustudio-academy': { district: 'academy', screen: null, zoom: 3.1, position: [-2.5, 2.6, 7], target: [0, .8, 0] },
  drokex: { district: 'drokex', screen: null, zoom: 3.1, position: [-2.5, 2.6, 7], target: [0, .8, 0] },
} satisfies Record<string, EntranceProfile>;
export function entranceProfile(id: string): EntranceProfile {
  return ENTRANCE_PROFILES[id as keyof typeof ENTRANCE_PROFILES] ?? ENTRANCE_PROFILES.kliniu;
}
export function cameraBaseZoom(width: number, height: number, immersive: boolean, detail: boolean) {
  const mobile = width <= 800;
  const compact = mobile && height < 600;
  return immersive
    ? Math.min(width / (compact ? 15.5 : mobile ? 12.7 : 16.6), height / (mobile ? 13 : 11.8))
    : Math.min(width / (detail && width < 600 ? 9 : 12.7), height / 9.4);
}
export function restoreCameraFrame(snapshot: CameraSnapshot, width: number, height: number, immersive: boolean, detail: boolean) {
  return {
    zoom: cameraBaseZoom(width, height, immersive, detail) * snapshot.factor,
    offset: [snapshot.offset[0] * width, snapshot.offset[1] * height] as [number, number],
  };
}
