import type { PORTFOLIO_CAREER } from '../../portfolio-career';
import type { TechnologyCategory } from '../../portfolio-technologies';

type Career = typeof PORTFOLIO_CAREER;
type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly Widen<U>[] : { [K in keyof T]: Widen<T[K]> };

/** Daniel's profile, career and technology notes in English (specs/i18n-english.md, I.3). Same entries as the source. */
export const availabilityEn =
  'Available to collaborate on freelance projects where architecture, product experience and execution quality matter from day one.';

export const careerEn: Widen<Career> = {
  experience: [
    {
      id: 'products',
      title: 'Full-Stack Developer',
      organization: 'Web products and platforms',
      period: '2025 — Present',
      description: 'Design, development and maintenance of products in production: architecture, interfaces, backend, integrations, testing and deployment.',
    },
    {
      id: 'agrocinco',
      title: 'Software development internship',
      organization: 'Agrocinco · Bogotá',
      period: 'Jan — Dec 2025',
      description: 'An application to manage orders and inventory, automated imports from PDF and Excel files, and validations to improve data quality.',
    },
  ],
  education: [
    { id: 'uniminuto', title: 'Software Engineering', organization: 'Corporación Universitaria Minuto de Dios', period: '2026 — Present' },
    { id: 'uniagustiniana', title: 'Software Development Technologist program', organization: 'Universitaria Agustiniana', period: '2023 — 2025' },
  ],
  languages: [
    { name: 'Spanish', level: 'Native' },
    { name: 'English', level: 'B2 · Upper intermediate' },
  ],
};

export const technologyCategoriesEn: Record<TechnologyCategory, string> = {
  languages: 'Languages', frontend: 'Frontend', backend: 'Backend', data: 'Data', integrations: 'AI & integrations', tools: 'Tools',
};

/** Only the names that are Spanish in the source; every other technology name is the same in both languages. */
export const technologyNamesEn: Record<string, string> = { mvc: 'MVC with PHP', rest: 'REST APIs' };

export const technologyDescriptionsEn: Record<string, string> = {
  typescript: 'Types and contracts to keep product applications maintainable as they grow.',
  javascript: 'Browser interactivity and web application logic.',
  php: 'Backend development organized with MVC.',
  python: 'Programming and automation, part of my technical training.',
  sql: 'Queries, relationships and data modeling for applications.',
  react: 'Component-based interfaces for stores, portals and admin tools.',
  nextjs: 'Interfaces, routes and server logic in web products in production.',
  'react-router': 'Routing and navigation in React applications.',
  tailwind: 'Interface systems that adapt to desktop and mobile.',
  motion: 'Transitions and visual feedback to interaction in React interfaces.',
  gsap: 'Animation sequences and controlled visual journeys.',
  threejs: 'Interactive scenes to explore and present products.',
  spline: '3D visual experiences for brand presentation.',
  nodejs: 'Services and business logic with JavaScript and TypeScript.',
  'server-actions': 'Server operations integrated with Next.js interfaces.',
  rest: 'Communication between applications and integration of external services.',
  sse: 'Streaming updates for quotations and conversational experiences.',
  mvc: 'Separation of data, presentation and control in PHP applications.',
  postgresql: 'Relational data for e-commerce, marketplaces and management tools.',
  prisma: 'Data modeling and typed access to relational databases.',
  mysql: 'Relational databases that are part of my technical stack.',
  'sql-server': 'Queries and work with relational data in SQL Server.',
  supabase: 'Database and authentication services for applications.',
  openai: 'Conversational assistants and AI connected to products and catalogs.',
  'ai-sdk': 'Conversational and streaming experiences in web applications.',
  wompi: 'Payment flow integration in e-commerce.',
  bold: 'Payments for stores and educational services.',
  kommo: 'Commercial integration to organize customer follow-up.',
  odoo: 'Connection between the web product and business operations.',
  whatsapp: 'Order notifications and commercial follow-up automations.',
  git: 'Version control and change tracking in development.',
  github: 'Repositories and collaboration on the code of my projects.',
  vercel: 'Web application deployment and version previews.',
  playwright: 'Checking user journeys in a real browser.',
  claude: 'The AI assistant I work on code with every day.',
  codex: 'An AI coding assistant I use in my workflow.',
  vscode: 'My everyday code editor.',
};
