import type { ArchitecturePattern } from '../../data/projects';
import type { Project } from '../../data/projects';
import type { Milestone } from '../../data/mission-log';

import type {
  Capability,
  TechnologyExperience,
  ArchitectureProfile,
  EngineeringProfile,
  LearningProfile,
  EvidenceStatistics,
  Evidence,
} from './evidence.types';

const ARCHITECTURE_CAPABILITY_LABELS: Record<string, string> = {
  monorepo: 'Monorepo Architecture',
  'clean-architecture': 'Clean Architecture',
  ddd: 'Domain-Driven Design',
  rest: 'REST API Design',
  cqrs: 'CQRS',
  graphql: 'GraphQL API Design',
  'module-system': 'Modular System Design',
  'design-system': 'Design Systems',
  'layered-architecture': 'Layered Architecture',
  'event-driven': 'Event-Driven Architecture',
  serverless: 'Serverless Architecture',
};

const BACKEND_KINDS = new Set(['database', 'infrastructure', 'platform']);

function computeConfidence(totalEvidence: number): 'high' | 'medium' | 'low' {
  if (totalEvidence >= 8) return 'high';
  if (totalEvidence >= 3) return 'medium';
  return 'low';
}

function formatCapabilityName(pattern: string): string {
  const label = ARCHITECTURE_CAPABILITY_LABELS[pattern];
  if (label) return label;
  return pattern
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function collectCapabilityEvidence(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): { projects: number; architecturePatterns: number; engineeringDecisions: number; lessonsLearned: number } {
  const patterns = new Set(projects.flatMap((p) => p.architecture));
  const decisions =
    projects.reduce((sum, p) => sum + p.engineeringDecisions.length, 0) +
    milestones.reduce((sum, m) => sum + m.technicalDecisions.length, 0);
  const lessons =
    projects.reduce((sum, p) => sum + p.lessonsLearned.length, 0) +
    milestones.reduce((sum, m) => sum + m.lessons.length, 0);

  return {
    projects: projects.length,
    architecturePatterns: patterns.size,
    engineeringDecisions: decisions,
    lessonsLearned: lessons,
  };
}

function computeCapabilities(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): Capability[] {
  const caps: Capability[] = [];
  const patterns = new Set(projects.flatMap((p) => p.architecture));
  const techKinds = new Set(projects.flatMap((p) => p.technologies.map((t) => t.kind)));

  for (const pattern of patterns) {
    const relevant = projects.filter((p) => p.architecture.includes(pattern));
    const evidence = collectCapabilityEvidence(relevant, milestones);
    const total = evidence.projects + evidence.architecturePatterns + evidence.engineeringDecisions + evidence.lessonsLearned;
    caps.push({
      name: formatCapabilityName(pattern),
      evidence,
      confidence: computeConfidence(total),
    });
  }

  if (patterns.size >= 2) {
    const evidence = collectCapabilityEvidence(projects, milestones);
    const total = evidence.projects + evidence.architecturePatterns + evidence.engineeringDecisions + evidence.lessonsLearned;
    caps.push({
      name: 'Software Architecture',
      evidence,
      confidence: computeConfidence(total),
    });
  }

  if (techKinds.has('framework')) {
    const relevant = projects.filter((p) => p.technologies.some((t) => t.kind === 'framework'));
    if (relevant.length > 0) {
      const evidence = collectCapabilityEvidence(relevant, milestones);
      const total = evidence.projects + evidence.architecturePatterns + evidence.engineeringDecisions + evidence.lessonsLearned;
      caps.push({
        name: 'Frontend Development',
        evidence,
        confidence: computeConfidence(total),
      });
    }
  }

  if (techKinds.has('database') || techKinds.has('infrastructure') || techKinds.has('platform')) {
    const relevant = projects.filter((p) =>
      p.technologies.some((t) => BACKEND_KINDS.has(t.kind)),
    );
    if (relevant.length > 0) {
      const evidence = collectCapabilityEvidence(relevant, milestones);
      const total = evidence.projects + evidence.architecturePatterns + evidence.engineeringDecisions + evidence.lessonsLearned;
      caps.push({
        name: 'Backend Development',
        evidence,
        confidence: computeConfidence(total),
      });
    }
  }

  if (techKinds.has('framework') && projects.some((p) => p.technologies.some((t) => BACKEND_KINDS.has(t.kind)))) {
    const relevant = projects.filter(
      (p) =>
        p.technologies.some((t) => t.kind === 'framework') &&
        p.technologies.some((t) => BACKEND_KINDS.has(t.kind)),
    );
    if (relevant.length > 0) {
      const evidence = collectCapabilityEvidence(relevant, milestones);
      const total = evidence.projects + evidence.architecturePatterns + evidence.engineeringDecisions + evidence.lessonsLearned;
      caps.push({
        name: 'Full-Stack Development',
        evidence,
        confidence: computeConfidence(total),
      });
    }
  }

  if (projects.some((p) => p.engineeringDecisions.some((d) => d.impact === 'high'))) {
    const relevant = projects.filter((p) => p.engineeringDecisions.some((d) => d.impact === 'high'));
    const evidence = collectCapabilityEvidence(relevant, milestones);
    const total = evidence.projects + evidence.architecturePatterns + evidence.engineeringDecisions + evidence.lessonsLearned;
    caps.push({
      name: 'Technical Leadership',
      evidence,
      confidence: computeConfidence(total),
    });
  }

  return caps;
}

function computeTechnologyExperiences(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): TechnologyExperience[] {
  const techMap = new Map<string, { name: string; kind: string }>();

  for (const project of projects) {
    for (const tech of project.technologies) {
      if (!techMap.has(tech.name)) {
        techMap.set(tech.name, { name: tech.name, kind: tech.kind });
      }
    }
  }

  for (const milestone of milestones) {
    for (const tech of milestone.technologies) {
      if (!techMap.has(tech.name)) {
        techMap.set(tech.name, { name: tech.name, kind: tech.kind });
      }
    }
  }

  return Array.from(techMap.values()).map(({ name, kind }) => {
    const relevantProjects = projects.filter((p) => p.technologies.some((t) => t.name === name));
    const relevantMilestones = milestones.filter((m) => m.technologies.some((t) => t.name === name));

    const patterns = [...new Set(relevantProjects.flatMap((p) => p.architecture))];
    const decisions = relevantProjects.reduce((sum, p) => sum + p.engineeringDecisions.length, 0);
    const references = relevantMilestones.length;
    const learningMilestones = relevantMilestones.filter((m) => m.lessons.length > 0).length;

    const totalEvidence = relevantProjects.length + decisions + references + learningMilestones;

    return {
      technology: name,
      kind,
      projects: relevantProjects.length,
      architecturePatterns: patterns,
      engineeringDecisions: decisions,
      missionLogReferences: references,
      learningMilestones,
      confidence: computeConfidence(totalEvidence),
    };
  });
}

function computeArchitectureProfiles(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): ArchitectureProfile[] {
  const patterns = new Set<ArchitecturePattern>();

  for (const project of projects) {
    for (const pattern of project.architecture) {
      patterns.add(pattern);
    }
  }

  for (const milestone of milestones) {
    for (const pattern of milestone.architecture) {
      patterns.add(pattern);
    }
  }

  return Array.from(patterns).map((pattern) => {
    const relevantProjects = projects.filter((p) => p.architecture.includes(pattern));
    const relevantMilestones = milestones.filter((m) => m.architecture.includes(pattern));

    return {
      pattern,
      projects: relevantProjects.length,
      decisions:
        relevantProjects.reduce((sum, p) => sum + p.engineeringDecisions.length, 0) +
        relevantMilestones.reduce((sum, m) => sum + m.technicalDecisions.length, 0),
      lessons:
        relevantProjects.reduce((sum, p) => sum + p.lessonsLearned.length, 0) +
        relevantMilestones.reduce((sum, m) => sum + m.lessons.length, 0),
      milestones: relevantMilestones.length,
    };
  });
}

function computeEngineeringProfile(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): EngineeringProfile {
  let low = 0;
  let medium = 0;
  let high = 0;

  for (const project of projects) {
    for (const d of project.engineeringDecisions) {
      if (d.impact === 'low') low++;
      else if (d.impact === 'medium') medium++;
      else if (d.impact === 'high') high++;
    }
  }

  for (const milestone of milestones) {
    for (const d of milestone.technicalDecisions) {
      if (d.impact === 'low') low++;
      else if (d.impact === 'medium') medium++;
      else if (d.impact === 'high') high++;
    }
  }

  return {
    totalDecisions: low + medium + high,
    byImpact: { low, medium, high },
  };
}

function computeLearningProfile(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): LearningProfile {
  const byCategory: Record<string, number> = {};

  for (const project of projects) {
    for (const lesson of project.lessonsLearned) {
      byCategory[lesson.category] = (byCategory[lesson.category] ?? 0) + 1;
    }
  }

  for (const milestone of milestones) {
    for (const lesson of milestone.lessons) {
      byCategory[lesson.category] = (byCategory[lesson.category] ?? 0) + 1;
    }
  }

  const totalLessons = Object.values(byCategory).reduce((sum, count) => sum + count, 0);

  return {
    totalLessons,
    byCategory,
  };
}

function computeStatistics(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): EvidenceStatistics {
  const technologies = new Set(projects.flatMap((p) => p.technologies.map((t) => t.name)));
  const architecturePatterns = new Set(projects.flatMap((p) => p.architecture));
  const engineeringDecisions = projects.reduce((sum, p) => sum + p.engineeringDecisions.length, 0);
  const lessons =
    projects.reduce((sum, p) => sum + p.lessonsLearned.length, 0) +
    milestones.reduce((sum, m) => sum + m.lessons.length, 0);

  return {
    projects: projects.length,
    featuredProjects: projects.filter((p) => p.featured).length,
    technologies: technologies.size,
    architecturePatterns: architecturePatterns.size,
    engineeringDecisions,
    lessons,
    milestones: milestones.length,
  };
}

export function computeEvidence(
  projects: readonly Project[],
  milestones: readonly Milestone[],
): Evidence {
  const statistics = computeStatistics(projects, milestones);
  const capabilities = computeCapabilities(projects, milestones);
  const technologyExperiences = computeTechnologyExperiences(projects, milestones);
  const architectureProfiles = computeArchitectureProfiles(projects, milestones);
  const engineeringProfile = computeEngineeringProfile(projects, milestones);
  const learningProfile = computeLearningProfile(projects, milestones);

  return {
    capabilities,
    technologyExperiences,
    architectureProfiles,
    engineeringProfile,
    learningProfile,
    statistics,
  };
}
