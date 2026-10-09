import type { RoomId } from './rooms';
/** Additive layer: generated props stay outside the hashed shell/room GLBs. Sources face +X; `turn` is the Y rotation. */
export interface WorkshopProp { id: string; position: [number, number, number]; turn: number }
export interface WorkshopArt { url: string; position: [number, number, number]; size: [number, number] }
const prop = (id: string, position: [number, number, number], turn: number): WorkshopProp => ({ id, position, turn });
export const propUrl = (id: string) => `/models/workshop-game/props/${id}-v1.glb`;
const FRONT = -Math.PI / 2;
export const HUB_PROPS: WorkshopProp[] = [prop('lamp', [-1.85, 1, -.3], FRONT + .7)];
export const ROOM_PROPS: Record<RoomId, WorkshopProp[]> = {
  kliniu: [prop('seal', [-6.45, .915, -6.8], FRONT + .35), prop('dispenser', [-3.75, .915, -7.45], FRONT + .5)],
  lorigine: [prop('bottle', [3.95, .71, -6.66], FRONT + .3)],
  academy: [prop('headphones', [-8.38, 1.445, 6.52], .25), prop('microphone', [-8.36, 1.445, 4.92], 0)],
  drokex: [prop('globe', [8.26, .75, 5.25], Math.PI - .5)],
};
/** Framed prints on the plaster jambs facing the hub (wall face z=-2.94). */
export const HUB_ART: WorkshopArt[] = [
  { url: '/experience/workshop-art-blueprint-v1.webp', position: [-2.75, 1.95, -2.93], size: [1.28, .96] },
  { url: '/experience/workshop-art-geometric-v1.webp', position: [2.37, 1.95, -2.93], size: [1, 1.02] },
];
