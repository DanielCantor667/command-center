import type { WorldCameraSnapshot } from './world-state';
export type StationId = 'technologies' | 'trajectory' | 'contact';
export interface WorkshopStation {
  id: StationId;
  hotspot: [number, number, number]; view: WorldCameraSnapshot;
}
/** Texts live in the dictionary (`workshop.stations`, specs/i18n-english.md). Lab coordinates (specs/workshop-lab.md): pegboard on the left wall, whiteboard on the back wall, desk on the right. */
export const STATIONS: Record<StationId, WorkshopStation> = {
  technologies: { id: 'technologies', hotspot: [-3.7, 2.7, -2.6], view: { position: [-1.9, 1.9, -2.6], target: [-3.95, 1.95, -2.6] } },
  trajectory: { id: 'trajectory', hotspot: [0, 2.0, -4.75], view: { position: [.3, 1.55, -3.9], target: [.3, 1.55, -4.9] } },
  contact: { id: 'contact', hotspot: [3.55, 1.6, -3.0], view: { position: [2.3, 1.45, -2.4], target: [3.9, 1.05, -3.2] } },
};
export function stationForPoint(point: string): StationId | null {
  return Object.hasOwn(STATIONS, point) ? point as StationId : null;
}
