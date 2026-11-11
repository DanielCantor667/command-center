'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { PORTFOLIO_CAREER } from '../portfolio-career';
import { PORTFOLIO_TECHNOLOGIES, TECHNOLOGY_CATEGORIES, type PortfolioTechnology, type TechnologyCategory } from '../portfolio-technologies';
import { PROJECTS, type Project } from '../projects';
import { PUBLIC_PROFILE } from '../public-profile';
import type { careerEn } from './en/profile';
import { localizeProject, type ProjectCopy } from './localize';

/**
 * The translated content for a non-default locale. Only `/en` passes one (from its root layout, so the English text
 * travels with that page and never in Spanish bundles); without it, components read the Spanish source as before.
 */
export interface ContentOverlay {
  projects: Record<string, ProjectCopy>;
  career: typeof careerEn;
  availability: string;
  technologies: { categories: Record<TechnologyCategory, string>; names: Record<string, string>; descriptions: Record<string, string> };
}

export interface Content {
  /** Spanish: every project. English: only the published cases that have a translation. */
  projects: readonly Project[];
  career: typeof careerEn;
  availability: string;
  technologies: readonly PortfolioTechnology[];
  categories: readonly { id: TechnologyCategory; label: string }[];
}

const SPANISH: Content = {
  projects: PROJECTS, career: PORTFOLIO_CAREER, availability: PUBLIC_PROFILE.availability,
  technologies: PORTFOLIO_TECHNOLOGIES, categories: TECHNOLOGY_CATEGORIES,
};

export function localizeContent(overlay: ContentOverlay): Content {
  const projects = PROJECTS.filter(project => overlay.projects[project.id]).map(project => localizeProject(project, overlay.projects[project.id]!));
  const shown = new Set(projects.map(project => project.id));
  return {
    projects,
    career: overlay.career,
    availability: overlay.availability,
    technologies: PORTFOLIO_TECHNOLOGIES.map(technology => ({
      ...technology,
      name: overlay.technologies.names[technology.id] ?? technology.name,
      description: overlay.technologies.descriptions[technology.id] ?? technology.description,
      projectIds: technology.projectIds.filter(id => shown.has(id)),
    })),
    categories: TECHNOLOGY_CATEGORIES.map(category => ({ ...category, label: overlay.technologies.categories[category.id] })),
  };
}

const ContentContext = createContext<Content>(SPANISH);

export function ContentProvider({ overlay, children }: { overlay: ContentOverlay; children: ReactNode }) {
  const content = useMemo(() => localizeContent(overlay), [overlay]);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

/** Projects, career, technologies and availability in the page's language. */
export const useContent = () => useContext(ContentContext);
