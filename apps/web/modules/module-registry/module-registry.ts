import { CapabilitiesModule } from '../capabilities';
import { CommunicationModule } from '../communication';
import { DashboardModule } from '../dashboard';
import { LabModule } from '../lab';
import { MissionModule } from '../mission';
import { AnalyticsModule } from '../analytics';
import { ProfileModule } from '../profile';
import { ProjectsModule } from '../projects';
import type { ModuleRegistry } from './types';

export const MODULE_REGISTRY: ModuleRegistry = {
  dashboard: DashboardModule,
  profile: ProfileModule,
  projects: ProjectsModule,
  mission: MissionModule,
  analytics: AnalyticsModule,
  capabilities: CapabilitiesModule,
  lab: LabModule,
  communication: CommunicationModule,
};
