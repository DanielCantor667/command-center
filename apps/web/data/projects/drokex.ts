import type { Project } from './project.types';

/** Sources and unconfirmed fields: docs/product/project-evidence-audit.md. */
export const drokex: Project = {
  id: 'drokex', slug: 'drokex', name: 'Drokex',
  tagline: 'Catálogo internacional y directorio de proveedores',
  summary: 'Una plataforma para presentar empresas y productos, descubrir proveedores y conectar negocios con otros mercados.',
  description: 'Drokex reúne un catálogo de productos, un directorio y recorridos para clientes y proveedores. La experiencia pública utiliza una identidad visual oscura, animación y elementos 3D. El repositorio incluye Next.js 16, React 19, Prisma 7 y PostgreSQL. Daniel describe en su CV su participación en el marketplace, el portal de proveedores, cotizaciones por streaming y experiencias 3D. No se atribuyen resultados comerciales ni autoría exclusiva.',
  status: 'production', featured: true, public: true,
  startedAt: '2026-04-17', completedAt: null, lastUpdated: '2026-09-10',
  technologies: [
    { name: 'JavaScript', kind: 'language', level: 'working' },
    { name: 'Next.js', kind: 'framework', level: 'working' },
    { name: 'React', kind: 'library', level: 'working' },
    { name: 'Prisma', kind: 'database', level: 'working' },
    { name: 'PostgreSQL', kind: 'database', level: 'working' },
    { name: 'GSAP', kind: 'library', level: 'working' },
    { name: 'Three.js', kind: 'library', level: 'working' },
  ],
  architecture: [],
  features: [
    { title: 'Catálogo y directorio', description: 'Entradas públicas para explorar productos y encontrar proveedores.' },
    { title: 'Recorridos por audiencia', description: 'La portada distingue entre dar visibilidad a una empresa y encontrar proveedores.' },
  ],
  challenges: [{ title: 'Adaptación de una portada visual a móvil', description: 'La spec responsive del 18 de agosto define jerarquía, navegación y CTAs para escritorio, tablet y móvil. La validación histórica de cada requisito no se ha reejecutado aquí.' }],
  engineeringDecisions: [], lessonsLearned: [],
  metrics: { commits: null, contributors: null, durationWeeks: null, modules: null, tests: null, coverage: null },
  media: [
    { type: 'image', url: '/projects/drokex-desktop.png', alt: 'Drokex · vista de escritorio', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: true },
    { type: 'image', url: '/projects/drokex-mobile.png', alt: 'Drokex · vista de móvil', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: false },
  ],
  links: { live: 'https://drokex.com/' },
  role: { title: 'Full-Stack Developer', responsibilities: ['Desarrollo del marketplace con roles para clientes, proveedores y administradores, según el CV.', 'Portal de proveedores, cotizaciones mediante SSE y asesoría de catálogo con IA.', 'Experiencias interactivas 3D para la presentación de la marca.'] },
  tags: ['catalogo', 'proveedores', 'comercio'],
  relationships: { relatedProjects: [], relatedArticles: [], relatedSkills: [] },
  metadata: { version: 1 },
  ownership: { type: 'unconfirmed', confidential: false },
};
