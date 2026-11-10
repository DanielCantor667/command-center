import { PORTFOLIO_TECHNOLOGIES } from '../../data/portfolio-technologies';
import { LAB_ANCHORS, type LabAnchor } from './lab-anchors';
import { plateCentre } from './technology-shelf';

/** What the visitor is pointing at: a screen on the project wall or a plate on the technology board. */
export type LabFocus = { kind: 'project'; id: string; anchor?: LabAnchor } | { kind: 'technology'; id: string } | null;

/** Everything lit by a focus: the item itself plus its recorded relations (technology.projectIds). */
export function focusRelations(focus: LabFocus): { projects: Set<string>; technologies: Set<string> } {
  if (!focus) return { projects: new Set(), technologies: new Set() };
  if (focus.kind === 'project') {
    return { projects: new Set([focus.id]), technologies: new Set(PORTFOLIO_TECHNOLOGIES.filter(tech => tech.projectIds.includes(focus.id)).map(tech => tech.id)) };
  }
  const technology = PORTFOLIO_TECHNOLOGIES.find(tech => tech.id === focus.id);
  return { projects: new Set(technology?.projectIds ?? []), technologies: new Set([focus.id]) };
}

/**
 * Where a helper drone hovers to look at the focus: a little off its wall and to one side, never in
 * front of it, towards the outer end of the wall (fewer neighbours to cover).
 */
const STAND_OFF = .5;
const SIDE = .75;
const WALL_MIDDLE = { projects: -2.4, technologies: -2.6 };
export function focusViewpoint(focus: LabFocus): [number, number, number] | null {
  if (!focus) return null;
  if (focus.kind === 'technology') {
    const plate = plateCentre(focus.id);
    if (!plate) return null;
    return [plate[0] + STAND_OFF, plate[1], plate[2] + (plate[2] >= WALL_MIDDLE.technologies ? SIDE : -SIDE)];
  }
  const screen = focus.anchor ?? LAB_ANCHORS[`screen_${focus.id}`];
  if (!screen) return null;
  const [x, y, z] = screen.position;
  // A plane's front faces (sin r, 0, cos r) for a rotation r around Y.
  const normalX = Math.sin(screen.rotationY), normalZ = Math.cos(screen.rotationY);
  if (focus.anchor && Math.abs(normalZ) > Math.abs(normalX)) {
    return [x + normalX * STAND_OFF + (x >= 0 ? SIDE : -SIDE), y, z + normalZ * STAND_OFF];
  }
  return [x + normalX * STAND_OFF, y, z + normalZ * STAND_OFF + (z >= WALL_MIDDLE.projects ? SIDE : -SIDE)];
}
