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
  it('uses the hovered gallery or relocated screen instead of the old project anchor', () => {
    const gallery = { position: [3.88, 2.03, -3.78] as [number, number, number], rotationY: Math.PI * 1.5, size: [.7, .44] as [number, number] };
    const moved = { position: [-.7, 2.7, 6.035] as [number, number, number], rotationY: Math.PI, size: [.62, .39] as [number, number] };
    const galleryTarget = focusViewpoint({ kind: 'project', id: 'kliniu', anchor: gallery })!;
    expect(galleryTarget[0]).toBeCloseTo(3.38);
    expect(galleryTarget[1]).toBeCloseTo(2.03);
    expect(galleryTarget[2]).toBeCloseTo(-4.53);
    const movedTarget = focusViewpoint({ kind: 'project', id: 'command-center', anchor: moved })!;
    expect(movedTarget[0]).toBeCloseTo(-1.45);
    expect(movedTarget[1]).toBeCloseTo(2.7);
    expect(movedTarget[2]).toBeCloseTo(5.535);
  });
});
