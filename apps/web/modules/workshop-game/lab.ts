import type { Patrol } from './lab-patrol';
/** Robotics lab assets (specs/workshop-lab.md), exported by blender/bake_workshop_lab.py + compress_workshop_lab.sh. */
export const labUrl = (name: string) => `/models/workshop-lab/${name}-v1.glb`;
/** Baked room + neon/sky: the world fails without them. Plants and actors are optional decoration. */
export const LAB_ESSENTIAL_URLS = [labUrl('lab-baked'), labUrl('lab-emissive')];
export const LAB_PLANTS_URL = labUrl('lab-plants');
/**
 * Placed in the GLB itself (world transform kept on export). Drones are not baked, so `offset` moves them
 * clear of the camera paths: the K07 above the repair table, the Mech Drone up by the back shelves.
 * `follows`: flies in front of the focused screen or plate. `looks`: turns its head towards it.
 */
export interface LabActor { id: string; hover: boolean; follows: boolean; looks: boolean; offset: [number, number, number]; patrol?: Patrol }
export const LAB_ACTORS: LabActor[] = [
  { id: 'robot-cobot', hover: false, follows: false, looks: false, offset: [0, 0, 0] },
  { id: 'drone-k07', hover: true, follows: true, looks: false, offset: [-1.15, .6, 1.55] },
  { id: 'drone-mech', hover: true, follows: false, looks: false, offset: [.45, .85, -2.2] },
  { id: 'cat', hover: false, follows: false, looks: true, offset: [0, 0, 0] },
  // Walkers: the pivot sits at the model's centre and the web places it on the route, wherever the GLB was exported.
  // Routes are the model centre on the floor, measured against the baked footprints (aisle between the plants and the Drokex corner,
  // the strip left of the repair table, the front-left gap); they never cross each other. `turn` aligns each model's front.
  { id: 'robot-humanoid', hover: false, follows: false, looks: false, offset: [0, 0, 0], patrol: { points: [[-.3, -2.6], [.75, -2.6], [.75, -3.3], [-.3, -3.3]], speed: .35, loop: true, turn: 0 } },
  { id: 'robot-quad', hover: false, follows: false, looks: false, offset: [0, 0, 0], patrol: { points: [[-1.65, -.8], [-1.65, -2.4]], speed: .3, loop: false, turn: 0 } },
  { id: 'robot-trilobite', hover: false, follows: false, looks: false, offset: [0, 0, 0], patrol: { points: [[-1.9, .6], [-.6, .6]], speed: .25, loop: false, turn: 0 } },
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
