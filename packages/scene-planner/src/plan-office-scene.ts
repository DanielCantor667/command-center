import { sceneSchema, type AssetId, type Scene, type SceneObject } from '@command-center/ai-renderer';
import { getPlanningPreset, getStyle, SPATIAL_RULES, type StyleId } from '@command-center/workplace-design-system';

export interface OfficeSceneRequest {
  occupants: number;
  style?: StyleId;
  id?: string;
  name?: string;
}

export interface OfficeScenePlan {
  scene: Scene;
  presetId: string;
  style: StyleId;
  estimatedAreaSqm: number;
}

function asset(id: string, assetId: AssetId, x: number, z: number, rotationY = 0, scale = 1): SceneObject {
  return {
    id,
    asset: assetId,
    transform: { position: { x, y: 0, z }, rotation: { x: 0, y: rotationY, z: 0 }, scale },
    properties: {},
  };
}

function ceilRatio(value: number, ratio: number): number {
  return Math.max(1, Math.ceil(value / ratio));
}

/**
 * Turns a business-sized office request into a deterministic, editable scene.
 * It deliberately uses only the version-1 asset catalog; richer asset mapping
 * belongs in the future asset-library sprint.
 */
export function planOfficeScene(request: OfficeSceneRequest): OfficeScenePlan {
  if (!Number.isInteger(request.occupants) || request.occupants < 1) {
    throw new Error('occupants must be a positive integer');
  }

  const preset = [
    getPlanningPreset('small_office'),
    getPlanningPreset('medium_office'),
    getPlanningPreset('large_office'),
    getPlanningPreset('enterprise'),
  ].find((candidate) => candidate && request.occupants >= candidate.minOccupants && (candidate.maxOccupants === null || request.occupants <= candidate.maxOccupants));

  if (!preset) throw new Error('no planning preset matches the requested occupants');

  const style = request.style ?? preset.targetStyle ?? 'corporate_standard';
  const styleDefinition = getStyle(style);
  const meetingRoomCount = ceilRatio(request.occupants, SPATIAL_RULES.planning.peoplePerMeetingRoom);
  const phoneBoothCount = request.occupants >= 11 ? ceilRatio(request.occupants, SPATIAL_RULES.planning.peoplePerPhoneBooth) : 0;
  const deskColumns = Math.min(8, Math.ceil(Math.sqrt(request.occupants)));
  const officeWidth = Math.max(16, deskColumns * 2.4 + 8);
  const officeDepth = Math.max(14, Math.ceil(request.occupants / deskColumns) * 2.6 + 10);
  const objects: SceneObject[] = [asset('office-shell', 'office', 0, 0, 0, Math.max(officeWidth, officeDepth) / 10)];

  objects.push(asset('reception', 'reception', -officeWidth / 2 + 2.5, -officeDepth / 2 + 2.5));
  objects.push(asset('reception-plant', 'tree', -officeWidth / 2 + 1, -officeDepth / 2 + 1.2, 0, 0.45));

  for (let index = 0; index < request.occupants; index += 1) {
    const column = index % deskColumns;
    const row = Math.floor(index / deskColumns);
    const x = -((deskColumns - 1) * 1.25) + column * 2.5;
    const z = -officeDepth / 2 + 6 + row * 2.6;
    objects.push(asset(`desk-${index + 1}`, 'desk', x, z));
    objects.push(asset(`chair-${index + 1}`, 'chair', x, z + 0.9, Math.PI));
    if (index % 2 === 0) objects.push(asset(`computer-${index + 1}`, 'computer', x, z - 0.2, 0, 0.55));
  }

  for (let index = 0; index < meetingRoomCount; index += 1) {
    const x = officeWidth / 2 - 2.6;
    const z = -officeDepth / 2 + 3.5 + index * 4;
    objects.push(asset(`meeting-room-${index + 1}`, 'meeting_room', x, z, 0, 1.5));
  }

  for (let index = 0; index < phoneBoothCount; index += 1) {
    objects.push(asset(`phone-booth-${index + 1}`, 'rack', -officeWidth / 2 + 2, officeDepth / 2 - 2 - index * 1.8, 0, 0.7));
  }

  if (preset.recommendedModules.includes('cafeteria')) {
    objects.push(asset('cafeteria', 'meeting_room', officeWidth / 2 - 3, officeDepth / 2 - 3, 0, 1.8));
  }
  if (preset.recommendedModules.includes('server_room')) {
    objects.push(asset('server-rack', 'rack', -officeWidth / 2 + 2, officeDepth / 2 - 2, 0, 0.9));
  }
  objects.push(asset('feature-tree', 'tree', officeWidth / 2 - 1.5, 0, 0, 0.65));

  const scene = sceneSchema.parse({
    version: 1,
    id: request.id ?? `office-${request.occupants}-${style}`,
    metadata: { name: request.name ?? `${styleDefinition.label} · ${request.occupants} people` },
    objects,
  });

  return {
    scene,
    presetId: preset.id,
    style,
    estimatedAreaSqm: Math.round(officeWidth * officeDepth),
  };
}
