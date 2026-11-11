import { describe, expect, it } from 'vitest';
import { PORTFOLIO_CAREER } from '../../portfolio-career';
import { PORTFOLIO_TECHNOLOGIES, TECHNOLOGY_CATEGORIES } from '../../portfolio-technologies';
import { PROJECTS } from '../../projects';
import { localizeContent } from '../content';
import { ENGLISH_CONTENT } from '../en';

/** Frequent Spanish words; proper names (Tratamientos, guitarra, Calle 93…) appear inside English sentences, not these. */
const SPANISH = /\b(el|los|las|del|para|con|una|que|por|según|está|también|mediante|sitio|vista|captura)\b/i;
const texts = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(texts) : value && typeof value === 'object' ? Object.values(value).flatMap(texts) : [];

describe('English content', () => {
  const english = localizeContent(ENGLISH_CONTENT);
  it('translates exactly the published cases and hides the rest', () => {
    const published = PROJECTS.filter(project => project.public && project.links.live).map(project => project.id);
    expect(english.projects.map(project => project.id)).toEqual(published);
  });
  it('keeps every case in step with its source record', () => {
    for (const project of english.projects) {
      const source = PROJECTS.find(item => item.id === project.id)!;
      expect(project.features).toHaveLength(source.features.length);
      expect(project.media).toHaveLength(source.media.length);
      expect(project.links).toEqual(source.links);
    }
  });
  it('has no Spanish left in the translated text', () => {
    const all = [...english.projects.flatMap(project => texts([project.tagline, project.summary, project.description, project.media, project.features, project.challenges, project.engineeringDecisions, project.lessonsLearned, project.role])),
      ...texts(english.career), english.availability, ...english.technologies.flatMap(item => [item.name, item.description]), ...english.categories.map(item => item.label)];
    expect(all.filter(text => SPANISH.test(text))).toEqual([]);
  });
  it('keeps the Spanish source of the published cases in Spanish', () => {
    // Code identifiers and English product names stay; whole English sentences do not.
    const ENGLISH = /\b(the|and|with|for|which|without|between|across)\b/i;
    const published = PROJECTS.filter(project => project.public && project.links.live);
    const all = published.flatMap(project => texts([project.tagline, project.summary, project.description, project.features, project.challenges, project.engineeringDecisions, project.lessonsLearned, project.role.responsibilities]));
    expect(all.filter(text => ENGLISH.test(text))).toEqual([]);
  });
  it('covers every technology, category and career entry', () => {
    expect(Object.keys(ENGLISH_CONTENT.technologies.descriptions).sort()).toEqual(PORTFOLIO_TECHNOLOGIES.map(item => item.id).sort());
    expect(english.categories).toHaveLength(TECHNOLOGY_CATEGORIES.length);
    expect(ENGLISH_CONTENT.career.experience.map(item => item.id)).toEqual(PORTFOLIO_CAREER.experience.map(item => item.id));
    expect(ENGLISH_CONTENT.career.education.map(item => item.id)).toEqual(PORTFOLIO_CAREER.education.map(item => item.id));
  });
});
