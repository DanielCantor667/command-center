import { describe, expect, it } from 'vitest';
import { WORKSPACE_MODULES } from '../../../shell/workspace-store';
import { MODULE_REGISTRY } from '../module-registry';

describe('MODULE_REGISTRY', () => {
  it('registers a component for every workspace module', () => {
    for (const workspaceModule of WORKSPACE_MODULES) {
      expect(MODULE_REGISTRY[workspaceModule.id]).toBeTypeOf('function');
    }
  });
});
