import type { Dictionary } from './es';

/** English interface strings. Typed as `Dictionary`: a missing key does not compile, nothing falls back to Spanish. */
export const en: Dictionary = {
  locale: { switchTo: 'ES', switchLabel: 'Leer en español' },
  meta: {
    title: 'Daniel Cantor — Engineering portfolio',
    description: 'Daniel Cantor, Full-Stack Developer in Bogotá. Walk through his 3D workshop or go straight to the Kliniu, L’ORIGINE, 4U Studio Academy and Drokex case studies: decisions, technologies and career.',
    shareDescription: 'A 3D workshop to explore four live websites, their case studies and the decisions behind each one.',
    siteName: 'Daniel’s workshop',
    imageAlt: 'Daniel Cantor’s 3D workshop: robotic arms, a desk and the wall with his projects',
    ogLocale: 'en_US',
    creditsTitle: 'Model credits',
    creditsDescription: 'Authors and licenses of the models used in Daniel Cantor’s workshop.',
  },
};
