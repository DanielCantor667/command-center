import { drokex } from './drokex';
import { academy } from './academy';
import { commandCenter } from './command-center';
import { kliniu } from './kliniu';
import { vevi } from './vevi';
import { intranetEss } from './intranet-ess';
import { lorigine } from './lorigine';
import type { Project } from './project.types';

export const PROJECTS: readonly Project[] = [
  commandCenter,
  kliniu,
  vevi,
  intranetEss,
  lorigine,
  academy,
  drokex,
];
