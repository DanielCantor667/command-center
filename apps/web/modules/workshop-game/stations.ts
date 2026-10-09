import type { WorldCameraSnapshot } from './world-state';
export type StationId = 'technologies' | 'trajectory' | 'contact';
export interface WorkshopStation {
  id: StationId; name: string; label: string; description: string;
  hotspot: [number, number, number]; view: WorldCameraSnapshot;
}
export const STATIONS: Record<StationId, WorkshopStation> = {
  technologies: { id: 'technologies', name: 'Tecnologías', label: 'Explorar tecnologías', description: 'Herramientas del taller y los proyectos en los que las utilizo.', hotspot: [-8.64, 1.65, 1.55], view: { position: [-6.8, 1.65, 1.55], target: [-9.14, 1.6, 1.55] } },
  trajectory: { id: 'trajectory', name: 'Trayectoria', label: 'Ver trayectoria', description: 'Experiencia, formación e idiomas documentados en mi perfil.', hotspot: [-8.1, 1.65, -2.3], view: { position: [-7.7, 1.65, .8], target: [-8.1, 1.55, -2.65] } },
  contact: { id: 'contact', name: 'Contacto', label: 'Ver contacto', description: 'Conversemos sobre tu próximo producto o proyecto.', hotspot: [6.7, 1.62, 1.9], view: { position: [6.7, 1.65, 2.7], target: [6.7, 1.3, 1.45] } },
};
export function stationForPoint(point: string): StationId | null {
  return Object.hasOwn(STATIONS, point) ? point as StationId : null;
}
