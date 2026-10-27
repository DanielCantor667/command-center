import { STATIONS, type StationId } from './stations';
/** Projects with their own corner and screen (specs/workshop-lab.md E.2), in the order the tour walks them. */
export const CORNER_PROJECTS = ['4ustudio-academy', 'drokex', 'lorigine', 'kliniu'] as const;
export type CornerPoint = `corner-${(typeof CORNER_PROJECTS)[number]}`;
export type WorldPoint = 'entrance' | 'hub' | 'projects' | CornerPoint | StationId;
export const cornerPoint = (projectId: string): CornerPoint | null => (CORNER_PROJECTS as readonly string[]).includes(projectId) ? `corner-${projectId}` as CornerPoint : null;
export const cornerProject = (point: WorldPoint): string | null => point.startsWith('corner-') ? point.slice('corner-'.length) : null;
export interface WorldCameraSnapshot { position: [number, number, number]; target: [number, number, number] }
export interface GameSnapshot { point: WorldPoint; camera: WorldCameraSnapshot | null }
export interface WorldState {
  status: 'landing' | 'loading' | 'moving' | 'exploring' | 'error';
  point: WorldPoint; destination: WorldPoint; token: number;
}
export type WorldEvent = { type: 'start' | 'cancel' }
  | { type: 'ready' | 'arrived' | 'failed'; token: number }
  | { type: 'go'; point: WorldPoint };
/** One closed lab (specs/workshop-lab.md); the front wall is open, the entrance is a short dolly in. */
export const WORLD_VIEWS: Record<WorldPoint, WorldCameraSnapshot> = {
  entrance: { position: [.95, 1.6, 2.9], target: [-.2, 1.15, -2.6] },
  hub: { position: [1.0, 1.55, 2.2], target: [-.2, 1.15, -2.6] },
  // Low enough that the hanging lamp stays above the line of sight to the top row of screens.
  projects: { position: [.4, 1.6, -2.45], target: [2.95, 2.15, -2.45] },
  // Each corner is seen from mid-room, its screen and props together, off the line of the hanging lamps; lab coordinates are (x, up, -blender y).
  'corner-4ustudio-academy': { position: [.8, 1.5, 1.3], target: [-3, 1.3, 2.45] },
  'corner-drokex': { position: [1.6, 1.5, -.2], target: [.6, 1.3, 4.1] },
  'corner-lorigine': { position: [-.8, 1.5, 3.0], target: [3, 1.3, 3.0] },
  'corner-kliniu': { position: [-.8, 1.5, 1.1], target: [3, 1.3, 1.1] },
  technologies: STATIONS.technologies.view, trajectory: STATIONS.trajectory.view, contact: STATIONS.contact.view,
};
export function initialWorldState(snapshot?: GameSnapshot): WorldState {
  const point = snapshot?.point ?? 'entrance';
  return { status: snapshot ? 'exploring' : 'landing', point, destination: point, token: 0 };
}
export function worldReducer(state: WorldState, event: WorldEvent): WorldState {
  switch (event.type) {
    case 'start': return { ...initialWorldState(), status: 'loading', token: state.token + 1 };
    case 'ready': return state.status === 'loading' && state.token === event.token ? { ...state, status: 'moving', destination: 'hub' } : state;
    case 'failed': return state.token === event.token && state.status !== 'landing' ? { ...state, status: 'error' } : state;
    case 'go':
      if (state.status !== 'exploring' && state.status !== 'moving') return state;
      if (state.status === 'exploring' && state.point === event.point) return state;
      return { ...state, status: 'moving', destination: event.point, token: state.token + 1 };
    case 'arrived': return state.status === 'moving' && state.token === event.token ? { ...state, status: 'exploring', point: state.destination } : state;
    case 'cancel': return { ...state, status: state.point === 'entrance' ? 'landing' : 'exploring', destination: state.point, token: state.token + 1 };
  }
}
