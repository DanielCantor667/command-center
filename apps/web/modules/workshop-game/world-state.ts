import { STATIONS, type StationId } from './stations';
/** Projects with their own booth and screen (specs/workshop-lab.md E.2, E.4), in the order the tour walks them:
 * from the projects wall down the right side of the aisle and back up the left. */
export const CORNER_PROJECTS = ['lorigine', 'drokex', 'kliniu', '4ustudio-academy'] as const;
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
  entrance: { position: [.3, 1.6, 5.6], target: [-.2, 1.15, -4.0] },
  hub: { position: [.3, 1.6, 4.6], target: [-.2, 1.15, -4.0] },
  // Leave space for the project list while keeping the four wall screens in view.
  projects: { position: [.8, 1.6, -2.45], target: [3.95, 2.15, -1.95] },
  // Each booth is seen from across the aisle, its screen and props together; lab coordinates are (x, up, -blender y).
  'corner-4ustudio-academy': { position: [.5, 1.5, 1.0], target: [-4, 1.3, 2.0] },
  'corner-drokex': { position: [-.5, 1.5, 3.7], target: [4, 1.2, 4.75] },
  'corner-lorigine': { position: [-.5, 1.5, 1.0], target: [4, 1.3, 2.0] },
  'corner-kliniu': { position: [.5, 1.5, 3.7], target: [-4, 1.2, 4.75] },
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
