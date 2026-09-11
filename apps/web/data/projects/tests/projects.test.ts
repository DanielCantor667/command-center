import { describe, expect, it } from 'vitest';

import { PROJECT_STATUS, TECHNOLOGY_KIND, TECHNOLOGY_LEVEL } from '../project.enums';
import { projectSchema, technologySchema } from '../project.schema';
import type { Project } from '../project.types';
import { PROJECTS } from '../projects';

const validProject: Project = {
  id: 'sample-project',
  slug: 'sample-project',
  name: 'Sample Project',
  tagline: 'A sample tagline',
  summary: 'A sample summary.',
  description: 'A sample description.',
  status: PROJECT_STATUS.Development,
  featured: false,
  public: true,
  startedAt: '2026-01-01',
  completedAt: null,
  lastUpdated: '2026-07-03',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Proficient },
  ],
  architecture: ['monorepo'],
  features: [{ title: 'Feature', description: 'Feature description.' }],
  challenges: [{ title: 'Challenge', description: 'Challenge description.' }],
  engineeringDecisions: [
    {
      title: 'Why TypeScript',
      context: 'Context.',
      decision: 'Decision.',
      reasoning: 'Reasoning.',
      impact: 'high',
    },
  ],
  lessonsLearned: [
    { title: 'Lesson', description: 'Lesson description.', category: 'architecture' },
  ],
  metrics: {
    commits: 10,
    contributors: 1,
    durationWeeks: 4,
    modules: 2,
    tests: 20,
    coverage: 80,
  },
  media: [
    {
      type: 'image',
      url: 'https://example.com/screenshot.png',
      alt: 'Screenshot',
      featured: true,
    },
  ],
  links: { repository: 'https://example.com/repo' },
  role: { title: 'Engineer', responsibilities: ['Everything'] },
  tags: ['sample'],
  relationships: { relatedProjects: [], relatedArticles: [], relatedSkills: [] },
  metadata: { version: 1 },
  ownership: { type: 'personal', confidential: false },
};

describe('projectSchema', () => {
  it('accepts a valid project', () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true);
  });

  it('rejects an invalid slug', () => {
    const result = projectSchema.safeParse({ ...validProject, slug: 'Invalid Slug!' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status', () => {
    const result = projectSchema.safeParse({ ...validProject, status: 'launched' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid date format', () => {
    const result = projectSchema.safeParse({ ...validProject, startedAt: '01/01/2026' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid link URL', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      links: { repository: 'not-a-url' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing engineeringDecisions field', () => {
    const withoutDecisions: Record<string, unknown> = { ...validProject };
    delete withoutDecisions.engineeringDecisions;
    expect(projectSchema.safeParse(withoutDecisions).success).toBe(false);
  });

  it('rejects a missing lessonsLearned field', () => {
    const withoutLessons: Record<string, unknown> = { ...validProject };
    delete withoutLessons.lessonsLearned;
    expect(projectSchema.safeParse(withoutLessons).success).toBe(false);
  });

  it('rejects a metadata version other than 1', () => {
    const result = projectSchema.safeParse({ ...validProject, metadata: { version: 2 } });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid ownership type', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      ownership: { type: 'open-source', confidential: false },
    });
    expect(result.success).toBe(false);
  });

  it('rejects coverage above 100', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      metrics: { ...validProject.metrics, coverage: 120 },
    });
    expect(result.success).toBe(false);
  });
});

describe('technologySchema', () => {
  it('rejects an unknown kind', () => {
    const result = technologySchema.safeParse({
      name: 'TypeScript',
      kind: 'runtime',
      level: 'expert',
    });
    expect(result.success).toBe(false);
  });
});

describe('PROJECTS repository', () => {
  it('contains the original projects and Drokex', () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(3);
    expect(PROJECTS.map((project) => project.id)).toContain('drokex');
  });

  it('every project satisfies the domain contract', () => {
    for (const project of PROJECTS) {
      const result = projectSchema.safeParse(project);
      expect(result.success, `Project "${project.id}" violates the schema`).toBe(true);
    }
  });

  it('has unique ids', () => {
    const ids = PROJECTS.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique slugs', () => {
    const slugs = PROJECTS.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('only references existing project ids in relationships', () => {
    const ids = new Set(PROJECTS.map((project) => project.id));
    for (const project of PROJECTS) {
      for (const relatedId of project.relationships.relatedProjects) {
        expect(ids.has(relatedId), `Unknown related project "${relatedId}"`).toBe(true);
      }
    }
  });
});
