import { describe, expect, it } from 'vitest';

import {
  confidenceLevelSchema,
  capabilitySchema,
  technologyExperienceSchema,
  architectureProfileSchema,
  engineeringProfileSchema,
  learningProfileSchema,
  evidenceStatisticsSchema,
  evidenceSchema,
} from '../evidence.schema';
import type { Project } from '../../../data/projects';
import type { Milestone } from '../../../data/mission-log';
import { PROJECTS } from '../../../data/projects';
import { MILESTONES } from '../../../data/mission-log';
import { computeEvidence } from '../evidence-engine';

const emptyProjects: readonly Project[] = [];
const emptyMilestones: readonly Milestone[] = [];

const sampleProject: Project = {
  id: 'test-project',
  slug: 'test-project',
  name: 'Test Project',
  tagline: 'A test project',
  summary: 'Test summary.',
  description: 'Test description.',
  status: 'production',
  featured: true,
  public: true,
  startedAt: '2026-01-01',
  completedAt: null,
  lastUpdated: '2026-07-03',
  technologies: [
    { name: 'TypeScript', kind: 'language', level: 'proficient' },
    { name: 'React', kind: 'framework', level: 'proficient' },
    { name: 'PostgreSQL', kind: 'database', level: 'working' },
  ],
  architecture: ['monorepo', 'clean-architecture'],
  features: [{ title: 'Feature', description: 'Feature description.' }],
  challenges: [],
  engineeringDecisions: [
    {
      title: 'Decision 1',
      context: 'Context.',
      decision: 'Decision.',
      reasoning: 'Reasoning.',
      impact: 'high',
    },
    {
      title: 'Decision 2',
      context: 'Context.',
      decision: 'Decision.',
      reasoning: 'Reasoning.',
      impact: 'medium',
    },
  ],
  lessonsLearned: [
    { title: 'Lesson 1', description: 'Description.', category: 'architecture' },
    { title: 'Lesson 2', description: 'Description.', category: 'process' },
  ],
  metrics: {
    commits: null,
    contributors: null,
    durationWeeks: null,
    modules: null,
    tests: null,
    coverage: null,
  },
  media: [],
  links: {},
  role: { title: 'Engineer', responsibilities: [] },
  tags: ['test'],
  relationships: { relatedProjects: [], relatedArticles: [], relatedSkills: [] },
  metadata: { version: 1 },
  ownership: { type: 'personal', confidential: false },
};

const sampleMilestone: Milestone = {
  id: 'test-milestone',
  title: 'Test Milestone',
  date: '2026-06-01',
  category: 'learning-milestone',
  summary: 'Test milestone.',
  description: 'Test milestone description.',
  technologies: [
    { name: 'TypeScript', kind: 'language', level: 'proficient' },
    { name: 'React', kind: 'framework', level: 'working' },
  ],
  architecture: ['monorepo'],
  relatedProjects: ['test-project'],
  lessons: [
    { title: 'Milestone Lesson', description: 'Description.', category: 'architecture' },
  ],
  technicalDecisions: [
    {
      title: 'Milestone Decision',
      context: 'Context.',
      decision: 'Decision.',
      reasoning: 'Reasoning.',
      impact: 'high',
    },
  ],
  outcome: 'Success.',
};

describe('confidenceLevelSchema', () => {
  it.each(['low', 'medium', 'high'])('accepts "%s"', (level) => {
    expect(confidenceLevelSchema.safeParse(level).success).toBe(true);
  });

  it('rejects invalid confidence level', () => {
    expect(confidenceLevelSchema.safeParse('very-high').success).toBe(false);
  });
});

