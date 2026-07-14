import { describe, expect, it } from 'vitest';
import { MILESTONES, MILESTONE_FILTER_OPTIONS, milestoneSchema } from '..';

const firstMilestone = MILESTONES[0];

describe('milestoneSchema', () => {
  it('accepts a valid milestone', () => {
    const result = milestoneSchema.safeParse(MILESTONES[0]);
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    if (!firstMilestone) return;
    const rest = { ...firstMilestone };
    delete (rest as { title?: string }).title;
    const result = milestoneSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects an invalid date format', () => {
    if (!firstMilestone) return;
    const result = milestoneSchema.safeParse({
      ...firstMilestone,
      date: '2026/07/01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid category', () => {
    if (!firstMilestone) return;
    const result = milestoneSchema.safeParse({
      ...firstMilestone,
      category: 'unknown',
    });
    expect(result.success).toBe(false);
  });

  it('rejects technologies with unknown kind', () => {
    if (!firstMilestone) return;
    const result = milestoneSchema.safeParse({
      ...firstMilestone,
      technologies: [{ name: 'Foo', kind: 'unknown', level: 'proficient' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid architecture pattern', () => {
    if (!firstMilestone) return;
    const result = milestoneSchema.safeParse({
      ...firstMilestone,
      architecture: ['not-a-pattern'],
    });
    expect(result.success).toBe(false);
  });
});

describe('MILESTONES repository', () => {
  it('contains between 3 and 5 milestones', () => {
    expect(MILESTONES.length).toBeGreaterThanOrEqual(3);
    expect(MILESTONES.length).toBeLessThanOrEqual(5);
  });

  it('every milestone satisfies the domain contract', () => {
    for (const milestone of MILESTONES) {
      const result = milestoneSchema.safeParse(milestone);
      expect(result.success).toBe(true);
    }
  });

  it('has unique ids', () => {
    const ids = MILESTONES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is sorted newest first', () => {
    const sorted = MILESTONES.every((m, i) => {
      if (i === 0) return true;
      const prev = MILESTONES[i - 1];
      return prev && prev.date >= m.date;
    });
    expect(sorted).toBe(true);
  });
});

describe('MILESTONE_FILTER_OPTIONS', () => {
  it('contains year options', () => {
    expect(MILESTONE_FILTER_OPTIONS.years.length).toBeGreaterThan(0);
  });

  it('contains architecture options', () => {
    expect(Array.isArray(MILESTONE_FILTER_OPTIONS.architectures)).toBe(true);
  });

  it('contains technology options', () => {
    expect(Array.isArray(MILESTONE_FILTER_OPTIONS.technologies)).toBe(true);
  });

  it('contains project options', () => {
    expect(Array.isArray(MILESTONE_FILTER_OPTIONS.projects)).toBe(true);
  });
});
