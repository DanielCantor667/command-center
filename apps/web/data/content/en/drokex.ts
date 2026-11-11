import type { ProjectCopy } from '../localize';

/** drokex in English (specs/i18n-english.md, I.3). Text only; everything else comes from data/projects/drokex.ts. */
export const drokexEn: ProjectCopy = {
  tagline: 'International catalog and supplier directory',
  summary: 'A platform to showcase companies and products, discover suppliers and connect businesses with other markets.',
  description: 'Drokex brings together a product catalog, a directory and journeys for customers and suppliers. The public experience uses a dark visual identity, animation and 3D elements. The repository includes Next.js 16, React 19, Prisma 7 and PostgreSQL. Daniel’s CV describes the work on the marketplace, the supplier portal, streaming quotations and 3D experiences. No commercial results or sole authorship are claimed.',
  features: [
    { title: 'Catalog and directory', description: 'Public entry points to explore products and find suppliers.' },
    { title: 'Audience journeys', description: 'The home page separates giving a company visibility from finding suppliers.' },
  ],
  challenges: [
    { title: 'Adapting a visual home page to mobile', description: 'The August 18 responsive spec defines hierarchy, navigation and calls to action for desktop, tablet and mobile. The historical validation of each requirement has not been re-run here.' },
  ],
  engineeringDecisions: [],
  lessonsLearned: [],
  media: [
    { alt: 'Drokex · desktop view', caption: 'Screenshot of the public site · September 10, 2026' },
    { alt: 'Drokex · mobile view', caption: 'Screenshot of the public site · September 10, 2026' },
  ],
  role: { title: 'Full-Stack Developer', responsibilities: [
      'Marketplace development with roles for customers, suppliers and administrators, according to the CV.',
      'Supplier portal, quotations over SSE and AI-assisted catalog guidance.',
      'Interactive 3D experiences for the brand presentation.',
    ] },
};
