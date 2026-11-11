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

export const kliniu: Project = {
  id: 'kliniu',
  slug: 'kliniu',
  name: 'Kliniu',
  tagline: 'Comercio electrónico e higiene institucional',
  summary: 'Comercio electrónico de dispensadores e insumos de higiene para empresas, con catálogo, cotizaciones y herramientas de administración.',
  description:
    'Kliniu es una plataforma de comercio electrónico en producción construida con Next.js 16, React 19, Prisma + PostgreSQL (Supabase) y Tailwind CSS v4. Es una tienda B2B de productos de higiene institucional: dispensadores de líquidos, de papel, de jabón y accesorios relacionados. La plataforma incluye un catálogo completo con categorías enriquecidas (banners propios, guías de compra, variantes de color, galería, video), carrito, checkout, gestión de pedidos sincronizada con Odoo ERP, un panel de administración de 15 módulos, un chatbot de IA (OpenAI) para descubrir productos, búsqueda por imagen, precios por volumen, cotizaciones comerciales con configuración de impuestos, gestión de producción (máquinas, corridas, seguimiento de calidad), planeación de órdenes de producción, seguimiento de campañas de marketing, configuración de costos por vendedor, puntos de fidelización, permisos de usuario granulares, integración con Kommo CRM, compartir por WhatsApp y diseño responsive pensado primero para móvil.',
  status: PROJECT_STATUS.Production,
  featured: true,
  public: true,
  startedAt: '2026-05-13',
  completedAt: null,
  lastUpdated: '2026-09-10',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Tailwind CSS', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Prisma', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'PostgreSQL', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Supabase', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'OpenAI', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Working },
    { name: 'bcryptjs', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'JWT (jose)', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Odoo', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Kommo CRM', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Playwright', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'ESLint', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'react-icons', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
  ],
  architecture: [
    ARCHITECTURE_PATTERN.Monorepo,
    ARCHITECTURE_PATTERN.LayeredArchitecture,
  ],
  features: [
    {
      title: 'Catálogo de productos',
      description:
        'Catálogo completo con categorías, marcas, SKU, referencias OEM, referencias alternativas, imágenes de galería, variantes de color, video, especificaciones técnicas y metadatos de categoría enriquecidos (banners propios, imágenes principales, guías de compra).',
    },
    {
      title: 'Carrito de compras',
      description:
        'Carrito en el cliente para productos individuales y combos, con manejo de cantidades y almacenamiento persistente.',
    },
    {
      title: 'Checkout',
      description:
        'Flujo de pago completo con dirección de envío, selección de departamento y ciudad, resumen del pedido y sincronización con Odoo.',
    },
    {
      title: 'Gestión de pedidos',
      description:
        'Ciclo de vida completo del pedido con seguimiento de estado (PENDING, PAID, CANCELLED), estado de envío (PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED), notas de administración, transportadora y guía, y sincronización con Odoo.',
    },
    {
      title: 'Panel de administración',
      description:
        'Aplicación de administración de una sola página (/admin) con CRUD de productos, gestión de pedidos, ajustes de inventario, carga de imágenes con compresión automática a WebP, editor de variantes de color y editor de especificaciones técnicas.',
    },
    {
      title: 'Panel (dashboard del vendedor)',
      description:
        'Panel comercial de 15 módulos: dashboard, pedidos, productos, métricas, campañas, costos, calculadora de precios, cotizaciones, producción, Odoo, usuarios, banners, combos y outlet. Permisos granulares por módulo.',
    },
    {
      title: 'Gestión de productos',
      description:
        'CRUD completo de productos con carga de imágenes, compresión automática a WebP, gestión de galería, variantes de color (hasta 4 imágenes por variante), especificaciones técnicas e integración de video de YouTube.',
    },
    {
      title: 'Gestión de categorías',
      description:
        'Sistema de categorías con metadatos: tema de color, icono, banners (escritorio y móvil), banners principales, guías de compra, beneficios y textos. Categorías: dispensadores de líquidos, de papel, toallas y servilletas, de jabón, accesorios y más.',
    },
    {
      title: 'Sistema de banners',
      description:
        'Banners editables con claves únicas para el hero de inicio (3 diapositivas), la franja de características, el CTA de asesoría, el CTA de insumos y banners por categoría. Variantes responsive (escritorio y móvil). Vista previa en vivo en el panel.',
    },
    {
      title: 'Calculadora de precios',
      description:
        'Calculadora de venta para vendedores: costo del producto + envío + alistamiento + comisión + margen + costo de campaña. Calcula el precio final de venta con el desglose detallado.',
    },
    {
      title: 'Cotizaciones comerciales',
      description:
        'Sistema completo de cotizaciones con numeración automática (COT-AAAA-NNNNNN), flujo de estados (DRAFT -> SENT -> APPROVED/REJECTED/EXPIRED), configuración de impuestos (reteICA, reteFuente, IVA), copias del producto al momento de cotizar y conversión a pedidos. Generación de PDF (Playwright, reservada).',
    },
    {
      title: 'Chatbot de IA',
      description:
        'Buscador de productos con OpenAI sobre una copia del catálogo, distancia de Levenshtein para tolerar errores de escritura, sugerencias según la categoría y tarjetas de producto con precios y enlaces.',
    },
    {
      title: 'Búsqueda por imagen',
      description:
        'Búsqueda de productos subiendo una imagen. Usa IA y visión para encontrar productos coincidentes.',
    },
    {
      title: 'Precios por volumen',
      description:
        'Descuentos escalonados por producto a partir de 12, 48 y más de 100 unidades, con precio unitario configurable por tramo.',
    },
    {
      title: 'Combos',
      description:
        'Paquetes de productos con SKU, precio, imágenes y soporte de carrito propios. Destacados en la página de inicio con un carrusel.',
    },
    {
      title: 'Gestión de campañas',
      description:
        'Seguimiento de campañas de marketing con registros diarios (mensajes, transacciones, inversión publicitaria, ventas del día). Soporte para Meta Ads. Seguimiento de leads y cálculo de ROI.',
    },
    {
      title: 'Configuración de costos por vendedor',
      description:
        'Configuración de costos por vendedor: costo de producción, publicidad, envío, empaque, recaudo, imprevistos, costos fijos y porcentaje de devoluciones.',
    },
    {
      title: 'Gestión de producción',
      description:
        'Catálogo de máquinas (6 inyectoras), registro de corridas de producción con operario asignado, seguimiento de material, parámetros de inyección (peso, ciclo, temperatura) y control de calidad con resumen en vivo (piezas buenas, porcentaje de calidad). Patrón de calculadora pura: los campos derivados nunca se guardan.',
    },
    {
      title: 'Órdenes de producción',
      description:
        'Planeación de producción con ciclo de vida de la orden (DRAFT -> APPROVED -> IN_PRODUCTION -> COMPLETED -> CANCELLED). Productos del catálogo con cantidades, destino e instrucciones para la planta. Integración con las corridas de producción.',
    },
    {
      title: 'Gestión de outlet',
      description:
        'Gestión de productos con descuento (outlet) dentro del panel comercial.',
    },
    {
      title: 'Integración con Odoo ERP',
      description:
        'Sincronización de pedidos en ambos sentidos con Odoo ERP. Sincronización del catálogo, creación de pedidos, seguimiento del estado de sincronización (NOT_SYNCED, SYNCED, FAILED), registro de errores y reintentos.',
    },
    {
      title: 'Integración con Kommo CRM',
      description:
        'Integración con el CRM para gestionar leads y contactos. Autenticación OAuth2, mapeo de campos personalizados (teléfono, WhatsApp, empresa, ciudad, nivel del cliente, detalles del pedido) y soporte de webhooks.',
    },
    {
      title: 'Integración con WhatsApp',
      description:
        'Compartir productos por WhatsApp con mensajes generados automáticamente que incluyen nombre, SKU, referencia OEM, precio y URL. CTA de asesor en todo el sitio.',
    },
    {
      title: 'Puntos de fidelización y recompensas',
      description:
        'Programa de fidelización con acumulación y canje de puntos. Niveles de cliente (AQUA, CORAL, OCEAN, DIAMOND_SEAL), saldo de bonificación, movimientos de puntos y catálogo de recompensas con manejo de inventario.',
    },
    {
      title: 'Gestión de usuarios y permisos',
      description:
        'Control de acceso por roles (CUSTOMER, SELLER, ADMIN, PACKING, SUPERADMIN). Permisos granulares por módulo (ver, crear, editar, eliminar) para los 15 módulos del panel. Matriz de permisos por defecto para cada rol.',
    },
    {
      title: 'Gestión de inventario',
      description:
        'Seguimiento de stock con alertas de mínimo, historial de movimientos (creación, ajuste, descuento por pedido), ajustes rápidos desde el panel de administración e indicadores de agotado y bajo stock.',
    },
    {
      title: 'Dashboard de métricas',
      description:
        'Métricas e indicadores del negocio dentro del panel comercial.',
    },
    {
      title: 'Cuentas de usuario',
      description:
        'Registro de clientes, inicio de sesión (correo y contraseña, sesiones JWT), gestión del perfil, historial de pedidos y panel de puntos de fidelización.',
    },
    {
      title: 'Carga y procesamiento de imágenes',
      description:
        'Compresión de imágenes a WebP en el cliente (máximo 1200 px, calidad del 82 %) antes de subirlas a Supabase Storage. Galería de varias imágenes, imágenes por variante de color y conversión automática de formato.',
    },
  ],
  challenges: [
    {
      title: 'Modelo de precios por volumen',
      description:
        'Implementar precios escalonados por producto (12, 48 y más de 100 unidades) con un precio unitario distinto por tramo para más de 30 productos. Los precios vienen del Excel de un proveedor externo.',
      resolution:
        'Tabla de consulta centralizada PRODUCT_VOLUME_PRICES en lib/volume-discounts.ts con la estructura de tramos por slug de producto. El frontend recalcula el precio con descuento según la cantidad en el carrito.',
    },
    {
      title: 'Sincronización con Odoo ERP en ambos sentidos',
      description:
        'Mantener pedidos y productos sincronizados entre Kliniu y una instancia externa de Odoo ERP. Los fallos de sincronización, los reintentos, las condiciones de carrera y la recuperación de errores necesitaban un manejo robusto.',
      resolution:
        'Enum de estado de sincronización (NOT_SYNCED, SYNCED, FAILED) en cada pedido. Servicio de Odoo en lib/odoo.ts con lógica de reintentos, registro de errores y resincronización manual desde el panel. Sincronización de productos por XML-RPC (jsonrpc).',
    },
    {
      title: 'Cálculo de calidad de producción igual al Excel',
      description:
        'Reemplazar un sistema manual de seguimiento de producción en Excel (PLANILLA DIRIA) con más de 230 filas de datos históricos. Las fórmulas debían reproducirse con exactitud, y una fila tenía un error manual que no coincidía con la fórmula.',
      resolution:
        'Calculadora pura (lib/production-calculator.ts) que reproduce las fórmulas exactas (goodPieces = produced - damaged, qualityPercentage = ((goodPieces - nonConforming) / produced) * 100). QA verificó que 5 filas reales del Excel coincidían. La fila errónea se documentó, pero no se reprodujo.',
    },
    {
      title: 'Sistema de permisos granular',
      description:
        '15 módulos del panel, cada uno con permisos de ver, crear, editar y eliminar, aplicados tanto en el frontend (filtrado del menú lateral, visibilidad de botones) como en el backend (guardas de la API). Matrices por defecto distintas para cada rol.',
      resolution:
        'Matriz de permisos (lib/permission-defaults.ts) por rol con el enum PanelModule. Helpers requirePermission, requireAdmin y requireSuperAdmin en lib/permissions.ts. La interfaz filtra el menú y las acciones según los permisos efectivos.',
    },
    {
      title: 'Gestión de imágenes a escala',
      description:
        'Las imágenes de producto subidas desde el celular pueden superar los 15 MB. Las imágenes de galería, de variantes de color y de banners en varios tamaños (escritorio y móvil) necesitaban optimización.',
      resolution:
        'Compresión a WebP en el cliente antes de subir (compressImage en admin/page.tsx: máximo 1200 px, calidad del 82 %). Varios espacios de imagen (principal + 3 adicionales) más imágenes por variante de color (hasta 4 por variante). Sistema de banners con campos separados para escritorio y móvil.',
    },
    {
      title: 'Búsqueda de productos del chatbot de IA',
      description:
        'Construir un buscador de productos que entienda el contexto, tolere errores de escritura, reconozca la categoría y devuelva resultados relevantes de un catálogo de más de 100 productos.',
      resolution:
        'Algoritmo de distancia de Levenshtein para tolerar errores de escritura. Copia del catálogo precalculada con todos los productos y categorías. Sugerencias según los términos que coinciden y los que no. Integración con OpenAI para entender el lenguaje natural.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Los campos derivados nunca se guardan',
      context:
        'Las corridas de producción y las cotizaciones requieren campos calculados (goodPieces, qualityPercentage, lineTotal, subtotal, impuestos, totales). Guardar valores derivados crea riesgos de inconsistencia cuando cambian los datos de origen.',
      decision:
        'Todos los campos derivados se calculan con funciones puras en archivos dedicados (quotation-calculator.ts, production-calculator.ts). Nunca se guardan en columnas de la base de datos; se recalculan en cada lectura.',
      reasoning:
        'Las funciones puras garantizan el mismo resultado para las mismas entradas. Eliminan los problemas de sincronización entre los datos crudos y los valores calculados. Las specs verifican explícitamente que el esquema no tenga columnas derivadas.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Copias del producto en las cotizaciones',
      context:
        'Las cotizaciones deben conservar el precio y el nombre del producto del momento en que se cotizó, aunque el catálogo cambie después. Pero las imágenes deben mantenerse actualizadas.',
      decision:
        'Copiar unitPrice y name en QuotationItem al crearlo. La imagen se resuelve desde Product.image al leer (o manualImageUrl para ítems de texto libre).',
      reasoning:
        'El precio y el nombre son contractuales (la cotización es una oferta comercial en un momento dado). La imagen es ilustrativa y conviene que esté al día.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'ProductionOrder requiere productos del catálogo',
      context:
        'ProductionOrder planea qué se va a fabricar. A diferencia de las cotizaciones (que admiten ítems de texto libre), fabricar requiere un producto conocido con especificaciones y datos de BOM existentes.',
      decision:
        'ProductionOrderItem.productId es obligatorio (no admite nulos). El nombre, la referencia y la imagen del producto se leen con un join a Product al momento de la lectura; nunca se copian.',
      reasoning:
        'Una orden de producción representa un plan de fabricación ejecutable. Cada ítem debe ser un producto conocido. La exactitud histórica importa menos que tener los datos actuales del producto para producir.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Máquina de estados para los flujos de documentos',
      context:
        'Las cotizaciones y las ProductionOrders tienen ciclos de vida definidos con transiciones permitidas. Manipular el estado libremente produce documentos inconsistentes.',
      decision:
        'Estados explícitos con enum y guardas de transición en el backend (assertDraft, assertSent, etc.). Solo se aceptan las transiciones permitidas, con códigos de error descriptivos.',
      reasoning:
        'Las máquinas de estado aseguran la integridad de los documentos a nivel de API, no solo en la interfaz. El patrón se reutiliza en Quotation y ProductionOrder con la misma arquitectura de guardas.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Supabase para autenticación y almacenamiento',
      context:
        'La plataforma de comercio electrónico necesita autenticación (correo y contraseña, sesiones JWT) y almacenamiento de imágenes. Construir soluciones propias aumentaría el mantenimiento.',
      decision:
        'Usar Supabase Auth para las sesiones y Supabase Storage para las imágenes de productos y banners. PostgreSQL a través del pooler de Supabase como base de datos.',
      reasoning:
        'Supabase reúne autenticación, almacenamiento y PostgreSQL en una sola plataforma. Sesiones JWT con cookies para el panel de administración. Bucket product-images con URLs públicas.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Integración con Odoo como servicio asíncrono',
      context:
        'Los pedidos creados en Kliniu deben sincronizarse con Odoo ERP. Las llamadas síncronas directas bloquearían el checkout y harían que la plataforma dependiera de la disponibilidad de Odoo.',
      decision:
        'El pedido se crea primero en la base de datos de Kliniu y luego se sincroniza con Odoo de forma asíncrona, con seguimiento de estado (NOT_SYNCED, SYNCED, FAILED). Se puede resincronizar a mano desde el panel.',
      reasoning:
        'Separa la disponibilidad de la plataforma de la del ERP. Los fallos de sincronización se recuperan sin pérdida de datos. El registro de errores permite el monitoreo.',
      impact: DECISION_IMPACT.High,
    },
  ],
  lessonsLearned: [
    {
      title: 'El patrón de calculadora pura evita inconsistencias de datos',
      description:
        'Construir quotation-calculator.ts y production-calculator.ts como funciones puras (sin acceso a la base de datos, deterministas) eliminó todos los errores de sincronización entre los datos crudos y los campos calculados. Las mismas entradas siempre producen el mismo resultado, sin importar cuándo ni dónde se calcule.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Las máquinas de estado hacen predecibles los flujos de documentos',
      description:
        'Los enums de estado explícitos con guardas de transición en el backend (assertDraft, INVALID_TRANSITION) evitaron cambios de estado inválidos a nivel de API. El mismo patrón de guardas se reutilizó en cotizaciones y órdenes de producción sin modificarlo.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Supabase Storage requiere optimizar en el cliente',
      description:
        'La compresión a WebP antes de subir imágenes reduce el tamaño de los archivos. No hay una medición fechada de ahorro de almacenamiento o tiempos de carga en esta revisión.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'La migración de Excel a un sistema requiere QA fila por fila',
      description:
        'Durante la migración del seguimiento de producción, 1 de 230 filas del Excel tenía un valor ingresado a mano que no coincidía con la fórmula. Una migración automática sin QA por fila habría reproducido el error sin que nadie lo notara.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'Los permisos granulares deben aplicarse en el frontend y en el backend',
      description:
        'Ocultar permisos solo en la interfaz se evita con facilidad. Aplicarlos solo en el backend confunde a los usuarios (los botones aparecen pero las llamadas a la API fallan). Aplicarlos en ambas capas con la misma lógica de permisos da seguridad y una buena experiencia.',
      category: LESSON_CATEGORY.Architecture,
    },
  ],
  metrics: { commits: null, contributors: null, durationWeeks: null, modules: null, tests: null, coverage: null },
  media: [
    { type: 'image', url: '/projects/kliniu-desktop.png', alt: 'Kliniu · vista de escritorio', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: true },
    { type: 'image', url: '/projects/kliniu-mobile.png', alt: 'Kliniu · vista de móvil', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: false }
  ],
  links: { live: 'https://kliniucolombia.com/' },
  role: {
    title: 'Software Engineer & Full-Stack Developer',
    responsibilities: [
      'Desarrollo full-stack: plataforma de comercio electrónico en Next.js desde cero',
      'Diseño del esquema de base de datos (Prisma + PostgreSQL, más de 20 modelos)',
      'Panel de administración y panel comercial (15 módulos con permisos)',
      'Integración con Odoo ERP y con Kommo CRM',
      'Implementación del chatbot de IA (OpenAI + coincidencia por Levenshtein)',
      'Sistema de gestión de producción con arquitectura de calculadora pura',
      'Sistema de cotizaciones con ciclo de vida de máquina de estados',
      'Flujo de carga de imágenes con compresión automática a WebP',
      'Implementación del modelo de precios por volumen',
      'Gestión de usuarios y sistema de permisos granular',
    ],
  },
  tags: [
    'e-commerce',
    'nextjs',
    'typescript',
    'tailwind-v4',
    'prisma',
    'supabase',
    'openai',
    'odoo',
    'production-management',
    'admin-panel',
    'b2b',
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
