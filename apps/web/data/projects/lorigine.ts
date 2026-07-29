import {
  ARCHITECTURE_PATTERN,
  DECISION_IMPACT,
  LESSON_CATEGORY,
  OWNERSHIP_TYPE,
  PROJECT_STATUS,
  TECHNOLOGY_KIND,
  TECHNOLOGY_LEVEL,
} from './project.enums';
import type { Project } from './project.types';

export const lorigine: Project = {
  id: 'lorigine',
  slug: 'lorigine',
  name: "L'ORIGINE",
  tagline: 'Bioingeniería capilar profesional',
  summary:
    "Brand platform for L'ORIGINE — premium Colombian professional hair care cosmetics. Built with Next.js 16 App Router, React 19, Tailwind CSS v4, and Framer Motion. Editorial-first design philosophy with cinematic motion system, product catalog, science education, academy, distributor network, and journal.",
  description:
    "L'ORIGINE is a brand platform for a Colombian professional hair cosmetics company (est. 2021 by Juan Andrés Gatjens, chemical engineer, and Natali). Built as a standalone Next.js 16 App Router application with editorial-first design philosophy prioritizing inspiration and education over transactional selling. The platform features a cinematic hero with parallax scroll effects, video background, and ambient glows; a centralized motion system with 5 duration tokens, 3 easing curves, 3 distance tokens, and 7 reusable motion components (Reveal, Stagger, StaggerItem, ImageReveal, PageTransition, ScrollProgress, AmbientGlow); a product catalog with category filtering and sorting; an alternating-block science section documenting 2 proprietary active ingredients (MagNut Sense, PGA); 3 documented case studies with protocols, objectives, and observable results; an academy section with courses, instructors, methodology, and testimonials; a distributor network page with partner showcase and contact form; a blog/journal with CSS columns masonry layout and category filtering; a brand story page with editorial masonry timeline; a protocols page; and a design system with 28+ color tokens, 3 font families (Playfair Display for logo, Red Hat Display for headings/body), and a spacing scale. The project eschews databases and APIs entirely — it is a content-driven brand presence with static data files. Animations respect prefers-reduced-motion. Infrastructure: standalone Next.js, no monorepo, no database, no API layer.",
  status: PROJECT_STATUS.Development,
  featured: false,
  public: true,
  startedAt: '2026-06-25',
  completedAt: null,
  lastUpdated: '2026-06-26',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Tailwind CSS', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Framer Motion', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Lenis', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Lucide React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'clsx', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'tailwind-merge', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'class-variance-authority', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: '@radix-ui/react-slot', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Playwright', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'ESLint', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
  ],
  architecture: [
    ARCHITECTURE_PATTERN.DesignSystem,
    ARCHITECTURE_PATTERN.LayeredArchitecture,
  ],
  features: [
    {
      title: 'Cinematic Hero',
      description:
        'Full-screen hero section with video background (poster image LCP, video progressive enhancement), parallax scroll effects (content scale 1→0.985, opacity 1→0.94, background translateY 0→60px), ambient glow layers (top-right, bottom-left), premium gradient overlay for legibility, and staggered cinematic entrance (image → overlay → eyebrow → title → line → text → CTA). Playback rate 0.85 for slower, more cinematographic motion.',
    },
    {
      title: 'Centralized Motion System',
      description:
        'Three-layer motion architecture: tokens (src/lib/motion.ts — 5 durations: fast 0.3s, base 0.65s, slow 0.85s, hero 1.1s, ambient 2.4s; 3 easing curves: luxury [0.22,1,0.36,1], soft [0.4,0,0.2,1], hero [0.16,1,0.3,1]; 3 distances; 4 stagger speeds; viewport margin -80px), variants (src/components/motion/variants.ts — 7 presets: fadeInUp, fadeInUpSm, fadeIn, scaleIn, lineReveal, heroReveal, heroFade; 5 container presets: staggerContainer, staggerContainerFast, staggerContainerSlow, heroContainer), and components (7 reusable components: Reveal, Stagger, StaggerItem, ImageReveal, PageTransition, ScrollProgress, AmbientGlow). Every animation consumes tokens — no hardcoded durations or easings.',
    },
    {
      title: 'Editorial Product Catalog',
      description:
        'Full product catalog with 4 categories (Tratamientos, Cuidado capilar, Styling, Todos), 4 products with gallery images, hover images, highlights, idealFor, results, badges, and details. Category filtering, 4 sort options (featured, name, price asc/desc). Server component page with search params. Product detail pages with dynamic routes (/productos/[slug]). Products organized in 4-step ritual system (Champú → Mascarilla → Alisado → Perfume Capilar).',
    },
    {
      title: 'Science Education Section',
      description:
        'Dedicated science page (/ciencia) with 5 alternating editorial blocks documenting: the structural problem (hair fiber damage), proprietary active ingredient PGA (Ácido Poliglutámico — 5,000× water retention), proprietary active ingredient MagNut Sense (exclusive to L\'ORIGINE), the 4-step protocol system, and product showcase. Science-specific color palette (Botanical Green, Forest, Sage, Gold científico). RitualSteps component, Before/After showcase, CTA section.',
    },
    {
      title: 'Brand Story (Nosotros)',
      description:
        'Editorial brand history page with featured story spread (62/38 image-text split), CSS columns masonry layout for 6 supporting stories (ciencia, magnunsense, fundadores, proposito, vision, brand-film with video), founder quote section, and editorial closing CTA. Stories span 2021-2025 timeline. Lenis smooth scroll integration.',
    },
    {
      title: 'Academy Section',
      description:
        'Dedicated academy page (/academia) with dark hero, 4 benefit pillars, 4 featured courses, 3-step methodology, instructor grid (4 experts), testimonial with stats (2,500+ professionals, 18+ countries, 98% satisfaction), and closing CTA. Course data in src/data/courses.ts with 4 courses (levels: iniciación, intermedio, avanzado, experto; modes: presencial, online, hibrido).',
    },
    {
      title: 'Distributor Network',
      description:
        'Dedicated distributor page (/distribuidores) with hero, partner showcase grid (12 distributors), and contact section with form (name, email, country/city, business type, message) and contact channels (email, WhatsApp, phone). Dark Espresso theme for distributor section.',
    },
    {
      title: 'Blog/Journal',
      description:
        'Client-side blog (/blog) with CSS columns masonry layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop), 7 category filters (Todo, Ciencia, Protocolos, Ingredientes, Productos, Academia, Tendencias), 9 articles with varied aspect ratios (4:3, 3:4, 16:9, square), and category-based filtering. Zero JavaScript masonry — pure CSS columns.',
    },
    {
      title: 'Case Studies (Evidencia Técnica)',
      description:
        '3 documented case studies with protocol categories (Alisado profesional, Tratamiento en cabina, Mantenimiento profesional), times, technical objectives, observable results, and active ingredients tags. Featured case (alisado) in horizontal spread, secondary cases in vertical grid. Dark Espresso theme.',
    },
    {
      title: 'View Transitions API Progressive Enhancement',
      description:
        'PageTransition component registers viewTransitionName = "root" on <html>. Native View Transitions API for cross-page animations in supported browsers (Chrome/Edge 111+, Safari 18.1+). CSS keyframe fallback (vt-fade-out, vt-fade-in). No-op when API unavailable. Respects prefers-reduced-motion.',
    },
    {
      title: 'Design System (Color, Typography, Spacing)',
      description:
        '28+ color tokens defined in Tailwind v4 @theme directive. Palette: Ivory Canvas (#F8F5EF) for backgrounds, Champagne (#B8945A) as brand accent, Carbon (#1B1815) for text, Espresso (#231B16) for dark sections, Botanical Green (#304338) for science. 3 font families: Playfair Display (logo), Red Hat Display (headings + body). Spacing scale: 8·16·24·32·48·64·96·128. Color distribution: 65% light backgrounds, 20% photography, 10% dark, 5% accent. Semantic color aliases for component compatibility.',
    },
    {
      title: 'Accessibility Infrastructure',
      description:
        'Skip-to-content link (sr-only focusable), prefers-reduced-motion detection in all motion components (Framer Motion useReducedMotion), global CSS reduced motion override (0.01ms durations), semantic landmarks (<main>, <nav>, <section> with aria-labels), focus-visible ring styles, alt text on all images, proper heading hierarchy.',
    },
    {
      title: 'SEO & Metadata System',
      description:
        'SEO metadata builder (buildMetadata in lib/seo.ts) generating OpenGraph, Twitter cards, canonical URLs, and keywords per page. Spanish locale (es-CO). Sitemap generation (/sitemap.ts). meta robots index/follow. Metadata template pattern with site name suffix.',
    },
  ],
  challenges: [
    {
      title: 'Cinematic hero performance vs LCP',
      description:
        'The hero section needs video, parallax, ambient glows, and a premium feel while keeping Largest Contentful Paint under 2.5s. Video autoplay can block page load, and the poster image must be the real LCP element.',
      resolution:
        'Poster image (hero.webp) as the real LCP element with priority loading. Video as progressive enhancement — loads only after poster renders and only if user has not set prefers-reduced-motion. Video playback rate set to 0.85 for slower feel. Parallax effects use useScroll + useTransform (passive, no RAF).',
    },
    {
      title: 'Migrating hardcoded transitions to motion tokens',
      description:
        'Early development had framer-motion transitions with hardcoded durations (0.5, 0.8) and inline easings. This created visual inconsistency across sections and made global timing changes impossible without touching every component.',
      resolution:
        'All durations, easings, and distances centralized in src/lib/motion.ts. 7 motion components built on top. Git history shows dedicated migration tasks: "Task 5: Migrate hardcoded transitions to motion utilities" and "Motion Polish: RitualSteps — Token Transitions". No hardcoded transition values remain.',
    },
    {
      title: 'Masonry layout without JavaScript',
      description:
        'The blog and nosotros pages need masonry grid layouts. JS-based solutions (Masonry, react-masonry-css) add bundle weight, cause layout shifts, and complicate SSR.',
      resolution:
        'CSS columns with [column-count] responsive breakpoints (1→2→3) and [column-gap]. break-inside-avoid on children. This is zero-JS, reflow-friendly, and works with SSR. The trade-off is column-fill order (top-to-bottom per column, not left-to-right per row), which is acceptable for editorial content.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Editorial-first over transactional e-commerce',
      context:
        'The brand is a premium cosmetics company, but the site\'s primary goal is to inspire, educate, and demonstrate authority — not to maximize conversion. The Design Constitution explicitly states: "Nunca vender primero."',
      decision:
        'Build as a brand platform, not an e-commerce storefront. No product grid marketplace, no cart, no checkout. Products presented through editorial storytelling, case studies, and science sections. Purchase happens offline through distributor network.',
      reasoning:
        'The KPI map assigns each page a primary mission (Inspirar, Demostrar, Educar, Validar, Convertir, Formar, Escalar). Conversion is secondary. This reduces technical complexity (no payment, no auth, no inventory) and aligns with brand positioning.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Centralized motion tokens over ad-hoc animations',
      context:
        'Framer Motion allows inline duration/easing on every animation. Without centralization, animations drift visually, and global timing changes require editing every component.',
      decision:
        'All motion values centralized in src/lib/motion.ts. 7 reusable components built on tokens. Variants in src/components/motion/variants.ts as presets. Components accept optional delay and variant props.',
      reasoning:
        'Single source of truth for all motion values. Global timing changes require editing one file. New animations compose existing tokens without reinvention. Accessibility (reduced-motion) handled in every component by default.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'CSS Columns masonry over JavaScript grid',
      context:
        'Journal and brand story pages need heterogeneous aspect-ratio layouts. JavaScript masonry libraries add bundle weight, cause CLS, and add SSR complexity.',
      decision:
        'Use CSS columns with [column-count] at breakpoints (1/2/3) and [column-gap]. Items use break-inside-avoid.',
      reasoning:
        'Zero JavaScript, zero bundle impact, no CLS, works with SSR. Column-fill order is an acceptable trade-off for editorial content. Responsive via single CSS property change.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'View Transitions API as progressive enhancement',
      context:
        'Cross-page navigation animations improve perceived performance but browser support is not universal (Chrome 111+, Safari 18.1+). Blocking on API availability would leave some users without page transitions.',
      decision:
        'PageTransition component registers viewTransitionName on <html> and uses @keyframes fallback. API used when available, CSS fallback otherwise. Framer Motion not used for page transitions.',
      reasoning:
        'Native transitions are smoother and zero-bundle. CSS fallback ensures universal coverage. No Framer Motion dependency for page-level animation. Reduced-motion respected at CSS level with @media query.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Standalone Next.js over monorepo',
      context:
        'Other projects in the portfolio use Turborepo monorepos. L\'ORIGINE is a single brand site with no shared packages, no backend, and no mobile app.',
      decision:
        'Standalone Next.js 16 application. No Turborepo, no pnpm workspaces, no shared packages.',
      reasoning:
        'Monorepo overhead (task orchestration, workspace configuration, dependency hoisting) provides no benefit for a single-app project. npm is sufficient. Reduces CI complexity and developer cognitive load.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Server components with isolated client islands',
      context:
        'Next.js 16 App Router defaults to server components. Motion animations require client-side interactivity.',
      decision:
        'Pages as server components by default. Client components isolated to motion wrappers (Reveal, Stagger) and interactive sections (blog filters). "use client" at the section level, not the page level.',
      reasoning:
        'Maximum server rendering for content. Minimal client bundle — only animation and interaction code sent to browser. Each "use client" boundary is justified by actual interactivity need.',
      impact: DECISION_IMPACT.Medium,
    },
  ],
  lessonsLearned: [
    {
      title: 'Motion tokens eliminate animation drift',
      description:
        'Centralizing durations, easings, and distances in a single file (lib/motion.ts) eliminated the inconsistency of hardcoded transition values. A global timing change (e.g., slowing all reveals from 0.65s to 0.85s) became a one-line edit. The migration from hardcoded to token-based required dedicated tasks but prevented future drift.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'CSS Columns masonry is simpler and more performant than JS alternatives',
      description:
        'Building the blog and nosotros page masonry with CSS columns instead of a JS library resulted in zero JavaScript for layout, no CLS, and automatic responsiveness. The column-fill ordering (top-to-bottom) works naturally for editorial timelines and article grids.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Editorial philosophy prevents feature creep',
      description:
        'The Design Constitution v1.0 (defining each page\'s mission, KPI, and visual personality) acted as a decision filter throughout development. Every proposed feature was evaluated against "does this inspire, educate, or build trust, or does it just sell?" — preventing unnecessary e-commerce features like popups, carousels, and discount banners.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'Animation system requires dedicated polish phase',
      description:
        'The motion system was built incrementally across features, but the final polish (dedicated FASE 12.5 in git history) was essential for visual coherence. Token transitions, ImageReveal adoption, scroll exit effects, and hardcoded transition elimination all happened in a dedicated motion polish phase, not during initial feature implementation.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'View Transitions API works well as progressive enhancement',
      description:
        'Adding native View Transitions API with CSS keyframe fallback provided smooth cross-page navigation at zero bundle cost. The @keyframes vt-fade-in/vt-fade-out pattern is simpler and more performant than Framer Motion AnimatePresence for page transitions. Not all browsers support it, but the fallback ensures universal coverage.',
      category: LESSON_CATEGORY.Architecture,
    },
  ],
  metrics: {
    commits: 13,
    contributors: 1,
    durationWeeks: null,
    modules: 9, // routes: home, productos, productos/[slug], ciencia, academia, nosotros, distribuidores, blog, protocolos
    tests: null,
    coverage: null,
  },
  media: [],
  links: {
  },
  role: {
    title: 'Software Engineer & Product Owner',
    responsibilities: [
      'Full-stack development: Next.js 16 App Router brand platform',
      'Cinematic hero with parallax, video, and ambient effects',
      'Centralized motion system design (tokens, variants, 7 components)',
      'Product catalog with category/sort system and detail pages',
      'Science education section with proprietary ingredient storytelling',
      'Case studies, academy, and distributor network pages',
      'CSS columns masonry layouts for journal and brand story',
      'View Transitions API progressive enhancement',
      'Design system implementation (28+ color tokens, 3 font families, spacing)',
      'Accessibility infrastructure (skip-to-content, reduced-motion, landmarks)',
    ],
  },
  tags: [
    'nextjs',
    'react',
    'typescript',
    'tailwind-v4',
    'framer-motion',
    'brand-platform',
    'editorial-design',
    'cosmetics',
    'colombia',
  ],
  relationships: {
    relatedProjects: ['command-center'],
    relatedArticles: [],
    relatedSkills: [],
  },
  metadata: { version: 1 },
  ownership: {
    type: OWNERSHIP_TYPE.Personal,
    confidential: false,
  },
};
