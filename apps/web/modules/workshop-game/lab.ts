/** Robotics lab assets (specs/workshop-lab.md), exported by blender/bake_workshop_lab.py + compress_workshop_lab.sh. */
export const labUrl = (name: string) => `/models/workshop-lab/${name}-v1.glb`;
/** Baked room + neon/sky: the world fails without them. Plants and actors are optional decoration. */
export const LAB_ESSENTIAL_URLS = [labUrl('lab-baked'), labUrl('lab-emissive')];
export const LAB_PLANTS_URL = labUrl('lab-plants');
/**
 * Placed in the GLB itself (world transform kept on export). Drones are not baked, so `offset` moves them
 * clear of the camera paths: the K07 above the repair table, the Mech Drone up by the back shelves.
 */
export const LAB_ACTORS: { id: string; hover: boolean; offset: [number, number, number] }[] = [
  { id: 'robot-cobot', hover: false, offset: [0, 0, 0] },
  { id: 'drone-k07', hover: true, offset: [-1.15, .6, 1.55] },
  { id: 'drone-mech', hover: true, offset: [.45, .85, -2.2] },
  { id: 'cat', hover: false, offset: [0, 0, 0] },
];
/** Real published captures; projects without one show their name only (never an invented capture). */
export const PROJECT_CAPTURES: Record<string, string> = {
  kliniu: '/projects/kliniu-desktop.webp',
  lorigine: '/projects/lorigine-catalog-v4.webp',
  '4ustudio-academy': '/projects/academy-lessons-v4.webp',
  drokex: '/projects/drokex-products-v4.webp',
};
/** The desk is a GLB prop without names: an invisible box makes it a target. */
export const CONTACT_DESK = { position: [2.55, .95, -3.0] as [number, number, number], size: [.85, .5, 2.4] as [number, number, number] };
