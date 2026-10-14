import type { WorldCameraSnapshot } from './world-state';
export const ROOM_IDS = ['kliniu', 'lorigine', 'academy', 'drokex'] as const;
export type RoomId = typeof ROOM_IDS[number];
interface WorkshopRoom { id: RoomId; projectId: string; name: string; url: string; portal: [number, number, number]; view: WorldCameraSnapshot; evidence: string }
export const WORKSHOP_ROOMS: Record<RoomId, WorkshopRoom> = {
  kliniu: { id: 'kliniu', projectId: 'kliniu', name: 'Kliniu', url: '/models/workshop-game/room-kliniu-v1.glb', portal: [-5.1, 1.5, -2.85], view: { position: [-5.1, 1.65, -4], target: [-5.1, 1.5, -8.7] }, evidence: '/projects/kliniu-desktop.png' },
  lorigine: { id: 'lorigine', projectId: 'lorigine', name: "L'ORIGINE", url: '/models/workshop-game/room-lorigine-v2.glb', portal: [4.8, 1.5, -2.85], view: { position: [5.0, 1.65, -3.5], target: [4.85, 1.45, -8.5] }, evidence: '/projects/lorigine-catalog-v4.webp' },
  academy: { id: 'academy', projectId: '4ustudio-academy', name: '4U Studio Academy', url: '/models/workshop-game/room-academy-v2.glb', portal: [-3.85, 1.5, 5.7], view: { position: [-6.4, 1.65, 5.7], target: [-8.6, 1.4, 5.7] }, evidence: '/projects/academy-lessons-v4.webp' },
  drokex: { id: 'drokex', projectId: 'drokex', name: 'Drokex', url: '/models/workshop-game/room-drokex-v1.glb', portal: [3.85, 1.5, 5.7], view: { position: [6.4, 1.65, 5.7], target: [8.6, 1.4, 5.7] }, evidence: '/projects/drokex-products-v4.webp' },
};
export function roomForPoint(point: string): RoomId | null { return ROOM_IDS.find(id => id === point) ?? null; }
