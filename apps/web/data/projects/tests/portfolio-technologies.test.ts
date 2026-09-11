import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../../projects';
import {
  filterTechnologies,
  normalizeTechnology,
  PORTFOLIO_TECHNOLOGIES,
  TECHNOLOGY_CATEGORIES,
} from '../../portfolio-technologies';

describe('Portfolio technology evidence', () => {
  it('normalizes aliases, case, accents and punctuation when searching', () => {
    expect(normalizeTechnology('NÓDE.js')).toBe('nodejs');
    expect(filterTechnologies('  POSTGRES ').map((item) => item.id)).toContain('postgresql');
    expect(filterTechnologies('tailwindcss').map((item) => item.id)).toEqual(['tailwind']);
    expect(filterTechnologies('testing').map((item) => item.id)).toEqual(['playwright']);
  });

  it('combines categories with search and retains a useful empty state', () => {
    expect(filterTechnologies('', 'languages').map((item) => item.name)).toEqual([
      'TypeScript',
      'JavaScript',
      'PHP',
      'Python',
      'SQL',
    ]);
    expect(filterTechnologies('React', 'data')).toEqual([]);
    expect(filterTechnologies('no-such-tool')).toEqual([]);
    expect(filterTechnologies('')).toHaveLength(PORTFOLIO_TECHNOLOGIES.length);
  });

  it('only links existing public projects and declared categories', () => {
    const ids = PORTFOLIO_TECHNOLOGIES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const technology of PORTFOLIO_TECHNOLOGIES) {
      expect(TECHNOLOGY_CATEGORIES.some((category) => category.id === technology.category)).toBe(
        true,
      );
      for (const id of technology.projectIds)
        expect(PROJECTS.some((project) => project.public && project.id === id)).toBe(true);
    }
  });

  it('does not invent a project for CV-only tools and includes documented Drokex work', () => {
    expect(PORTFOLIO_TECHNOLOGIES.find((item) => item.id === 'python')).toMatchObject({
      projectIds: [],
      source: 'cv',
    });
    expect(PORTFOLIO_TECHNOLOGIES.find((item) => item.id === 'threejs')?.projectIds).toContain(
      'drokex',
    );
  });
});