describe('capabilitySchema', () => {
  it('validates a valid capability', () => {
    const result = capabilitySchema.safeParse({
      name: 'Software Architecture',
      evidence: {
        projects: 2,
        architecturePatterns: 3,
        engineeringDecisions: 5,
        lessonsLearned: 4,
      },
      confidence: 'high',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative evidence counts', () => {
    const result = capabilitySchema.safeParse({
      name: 'Software Architecture',
      evidence: {
        projects: -1,
        architecturePatterns: 0,
        engineeringDecisions: 0,
        lessonsLearned: 0,
      },
      confidence: 'low',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = capabilitySchema.safeParse({
      name: '',
      evidence: {
        projects: 0,
        architecturePatterns: 0,
        engineeringDecisions: 0,
        lessonsLearned: 0,
      },
      confidence: 'low',
    });
    expect(result.success).toBe(false);
  });
});

describe('technologyExperienceSchema', () => {
  it('validates a valid technology experience', () => {
    const result = technologyExperienceSchema.safeParse({
      technology: 'Next.js',
      kind: 'framework',
      projects: 2,
      architecturePatterns: ['monorepo'],
      engineeringDecisions: 3,
      missionLogReferences: 1,
      learningMilestones: 1,
      confidence: 'high',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative engineering decisions', () => {
    const result = technologyExperienceSchema.safeParse({
      technology: 'Next.js',
      kind: 'framework',
      projects: 0,
      architecturePatterns: [],
      engineeringDecisions: -1,
      missionLogReferences: 0,
      learningMilestones: 0,
      confidence: 'medium',
    });
    expect(result.success).toBe(false);
  });
});

describe('architectureProfileSchema', () => {
  it('validates a valid architecture profile', () => {
    const result = architectureProfileSchema.safeParse({
      pattern: 'monorepo',
      projects: 1,
      decisions: 3,
      lessons: 2,
      milestones: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe('engineeringProfileSchema', () => {
  it('validates a valid engineering profile', () => {
    const result = engineeringProfileSchema.safeParse({
      totalDecisions: 5,
      byImpact: { low: 1, medium: 2, high: 2 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative impact counts', () => {
    const result = engineeringProfileSchema.safeParse({
      totalDecisions: 5,
      byImpact: { low: -1, medium: 2, high: 2 },
    });
    expect(result.success).toBe(false);
  });
});

describe('learningProfileSchema', () => {
  it('validates a valid learning profile', () => {
    const result = learningProfileSchema.safeParse({
      totalLessons: 4,
      byCategory: { architecture: 2, process: 1, tooling: 1 },
    });
    expect(result.success).toBe(true);
  });
});

describe('evidenceStatisticsSchema', () => {
  it('validates valid statistics', () => {
    const result = evidenceStatisticsSchema.safeParse({
      projects: 3,
      featuredProjects: 1,
      technologies: 10,
      architecturePatterns: 4,
      engineeringDecisions: 8,
      lessons: 6,
      milestones: 5,
    });
    expect(result.success).toBe(true);
  });
});

describe('evidenceSchema', () => {
  it('validates a complete evidence object', () => {
    const result = evidenceSchema.safeParse({
      capabilities: [
        {
          name: 'Software Architecture',
          evidence: {
            projects: 2,
            architecturePatterns: 3,
            engineeringDecisions: 5,
            lessonsLearned: 4,
          },
          confidence: 'high',
        },
      ],
      technologyExperiences: [
        {
          technology: 'TypeScript',
          kind: 'language',
          projects: 2,
          architecturePatterns: ['monorepo'],
          engineeringDecisions: 5,
          missionLogReferences: 1,
          learningMilestones: 1,
          confidence: 'high',
        },
      ],
      architectureProfiles: [
        {
          pattern: 'monorepo',
          projects: 2,
          decisions: 5,
          lessons: 4,
          milestones: 1,
        },
      ],
      engineeringProfile: {
        totalDecisions: 5,
        byImpact: { low: 0, medium: 2, high: 3 },
      },
      learningProfile: {
        totalLessons: 4,
        byCategory: { architecture: 2, process: 1, tooling: 1 },
      },
      statistics: {
        projects: 2,
        featuredProjects: 1,
        technologies: 8,
        architecturePatterns: 3,
        engineeringDecisions: 5,
        lessons: 4,
        milestones: 1,
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('computeEvidence — empty inputs', () => {
  const evidence = computeEvidence(emptyProjects, emptyMilestones);

  it('returns empty capabilities', () => {
    expect(evidence.capabilities).toEqual([]);
  });

  it('returns empty technology experiences', () => {
    expect(evidence.technologyExperiences).toEqual([]);
  });

  it('returns empty architecture profiles', () => {
    expect(evidence.architectureProfiles).toEqual([]);
  });

  it('returns zero engineering profile', () => {
    expect(evidence.engineeringProfile).toEqual({
      totalDecisions: 0,
      byImpact: { low: 0, medium: 0, high: 0 },
    });
  });

  it('returns zero learning profile', () => {
    expect(evidence.learningProfile).toEqual({
      totalLessons: 0,
      byCategory: {},
    });
  });

  it('returns zero statistics', () => {
    expect(evidence.statistics).toEqual({
      projects: 0,
      featuredProjects: 0,
      technologies: 0,
      architecturePatterns: 0,
      engineeringDecisions: 0,
      lessons: 0,
      milestones: 0,
    });
  });

  it('satisfies the evidence schema', () => {
    expect(evidenceSchema.safeParse(evidence).success).toBe(true);
  });
});

describe('computeEvidence — sample data', () => {
  const evidence = computeEvidence([sampleProject], [sampleMilestone]);

  it('infers capabilities from architecture patterns', () => {
    const names = evidence.capabilities.map((c) => c.name);
    expect(names).toContain('Monorepo Architecture');
    expect(names).toContain('Clean Architecture');
  });

  it('infers Software Architecture capability', () => {
    const swa = evidence.capabilities.find((c) => c.name === 'Software Architecture');
    expect(swa).toBeDefined();
    expect(swa!.evidence.projects).toBe(1);
    expect(swa!.evidence.architecturePatterns).toBeGreaterThanOrEqual(2);
    expect(swa!.evidence.engineeringDecisions).toBeGreaterThanOrEqual(2);
    expect(swa!.evidence.lessonsLearned).toBeGreaterThanOrEqual(3);
  });

  it('infers Frontend Development capability', () => {
    const fe = evidence.capabilities.find((c) => c.name === 'Frontend Development');
    expect(fe).toBeDefined();
    expect(fe!.evidence.projects).toBe(1);
  });

  it('infers Backend Development capability', () => {
    const be = evidence.capabilities.find((c) => c.name === 'Backend Development');
    expect(be).toBeDefined();
  });

  it('infers Full-Stack Development capability', () => {
    const fs = evidence.capabilities.find((c) => c.name === 'Full-Stack Development');
    expect(fs).toBeDefined();
    expect(fs!.evidence.projects).toBe(1);
  });

  it('infers Technical Leadership capability', () => {
    const tl = evidence.capabilities.find((c) => c.name === 'Technical Leadership');
    expect(tl).toBeDefined();
    expect(tl!.evidence.engineeringDecisions).toBeGreaterThanOrEqual(3);
  });

  it('generates technology experiences', () => {
    const techNames = evidence.technologyExperiences.map((t) => t.technology);
    expect(techNames).toContain('TypeScript');
    expect(techNames).toContain('React');
    expect(techNames).toContain('PostgreSQL');
  });

  it('aggregates technology architecture patterns', () => {
    const ts = evidence.technologyExperiences.find((t) => t.technology === 'TypeScript');
    expect(ts!.architecturePatterns).toContain('monorepo');
    expect(ts!.architecturePatterns).toContain('clean-architecture');
  });

  it('counts mission log references per technology', () => {
    const ts = evidence.technologyExperiences.find((t) => t.technology === 'TypeScript');
    expect(ts!.missionLogReferences).toBe(1);
  });

  it('generates architecture profiles', () => {
    const patterns = evidence.architectureProfiles.map((a) => a.pattern);
    expect(patterns).toContain('monorepo');
    expect(patterns).toContain('clean-architecture');
  });

  it('architecture profile includes milestone decisions', () => {
    const mono = evidence.architectureProfiles.find((a) => a.pattern === 'monorepo');
    expect(mono!.milestones).toBe(1);
    expect(mono!.decisions).toBeGreaterThanOrEqual(3);
  });

  it('computes engineering profile', () => {
    expect(evidence.engineeringProfile.totalDecisions).toBeGreaterThanOrEqual(3);
    expect(evidence.engineeringProfile.byImpact.high).toBeGreaterThanOrEqual(2);
  });

  it('computes learning profile', () => {
    expect(evidence.learningProfile.totalLessons).toBe(3);
    expect(evidence.learningProfile.byCategory.architecture).toBe(2);
    expect(evidence.learningProfile.byCategory.process).toBe(1);
  });

  it('computes correct statistics', () => {
    expect(evidence.statistics.projects).toBe(1);
    expect(evidence.statistics.featuredProjects).toBe(1);
    expect(evidence.statistics.technologies).toBe(3);
    expect(evidence.statistics.architecturePatterns).toBe(2);
    expect(evidence.statistics.engineeringDecisions).toBeGreaterThanOrEqual(2);
    expect(evidence.statistics.lessons).toBe(3);
    expect(evidence.statistics.milestones).toBe(1);
  });

  it('satisfies the evidence schema', () => {
    expect(evidenceSchema.safeParse(evidence).success).toBe(true);
  });
});

describe('computeEvidence — real data', () => {
  const evidence = computeEvidence(PROJECTS, MILESTONES);

  it('satisfies the evidence schema', () => {
    expect(evidenceSchema.safeParse(evidence).success).toBe(true);
  });

  it('generates capabilities', () => {
    expect(evidence.capabilities.length).toBeGreaterThan(0);
  });

  it('generates technology experiences', () => {
    expect(evidence.technologyExperiences.length).toBeGreaterThan(0);
  });

  it('generates architecture profiles', () => {
    expect(evidence.architectureProfiles.length).toBeGreaterThan(0);
  });

  it('statistics match PROJECTS count', () => {
    expect(evidence.statistics.projects).toBe(PROJECTS.length);
  });

  it('statistics match MILESTONES count', () => {
    expect(evidence.statistics.milestones).toBe(MILESTONES.length);
  });

  it('no duplicated capability names', () => {
    const names = evidence.capabilities.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('no duplicated technology names', () => {
    const names = evidence.technologyExperiences.map((t) => t.technology);
    expect(new Set(names).size).toBe(names.length);
  });

  it('no duplicated architecture patterns', () => {
    const patterns = evidence.architectureProfiles.map((a) => a.pattern);
    expect(new Set(patterns).size).toBe(patterns.length);
  });

  it('every capability has positive evidence in at least one category', () => {
    for (const cap of evidence.capabilities) {
      const total =
        cap.evidence.projects +
        cap.evidence.architecturePatterns +
        cap.evidence.engineeringDecisions +
        cap.evidence.lessonsLearned;
      expect(total).toBeGreaterThan(0);
    }
  });
});
