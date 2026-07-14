import { describe, expect, it } from 'vitest';
import { MODULE_IDS } from '../src/constants';
import { moduleSchema, MODULE_REGISTRY, getModule, listModules } from '../src/modules';

describe('modules', () => {
  it('has a valid, schema-conformant entry for every module id', () => {
    for (const id of MODULE_IDS) {
      expect(() => moduleSchema.parse(getModule(id))).not.toThrow();
    }
  });

  it('lists all 14 modules', () => {
    expect(listModules()).toHaveLength(MODULE_IDS.length);
  });

  it('marks exactly reception, waiting_area, open_workspace, and meeting_room as required', () => {
    const required = listModules()
      .filter((module) => module.priority === 'required')
      .map((module) => module.id)
      .sort();
    expect(required).toEqual(['meeting_room', 'open_workspace', 'reception', 'waiting_area'].sort());
  });

  it('rejects a module with both minAreaSqm and areaPerOccupantSqm set', () => {
    expect(() =>
      moduleSchema.parse({
        ...MODULE_REGISTRY.reception,
        minAreaSqm: 20,
        areaPerOccupantSqm: 6,
      }),
    ).toThrow();
  });

  it('rejects a module with neither minAreaSqm nor areaPerOccupantSqm set', () => {
    const rest: Record<string, unknown> = { ...MODULE_REGISTRY.reception };
    delete rest.minAreaSqm;
    expect(() => moduleSchema.parse(rest)).toThrow();
  });
});
