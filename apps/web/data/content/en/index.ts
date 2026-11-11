import type { ContentOverlay } from '../content';
import { academyEn } from './academy';
import { drokexEn } from './drokex';
import { kliniuEn } from './kliniu';
import { lorigineEn } from './lorigine';
import { availabilityEn, careerEn, technologyCategoriesEn, technologyDescriptionsEn, technologyNamesEn } from './profile';

/** Everything `/en` shows that is content rather than interface. Imported only by the English root layout. */
export const ENGLISH_CONTENT: ContentOverlay = {
  projects: { kliniu: kliniuEn, lorigine: lorigineEn, '4ustudio-academy': academyEn, drokex: drokexEn },
  career: careerEn,
  availability: availabilityEn,
  technologies: { categories: technologyCategoriesEn, names: technologyNamesEn, descriptions: technologyDescriptionsEn },
};
