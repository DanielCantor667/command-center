import { describe, expect, it } from 'vitest';
import { PORTFOLIO_TECHNOLOGIES } from '../../../data/portfolio-technologies';
import { LAB_ANCHORS } from '../lab-anchors';
import { focusRelations, focusViewpoint } from '../lab-focus';

describe('lab focus', () => {
  it('lights a project and exactly the technologies recorded for it', () => {
    const { projects, technologies } = focusRelations({ kind: 'project', id: 'kliniu' });
    expect([...projects]).toEqual(['kliniu']);
    expect([...technologies].sort()).toEqual(PORTFOLIO_TECHNOLOGIES.filter(tech => tech.projectIds.includes('kliniu')).map(tech => tech.id).sort());
    expect(technologies.size).toBeGreaterThan(0);
  });
  it('lights a technology and the projects that use it, and nothing without a focus', () => {
    const used = PORTFOLIO_TECHNOLOGIES.find(tech => tech.projectIds.length > 0)!;
    const { projects, technologies } = focusRelations({ kind: 'technology', id: used.id });
    expect([...technologies]).toEqual([used.id]);
    expect([...projects].sort()).toEqual([...used.projectIds].sort());
    expect(focusRelations(null).projects.size + focusRelations(null).technologies.size).toBe(0);
  });
  it('places the drone off the focused wall and beside the item, not between it and the camera', () => {
    const anchor = LAB_ANCHORS['screen_kliniu']!;
    const screen = focusViewpoint({ kind: 'project', id: 'kliniu' })!;
    // Kliniu's screen hangs on the left wall: the drone stays 0.4-0.6 m into the room from it.
    expect(screen[0] - anchor.position[0]).toBeGreaterThan(.4); expect(screen[0] - anchor.position[0]).toBeLessThan(.6);
    expect(Math.abs(screen[2] - anchor.position[2])).toBeGreaterThan(anchor.size[0] / 2);
    const plate = focusViewpoint({ kind: 'technology', id: 'typescript' })!;
    expect(plate[0]).toBeGreaterThan(-3.5); expect(plate[0]).toBeLessThan(-3.3);
    expect(focusViewpoint(null)).toBeNull();
  });
});
