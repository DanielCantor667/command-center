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
  summary: 'Tienda y experiencia de marca de bioingeniería capilar: catálogo, contenido editorial, cuenta de cliente y asesor de productos.',
  description: 'Experiencia de marca y comercio electrónico para productos capilares profesionales. El repositorio actual incluye Next.js 16, React 19, PostgreSQL mediante postgres, autenticación de clientes y administración, rutas de pedidos y pagos, y un asesor basado en AI SDK. La portada y el catálogo públicos se verificaron en navegador; las operaciones privadas no forman parte de esta revisión.',
  status: PROJECT_STATUS.Production,
  featured: true,
  public: true,
  startedAt: '2026-06-25',
  completedAt: null,
  lastUpdated: '2026-09-10',
  technologies: [
    { name: 'PostgreSQL', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Working },
    { name: 'AI SDK', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
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
      title: 'Hero cinematográfico',
      description:
        'Sección hero a pantalla completa con video de fondo (imagen póster como LCP, video como mejora progresiva), efectos de parallax al hacer scroll (escala del contenido 1→0.985, opacidad 1→0.94, translateY del fondo 0→60px), capas de brillo ambiental (arriba a la derecha y abajo a la izquierda), un degradado premium para la legibilidad y una entrada cinematográfica escalonada (imagen → capa → antetítulo → título → línea → texto → CTA). Velocidad de reproducción de 0.85 para un movimiento más lento y cinematográfico.',
    },
    {
      title: 'Sistema de movimiento centralizado',
      description:
        'Arquitectura de movimiento en tres capas: tokens (src/lib/motion.ts — 5 duraciones: fast 0.3s, base 0.65s, slow 0.85s, hero 1.1s, ambient 2.4s; 3 curvas de easing: luxury [0.22,1,0.36,1], soft [0.4,0,0.2,1], hero [0.16,1,0.3,1]; 3 distancias; 4 velocidades de stagger; margen de viewport de -80px), variantes (src/components/motion/variants.ts — 7 presets: fadeInUp, fadeInUpSm, fadeIn, scaleIn, lineReveal, heroReveal, heroFade; 5 presets de contenedor: staggerContainer, staggerContainerFast, staggerContainerSlow, heroContainer) y componentes (7 reutilizables: Reveal, Stagger, StaggerItem, ImageReveal, PageTransition, ScrollProgress, AmbientGlow). Toda animación consume tokens: no hay duraciones ni easings escritos a mano.',
    },
    {
      title: 'Catálogo editorial de productos',
      description:
        'Catálogo completo con 4 categorías (Tratamientos, Cuidado capilar, Styling, Todos), 4 productos con imágenes de galería, imágenes al pasar el cursor, destacados, idealFor, resultados, insignias y detalles. Filtrado por categoría y 4 opciones de orden (destacados, nombre, precio ascendente y descendente). Página como server component con search params. Páginas de detalle con rutas dinámicas (/productos/[slug]). Productos organizados en un ritual de 4 pasos (Champú → Mascarilla → Alisado → Perfume Capilar).',
    },
    {
      title: 'Sección de educación científica',
      description:
        'Página dedicada a la ciencia (/ciencia) con 5 bloques editoriales alternados que documentan: el problema estructural (daño de la fibra capilar), el activo propio PGA (Ácido Poliglutámico), el activo propio MagNut Sense (exclusivo de L\'ORIGINE), el sistema de protocolo de 4 pasos y una muestra de productos. Paleta de color propia de la sección (Botanical Green, Forest, Sage, Gold científico). Componente RitualSteps, comparación antes/después y sección de CTA.',
    },
    {
      title: 'Historia de marca (Nosotros)',
      description:
        'Página editorial de la historia de la marca con una historia destacada a doble página (división 62/38 entre imagen y texto), un layout masonry con columnas CSS para 6 historias de apoyo (ciencia, magnunsense, fundadores, propósito, visión y un brand film con video), una sección con la cita de los fundadores y un CTA editorial de cierre. Las historias abarcan de 2021 a 2025. Integración con el scroll suave de Lenis.',
    },
    {
      title: 'Sección de academia',
      description:
        'Página dedicada a la academia (/academia) con hero oscuro, 4 pilares de beneficios, 4 cursos destacados, una metodología de 3 pasos, una cuadrícula de instructores (4 expertos), testimonios (los resultados de negocio no se han verificado de forma independiente) y un CTA de cierre. Los datos de los cursos están en src/data/courses.ts, con 4 cursos (niveles: iniciación, intermedio, avanzado, experto; modalidades: presencial, online, híbrido).',
    },
    {
      title: 'Red de distribuidores',
      description:
        'Página dedicada a distribuidores (/distribuidores) con hero, una cuadrícula de aliados (12 distribuidores) y una sección de contacto con formulario (nombre, correo, país y ciudad, tipo de negocio, mensaje) y canales de contacto (correo, WhatsApp, teléfono). Tema oscuro Espresso para la sección de distribuidores.',
    },
    {
      title: 'Blog/Journal',
      description:
        'Blog en el cliente (/blog) con layout masonry de columnas CSS (responsive: 1 columna en móvil, 2 en tablet, 3 en escritorio), 7 filtros por categoría (Todo, Ciencia, Protocolos, Ingredientes, Productos, Academia, Tendencias), 9 artículos con proporciones variadas (4:3, 3:4, 16:9, cuadrada) y filtrado por categoría. Masonry sin JavaScript: solo columnas CSS.',
    },
    {
      title: 'Casos de estudio (Evidencia Técnica)',
      description:
        '3 casos documentados con categorías de protocolo (Alisado profesional, Tratamiento en cabina, Mantenimiento profesional), tiempos, objetivos técnicos, resultados observables y etiquetas de activos. El caso destacado (alisado) va a doble página horizontal y los secundarios en una cuadrícula vertical. Tema oscuro Espresso.',
    },
    {
      title: 'View Transitions API como mejora progresiva',
      description:
        'El componente PageTransition registra viewTransitionName = "root" en <html>. View Transitions API nativa para animaciones entre páginas en los navegadores compatibles (Chrome/Edge 111+, Safari 18.1+). Respaldo con keyframes CSS (vt-fade-out, vt-fade-in). No hace nada si la API no está disponible. Respeta prefers-reduced-motion.',
    },
    {
      title: 'Sistema de diseño (color, tipografía, espaciado)',
      description:
        'Más de 28 tokens de color definidos con la directiva @theme de Tailwind v4. Paleta: Ivory Canvas (#F8F5EF) para fondos, Champagne (#B8945A) como acento de marca, Carbon (#1B1815) para texto, Espresso (#231B16) para secciones oscuras y Botanical Green (#304338) para ciencia. 3 familias tipográficas: Playfair Display (logo) y Red Hat Display (títulos y cuerpo). Escala de espaciado: 8·16·24·32·48·64·96·128. Distribución del color: 65 % fondos claros, 20 % fotografía, 10 % oscuro, 5 % acento. Alias semánticos de color para la compatibilidad de los componentes.',
    },
    {
      title: 'Infraestructura de accesibilidad',
      description:
        'Enlace para saltar al contenido (sr-only y enfocable), detección de prefers-reduced-motion en todos los componentes de movimiento (useReducedMotion de Framer Motion), anulación global de movimiento reducido en CSS (duraciones de 0.01ms), landmarks semánticos (<main>, <nav>, <section> con aria-labels), estilos de anillo focus-visible, texto alternativo en todas las imágenes y una jerarquía de títulos correcta.',
    },
    {
      title: 'Sistema de SEO y metadatos',
      description:
        'Generador de metadatos SEO (buildMetadata en lib/seo.ts) que crea OpenGraph, tarjetas de Twitter, URLs canónicas y palabras clave por página. Locale en español (es-CO). Generación del sitemap (/sitemap.ts). meta robots index/follow. Plantilla de metadatos con el nombre del sitio como sufijo.',
    },
  ],
  challenges: [
    {
      title: 'Rendimiento del hero cinematográfico frente al LCP',
      description:
        'La sección hero necesita video, parallax, brillos ambientales y una sensación premium manteniendo el Largest Contentful Paint por debajo de 2.5 s. El autoplay del video puede bloquear la carga de la página, y la imagen póster debe ser el verdadero elemento LCP.',
      resolution:
        'La imagen póster (hero.webp) es el verdadero elemento LCP, con carga prioritaria. El video es una mejora progresiva: se carga solo después de mostrar el póster y solo si el usuario no activó prefers-reduced-motion. La velocidad de reproducción es de 0.85 para una sensación más lenta. Los efectos de parallax usan useScroll + useTransform (pasivos, sin RAF).',
    },
    {
      title: 'Migrar transiciones escritas a mano a tokens de movimiento',
      description:
        'Al principio del desarrollo había transiciones de framer-motion con duraciones escritas a mano (0.5, 0.8) y easings en línea. Eso generaba inconsistencia visual entre secciones e impedía cambiar los tiempos de forma global sin tocar cada componente.',
      resolution:
        'Todas las duraciones, easings y distancias se centralizaron en src/lib/motion.ts, con 7 componentes de movimiento construidos encima. El historial de Git muestra tareas de migración dedicadas: "Task 5: Migrate hardcoded transitions to motion utilities" y "Motion Polish: RitualSteps — Token Transitions". No quedan valores de transición escritos a mano.',
    },
    {
      title: 'Layout masonry sin JavaScript',
      description:
        'Las páginas del blog y de nosotros necesitan cuadrículas masonry. Las soluciones con JavaScript (Masonry, react-masonry-css) suman peso al bundle, provocan saltos de layout y complican el SSR.',
      resolution:
        'Columnas CSS con [column-count] por breakpoint (1→2→3) y [column-gap], y break-inside-avoid en los hijos. No usa JavaScript, se adapta bien al reflujo y funciona con SSR. La contrapartida es el orden de llenado (de arriba abajo por columna, no de izquierda a derecha por fila), aceptable para contenido editorial.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Filtros del catálogo representados en la URL',
      context:
        'El catálogo público combina la presentación de la marca con filtros por categoría, orden y páginas de detalle de producto.',
      decision:
        'Leer y validar categoria y orden desde searchParams en el catálogo renderizado en el servidor. Filtrar y ordenar los productos publicados con esos parámetros.',
      reasoning:
        'Una selección del catálogo sigue siendo accesible mediante un enlace y la navegación del navegador. El sitio público actual muestra un carrito y controles de compra; los flujos privados de checkout y pago no se probaron para este portafolio.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Tokens de movimiento centralizados en lugar de animaciones sueltas',
      context:
        'Framer Motion permite definir duración y easing en línea en cada animación. Sin centralizarlos, las animaciones se desalinean visualmente y cualquier cambio global de tiempos obliga a editar cada componente.',
      decision:
        'Todos los valores de movimiento se centralizan en src/lib/motion.ts, con 7 componentes reutilizables construidos sobre los tokens. Las variantes viven en src/components/motion/variants.ts como presets. Los componentes aceptan props opcionales de retraso y variante.',
      reasoning:
        'Una única fuente de verdad para todos los valores de movimiento. Un cambio global de tiempos requiere editar un solo archivo. Las animaciones nuevas combinan tokens existentes sin reinventarlos. La accesibilidad (movimiento reducido) se maneja por defecto en cada componente.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Masonry con columnas CSS en lugar de una cuadrícula con JavaScript',
      context:
        'Las páginas del journal y de la historia de la marca necesitan layouts con proporciones variadas. Las librerías de masonry con JavaScript suman peso al bundle, provocan CLS y complican el SSR.',
      decision:
        'Usar columnas CSS con [column-count] por breakpoint (1/2/3) y [column-gap]. Los elementos usan break-inside-avoid.',
      reasoning:
        'Cero JavaScript, sin impacto en el bundle, sin CLS y compatible con SSR. El orden de llenado por columna es una contrapartida aceptable para contenido editorial. Es responsive cambiando una sola propiedad CSS.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'View Transitions API como mejora progresiva',
      context:
        'Las animaciones de navegación entre páginas mejoran el rendimiento percibido, pero el soporte de los navegadores no es universal (Chrome 111+, Safari 18.1+). Depender de la disponibilidad de la API dejaría a algunos usuarios sin transiciones.',
      decision:
        'El componente PageTransition registra viewTransitionName en <html> y usa @keyframes como respaldo. Se usa la API cuando está disponible y, si no, el respaldo CSS. Framer Motion no se usa para las transiciones de página.',
      reasoning:
        'Las transiciones nativas son más fluidas y no suman al bundle. El respaldo CSS asegura cobertura universal. Sin dependencia de Framer Motion para la animación a nivel de página. El movimiento reducido se respeta en CSS con una media query.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Next.js independiente en lugar de monorepo',
      context:
        'Otros proyectos del portafolio usan monorepos con Turborepo. L\'ORIGINE es una aplicación independiente de marca y comercio, sin paquetes compartidos de workspace.',
      decision:
        'Aplicación independiente en Next.js 16. Sin Turborepo, sin workspaces de pnpm y sin paquetes compartidos.',
      reasoning:
        'La sobrecarga de un monorepo (orquestación de tareas, configuración de workspaces, hoisting de dependencias) no aporta nada a un proyecto de una sola aplicación. npm es suficiente. Reduce la complejidad del CI y la carga cognitiva del desarrollo.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Server components con islas de cliente aisladas',
      context:
        'El App Router de Next.js 16 usa server components por defecto. Las animaciones de movimiento requieren interactividad en el cliente.',
      decision:
        'Las páginas son server components por defecto. Los componentes de cliente se limitan a los envoltorios de movimiento (Reveal, Stagger) y a las secciones interactivas (filtros del blog). "use client" a nivel de sección, no de página.',
      reasoning:
        'Máximo renderizado en el servidor para el contenido. Bundle de cliente mínimo: solo se envía al navegador el código de animación e interacción. Cada frontera "use client" se justifica por una necesidad real de interactividad.',
      impact: DECISION_IMPACT.Medium,
    },
  ],
  lessonsLearned: [
    {
      title: 'Los tokens de movimiento eliminan el desalineamiento de las animaciones',
      description:
        'Centralizar duraciones, easings y distancias en un solo archivo (lib/motion.ts) eliminó la inconsistencia de los valores de transición escritos a mano. Un cambio global de tiempos (por ejemplo, pasar todos los reveals de 0.65 s a 0.85 s) quedó en una edición de una línea. La migración a tokens requirió tareas dedicadas, pero evitó desalineamientos futuros.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'El masonry con columnas CSS es más simple y rinde mejor que las alternativas con JavaScript',
      description:
        'Construir el masonry del blog y de nosotros con columnas CSS en lugar de una librería de JavaScript dejó el layout sin JavaScript, sin CLS y responsive de forma automática. El orden de llenado por columna (de arriba abajo) funciona de forma natural para líneas de tiempo editoriales y cuadrículas de artículos.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'La filosofía editorial evita el exceso de funcionalidades',
      description:
        'La Design Constitution v1.0 (que define la misión, el KPI y la personalidad visual de cada página) funcionó como filtro de decisiones durante todo el desarrollo. Cada funcionalidad propuesta se evaluó con la pregunta "¿esto inspira, educa o genera confianza, o solo vende?", lo que evitó funcionalidades de e-commerce innecesarias como popups, carruseles y banners de descuento.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'El sistema de animación requiere una fase de pulido dedicada',
      description:
        'El sistema de movimiento se construyó poco a poco junto con las funcionalidades, pero el pulido final (la FASE 12.5 dedicada en el historial de Git) fue esencial para la coherencia visual. Las transiciones con tokens, la adopción de ImageReveal, los efectos de salida al hacer scroll y la eliminación de transiciones escritas a mano ocurrieron en una fase dedicada al pulido del movimiento, no durante la implementación inicial.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'La View Transitions API funciona bien como mejora progresiva',
      description:
        'Agregar la View Transitions API nativa con respaldo de keyframes CSS dio una navegación fluida entre páginas sin costo de bundle. El patrón @keyframes vt-fade-in/vt-fade-out es más simple y rinde mejor que AnimatePresence de Framer Motion para las transiciones de página. No todos los navegadores la soportan, pero el respaldo asegura cobertura universal.',
      category: LESSON_CATEGORY.Architecture,
    },
  ],
  metrics: { commits: null, contributors: null, durationWeeks: null, modules: null, tests: null, coverage: null },
  media: [
    { type: 'image', url: '/projects/lorigine-desktop.png', alt: 'L’ORIGINE · vista de escritorio', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: true },
    { type: 'image', url: '/projects/lorigine-mobile.png', alt: 'L’ORIGINE · vista de móvil', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: false }
  ],
  links: {
    live: 'https://www.lorigine.com.co/',
  },
  role: {
    title: 'Software Engineer & Product Owner',
    responsibilities: [
      'Desarrollo full-stack: plataforma de marca con el App Router de Next.js 16',
      'Hero cinematográfico con parallax, video y efectos ambientales',
      'Diseño del sistema de movimiento centralizado (tokens, variantes, 7 componentes)',
      'Catálogo de productos con sistema de categorías y orden, y páginas de detalle',
      'Sección de educación científica con la narrativa de los activos propios',
      'Páginas de casos, academia y red de distribuidores',
      'Layouts masonry con columnas CSS para el journal y la historia de la marca',
      'View Transitions API como mejora progresiva',
      'Implementación del sistema de diseño (más de 28 tokens de color, 3 familias tipográficas, espaciado)',
      'Infraestructura de accesibilidad (saltar al contenido, movimiento reducido, landmarks)',
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
