import { CapabilitiesModule } from '../capabilities';
import { CommunicationModule } from '../communication';
import { DashboardModule } from '../dashboard';
import { LabModule } from '../lab';
import { MissionModule } from '../mission';
import { ProfileModule } from '../profile';
import { ProjectsModule } from '../projects';
import type { ModuleRegistry } from './types';

export const MODULE_REGISTRY: ModuleRegistry = {
  dashboard: DashboardModule,
  profile: ProfileModule,
  projects: ProjectsModule,
  mission: MissionModule,
  capabilities: CapabilitiesModule,
  lab: LabModule,
  communication: CommunicationModule,
};
