import { roomForPoint, WORKSHOP_ROOMS, type RoomId } from './rooms';
import { STATIONS, type StationId } from './stations';
export type WorldPoint = 'entrance' | 'hub' | 'workbench' | RoomId | StationId;
export interface WorldCameraSnapshot { position: [number, number, number]; target: [number, number, number] }
export interface GameSnapshot { point: WorldPoint; camera: WorldCameraSnapshot | null }
export interface WorldState {
  status: 'landing' | 'loading' | 'room-loading' | 'room-error' | 'moving' | 'exploring' | 'error';
  point: WorldPoint; destination: WorldPoint; token: number;
  activeRoom: RoomId | null; pendingRoom: RoomId | null;
}
export type WorldEvent = { type: 'start' | 'cancel' | 'retry-room' }
  | { type: 'ready' | 'arrived' | 'failed'; token: number }
  | { type: 'room-ready' | 'room-failed'; room: RoomId; token: number }
  | { type: 'go'; point: WorldPoint };
export const WORLD_VIEWS: Record<WorldPoint, WorldCameraSnapshot> = {
  entrance: { position: [-1.8, 1.65, 14], target: [-.5, 1.6, -4] },
  hub: { position: [0, 1.65, 5.1], target: [0, 1.5, -5.5] },
  workbench: { position: [.8, 1.65, 2.3], target: [-.6, 1.15, -.9] },
  kliniu: WORKSHOP_ROOMS.kliniu.view, lorigine: WORKSHOP_ROOMS.lorigine.view,
  academy: WORKSHOP_ROOMS.academy.view, drokex: WORKSHOP_ROOMS.drokex.view,
  technologies: STATIONS.technologies.view, trajectory: STATIONS.trajectory.view, contact: STATIONS.contact.view,
};
export function initialWorldState(snapshot?: GameSnapshot): WorldState {
  const point = snapshot?.point ?? 'entrance';
  return { status: snapshot ? 'exploring' : 'landing', point, destination: point, token: 0, activeRoom: roomForPoint(point), pendingRoom: null };
}
export function worldReducer(state: WorldState, event: WorldEvent): WorldState {
  switch (event.type) {
    case 'start': return { ...initialWorldState(), status: 'loading', token: state.token + 1 };
    case 'ready': return state.status === 'loading' && state.token === event.token ? { ...state, status: 'moving', destination: 'hub' } : state;
    case 'failed': return state.token === event.token && state.status !== 'landing' ? { ...state, status: 'error' } : state;
    case 'go': {
      if (!['exploring', 'moving', 'room-loading', 'room-error'].includes(state.status)) return state;
      if (state.status === 'exploring' && state.point === event.point) return state;
      const room = roomForPoint(event.point);
      return { ...state, status: room && room !== state.activeRoom ? 'room-loading' : 'moving', destination: event.point, pendingRoom: room && room !== state.activeRoom ? room : null, token: state.token + 1 };
    }
    case 'room-ready': return state.status === 'room-loading' && state.token === event.token && state.pendingRoom === event.room ? { ...state, status: 'moving' } : state;
    case 'room-failed': {
      if (state.token !== event.token) return state;
      const pending = (state.status === 'room-loading' || state.status === 'moving') && state.pendingRoom === event.room;
      const active = state.status === 'exploring' && state.activeRoom === event.room;
      if (!pending && !active) return state;
      return { ...state, status: 'room-error', pendingRoom: event.room, destination: event.room };
    }
    case 'retry-room': return state.status === 'room-error' ? { ...state, status: 'room-loading', token: state.token + 1 } : state;
    case 'arrived': return state.status === 'moving' && state.token === event.token ? { ...state, status: 'exploring', point: state.destination, activeRoom: roomForPoint(state.destination), pendingRoom: null } : state;
    case 'cancel': return { ...state, status: state.point === 'entrance' ? 'landing' : 'exploring', destination: state.point, token: state.token + 1, pendingRoom: null };
  }
}
