import type { Scene } from '@command-center/ai-renderer';
import { SPATIAL_RULES } from '@command-center/workplace-design-system';

export type SceneReadinessLevel = 'pass' | 'warning';

export interface SceneReadinessIssue {
  id: string;
  level: SceneReadinessLevel;
  message: string;
}

export function evaluateSceneReadiness(scene: Scene): SceneReadinessIssue[] {
  const issues: SceneReadinessIssue[] = [];
  const desks = scene.objects.filter((object) => object.asset === 'desk').length;
  const chairs = scene.objects.filter((object) => object.asset === 'chair').length;
  const meetingRooms = scene.objects.filter((object) => object.asset === 'meeting_room').length;
  const hasReception = scene.objects.some((object) => object.asset === 'reception');
  const office = scene.objects.find((object) => object.asset === 'office');

  if (!office) issues.push({ id: 'office-shell', level: 'warning', message: 'Falta el perímetro principal de la oficina.' });
  if (!hasReception) issues.push({ id: 'reception', level: 'warning', message: 'Falta una recepción para el flujo de llegada.' });
  if (desks > chairs) issues.push({ id: 'chairs', level: 'warning', message: `Faltan ${desks - chairs} sillas para los puestos creados.` });
  if (desks > 0 && meetingRooms < Math.ceil(desks / SPATIAL_RULES.planning.peoplePerMeetingRoom)) {
    issues.push({ id: 'meeting-rooms', level: 'warning', message: 'La cantidad de salas es menor a la recomendación para los puestos actuales.' });
  }

  if (office) {
    const halfSize = office.transform.scale * 5;
    const outside = scene.objects.filter((object) => object.id !== office.id && (
      Math.abs(object.transform.position.x - office.transform.position.x) > halfSize
      || Math.abs(object.transform.position.z - office.transform.position.z) > halfSize
    )).length;
    if (outside > 0) issues.push({ id: 'bounds', level: 'warning', message: `${outside} activo(s) están fuera del perímetro de la oficina.` });
  }

  return issues;
}
