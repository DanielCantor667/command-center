import { describe, expect, it } from 'vitest';
import { MODULE_IDS } from '../src/constants';
import { moduleRelationSchema, MODULE_RELATIONS, getModuleRelations, listModuleRelations } from '../src/module-relations';

describe('module relations', () => {
  it('has a valid, schema-conformant entry for every module id', () => {
    for (const id of MODULE_IDS) {
      expect(() => moduleRelationSchema.parse(getModuleRelations(id))).not.toThrow();
    }
  });

  it('lists all 14 relation entries', () => {
    expect(listModuleRelations()).toHaveLength(MODULE_IDS.length);
  });

  it('never lists a module as adjacent or to-avoid to itself', () => {
    for (const relation of listModuleRelations()) {
      expect(relation.adjacentTo).not.toContain(relation.id);
      expect(relation.avoidAdjacentTo).not.toContain(relation.id);
    }
  });

  it('never lists the same neighbor in both adjacentTo and avoidAdjacentTo', () => {
    for (const relation of listModuleRelations()) {
      const overlap = relation.adjacentTo.filter((id) => relation.avoidAdjacentTo.includes(id));
      expect(overlap).toEqual([]);
    }
  });

  it('keeps server_room away from break_room, meeting_room, and cafeteria', () => {
    const serverRoom = getModuleRelations('server_room');
    expect(serverRoom.avoidAdjacentTo).toEqual(
      expect.arrayContaining(['break_room', 'meeting_room', 'cafeteria']),
    );
  });
});
