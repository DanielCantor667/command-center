/** Essential assets share a single loader/reset key. Optional rooms load on approach. */
export const WORKSHOP_ASSETS = {
  shell: '/models/workshop-game/workshop-shell-v2.glb',
  door: '/models/workshop-game/workshop-door-v1.glb',
  stations: '/models/workshop-game/workshop-stations-v1.glb',
} as const;
export const WORKSHOP_RESOURCE_URLS = [WORKSHOP_ASSETS.shell, WORKSHOP_ASSETS.door, WORKSHOP_ASSETS.stations];
export const ENTRY_DOOR = {
  position: [-1.8, 0, 8.05] as [number, number, number],
  openX: -7.4,
};
