import { PROJECTS } from '../../data/projects';
import { MILESTONES } from '../../data/mission-log';

import { computeEvidence } from './evidence-engine';
import type { Evidence } from './evidence.types';

export function getEvidence(): Evidence {
  return computeEvidence(PROJECTS, MILESTONES);
}
