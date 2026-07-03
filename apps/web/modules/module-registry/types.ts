import type { ComponentType } from 'react';
import type { WorkspaceModule } from '../../shell/workspace-store';

export type ModuleComponent = ComponentType;
export type ModuleRegistry = Readonly<Record<WorkspaceModule, ModuleComponent>>;
