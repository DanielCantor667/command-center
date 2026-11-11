import type { Project } from '../projects/project.types';

/**
 * Every text field of a project in one language (specs/i18n-english.md, I.3). Arrays follow the source order one to
 * one; ids, dates, links, technologies and metrics are not text and stay in the source record.
 */
export interface ProjectCopy {
  tagline: string;
  summary: string;
  description: string;
  features: readonly { title: string; description: string }[];
  challenges: readonly { title: string; description: string; resolution?: string }[];
  engineeringDecisions: readonly { title: string; context: string; decision: string; reasoning: string }[];
  lessonsLearned: readonly { title: string; description: string }[];
  media: readonly { alt: string; caption?: string }[];
  role: { title: string; responsibilities: readonly string[] };
}

const zip = <T, C>(source: readonly T[], copy: readonly C[], what: string): (T & C)[] => {
  if (source.length !== copy.length) throw new Error(`Translation of ${what} has ${copy.length} entries, the source ${source.length}`);
  return source.map((item, index) => ({ ...item, ...copy[index]! }));
};

/** The project with its text replaced by `copy`; a count mismatch throws, so a stale translation fails loudly. */
export function localizeProject(project: Project, copy: ProjectCopy): Project {
  return {
    ...project,
    tagline: copy.tagline,
    summary: copy.summary,
    description: copy.description,
    features: zip(project.features, copy.features, `${project.id} features`),
    challenges: zip(project.challenges, copy.challenges, `${project.id} challenges`),
    engineeringDecisions: zip(project.engineeringDecisions, copy.engineeringDecisions, `${project.id} decisions`),
    lessonsLearned: zip(project.lessonsLearned, copy.lessonsLearned, `${project.id} lessons`),
    media: zip(project.media, copy.media, `${project.id} media`),
    role: { title: copy.role.title, responsibilities: copy.role.responsibilities },
  };
}
