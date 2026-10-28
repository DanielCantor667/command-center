import type { WorldCameraSnapshot } from './world-state';
export type StationId = 'technologies' | 'trajectory' | 'contact';
export interface WorkshopStation {
  id: StationId; name: string; label: string; description: string;
  hotspot: [number, number, number]; view: WorldCameraSnapshot;
}
/** Lab coordinates (specs/workshop-lab.md): pegboard on the left wall, whiteboard on the back wall, desk on the right. */
export const STATIONS: Record<StationId, WorkshopStation> = {
  technologies: { id: 'technologies', name: 'Tecnologías', label: 'Explorar tecnologías', description: 'Herramientas del taller y los proyectos en los que las utilizo.', hotspot: [-3.7, 2.7, -2.6], view: { position: [-1.9, 1.9, -2.6], target: [-3.95, 1.95, -2.6] } },
  trajectory: { id: 'trajectory', name: 'Trayectoria', label: 'Ver trayectoria', description: 'Experiencia, formación e idiomas documentados en mi perfil.', hotspot: [0, 2.0, -4.75], view: { position: [.3, 1.55, -3.9], target: [.3, 1.55, -4.9] } },
  contact: { id: 'contact', name: 'Contacto', label: 'Ver contacto', description: 'Conversemos sobre tu próximo producto o proyecto.', hotspot: [3.55, 1.6, -3.0], view: { position: [2.3, 1.45, -2.4], target: [3.9, 1.05, -3.2] } },
};
export function stationForPoint(point: string): StationId | null {
  return Object.hasOwn(STATIONS, point) ? point as StationId : null;
}
