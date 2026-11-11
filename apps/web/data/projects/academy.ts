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

export const academy: Project = {
  id: '4ustudio-academy',
  slug: '4ustudio-academy',
  name: '4U Studio Academy',
  tagline: 'Academia de música presencial en Bogotá',
  summary: 'Plataforma de una academia de música en Bogotá: oferta de clases, agenda, inscripciones y portal para estudiantes.',
  description:
    '4U Studio Academy es una plataforma full-stack para una academia de música presencial en Bogotá, Colombia (Calle 93 #46-44). Está construida con el App Router de Next.js 16, React 19, TypeScript 6 y Supabase (Postgres 17, Auth, Storage, Realtime). La plataforma atiende tres roles: visitantes públicos, estudiantes y administradores. Las páginas públicas incluyen inicio, planes para adultos y para niños y adolescentes, cursos y lecciones (6 instrumentos: guitarra, piano, canto, batería, bajo y producción), nosotros, contacto, agendamiento (agendar), inscripción (inscripcion) con contrato digital firmado en canvas (signature_pad) y generado como PDF (react-pdf, hash SHA-256, guardado en Supabase Storage), herramientas musicales con IA (quiz de perfil, dream builder y simulador de carrera con puntuación en 5 dimensiones), términos v2.0, información corporativa y un flujo de confirmación de asistencia con token. El portal del estudiante (/mi-cuenta) incluye dashboard, calendario de clases, horario mensual, historial del recorrido Music 4U AI, inicio de sesión, registro y recuperación de contraseña. El panel de administración tiene más de 15 rutas: dashboard ejecutivo con estadísticas en vivo, gestión de estudiantes (ciclo de vida completo: lead, matriculado, activo, riesgo, inactivo, exalumno), embudo de inscripciones (CRM Comercial V1 con métricas de embudo, seguimiento de conversión y atribución de origen), agenda con disponibilidad en tiempo real (10 a. m. a 10 p. m. de lunes a viernes, con bloqueo de festivos colombianos), gestión de instructores (perfiles, horarios, disponibilidad), pagos (generación de links de pago de Bold, verificación de webhooks, seguimiento de mora), dashboard de ventas, gestión de leads, dashboard de retención (puntuación de riesgo, alertas, línea de tiempo de actividad), centro de reactivación (tareas, campañas), indicadores académicos, registro de actividad del sistema y motor de automatización (cron jobs para recordatorios de asistencia, actualización del riesgo y seguimientos automáticos). WhatsApp Cloud API (Meta Graph v21.0) gestiona confirmaciones de inscripción, notificaciones de pago, recordatorios de clase, avisos de reprogramación y alertas internas del equipo, con mensajes idempotentes y registro de actividad. La integración con la pasarela de pagos Bold soporta pruebas en sandbox, verificación de firma HMAC, generación de links de pago y procesamiento de webhooks. El sistema de retención usa el seguimiento del ciclo de vida del estudiante, puntuación de riesgo, registro de eventos de actividad (más de 30 tipos) y campañas de reactivación automáticas. El calendario calcula los festivos colombianos de forma algorítmica (Ley Emiliani, cálculo de la Pascua) para bloquear la agenda. Infraestructura: Next.js independiente, Supabase, despliegue en Vercel, sin monorepo.',
  status: PROJECT_STATUS.Production,
  featured: true,
  public: true,
  startedAt: '2026-02-01',
  completedAt: null,
  lastUpdated: '2026-09-10',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'Tailwind CSS', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Supabase', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'PostgreSQL', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'react-pdf', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'signature_pad', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'react-icons', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'resend', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Bold Payments', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Working },
    { name: 'WhatsApp Cloud API', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Playwright', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'ESLint', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
  ],
  architecture: [
    ARCHITECTURE_PATTERN.LayeredArchitecture,
    ARCHITECTURE_PATTERN.DesignSystem,
    ARCHITECTURE_PATTERN.ModuleSystem,
    ARCHITECTURE_PATTERN.Serverless,
  ],
  features: [
    {
      title: 'Panel de administración: más de 15 rutas',
      description:
        'Panel de administración completo con dashboard ejecutivo, gestión de estudiantes (CRM con ciclo de vida completo), embudo de inscripciones con métricas, agenda con disponibilidad en tiempo real y bloqueo de festivos colombianos, perfiles y disponibilidad de instructores, gestión de pagos con generación de links de Bold, dashboard de ventas, gestión de leads, dashboard de retención con puntuación de riesgo, centro de tareas de reactivación, indicadores académicos, registro de actividad del sistema con más de 30 tipos de evento y motor de automatización. Tema oscuro con alternancia claro/oscuro. Navegación en cajón responsive en móvil.',
    },
    {
      title: 'Sistema de inscripción con contrato digital',
      description:
        'Formulario de inscripción en varios pasos (inscripcion) para inscribirse uno mismo, a un hijo o a otra persona. Recoge datos del estudiante, curso de interés, nivel, horario preferido y consentimientos legales (términos v2.0, tratamiento de datos, derechos de imagen). Genera el contrato digital como PDF con react-pdf y la firma en canvas incrustada (signature_pad). Guarda el hash SHA-256 del PDF para verificar su integridad. Los documentos se suben a Supabase Storage. Estados del embudo de inscripción: pending, contacted, clase_prueba, perdido, converted. Notificación automática por WhatsApp al recibir una inscripción.',
    },
    {
      title: 'Sistema de agendamiento y agenda',
      description:
        'Flujo de agendamiento en varios pasos (agendar) con selección de curso, presentación de instructores con biografía y un calendario en tiempo real con los cupos disponibles (10 a. m. a 10 p. m. de lunes a viernes). Bloqueo de festivos colombianos con cálculo algorítmico (Ley Emiliani, cálculo de la Pascua). Gestión de la disponibilidad de instructores. Reserva, reprogramación y cancelación de clases por parte del estudiante con política de 24 horas. Confirmación de asistencia con links con token. Seguimiento de cancelaciones tardías e inasistencias. Soporte para horarios semanales recurrentes.',
    },
    {
      title: 'Portal del estudiante (Mi Cuenta)',
      description:
        'Portal completo del estudiante con un dashboard según el rol que muestra la próxima clase, el avance del plan, el uso mensual y la actividad reciente. Calendario de clases con horario en tiempo real. Reporte mensual de clases descargable en PDF. Historial del recorrido Music 4U AI. Flujos de inicio de sesión, registro y recuperación de contraseña. Autenticación SSR de Supabase con sesiones por cookies.',
    },
    {
      title: 'Integración con WhatsApp Cloud API',
      description:
        'Integración completa con WhatsApp Cloud API (Meta Graph v21.0). 6 plantillas aprobadas por Meta: enrollment_received, payment_confirmed, account_activated, class_reminder, class_rescheduled, internal_alert. Mensajes idempotentes mediante la tabla whatsapp_messages. Registro de actividad del sistema para todos los mensajes. Degradación controlada cuando la API no está disponible. Normalización de teléfonos colombianos.',
    },
    {
      title: 'Pasarela de pagos Bold',
      description:
        'Integración con la pasarela de pagos colombiana Bold. Generación de links de pago con monto de tipo CLOSE y moneda COP. Modo sandbox con verificación de firma HMAC. Procesamiento de webhooks con idempotencia. Seguimiento del ciclo de vida del pago: pending, confirmed, overdue. Registro manual de pagos y seguimiento de mora.',
    },
    {
      title: 'Music 4U AI',
      description:
        'Tres herramientas interactivas con IA: Quiz de perfil (puntuación musical en 5 dimensiones: creatividad, disciplina, interpretación, producción, performance), Dream Builder (hoja de ruta personalizada con metas por fases) y Simulador de carrera (escenarios ramificados con cambios de puntuación). 6 arquetipos musicales (Creador Expresivo, Intérprete Nato, Arquitecto Sonoro, Técnico Disciplinado, Artista Integral, Explorador Musical). 4 tipos de carrera. Recomendaciones de cursos y planes según la puntuación. El recorrido se guarda con una clave anónima.',
    },
    {
      title: 'Motor de retención y reactivación',
      description:
        'Gestión del ciclo de vida del estudiante (lead, matriculado, activo, riesgo, inactivo, exalumno). Alertas de retención con niveles de severidad (info, warning, critical). Sistema de tareas de reactivación con mensajes de campaña automáticos. Puntuación de riesgo según patrones de asistencia, historial de pagos y actividad. Registro de eventos de actividad con más de 30 tipos. Cron jobs automáticos para actualizar el riesgo y hacer seguimientos.',
    },
    {
      title: 'Motor de automatización',
      description:
        'Sistema de automatización con cron: recordatorios de asistencia (diario), ejecutor de automatizaciones (diario, procesa los trabajos programados) y actualización del riesgo (diario, recalcula la puntuación de riesgo de los estudiantes). Cola de trabajos mediante la tabla automation_jobs. Registro de actividad de todas las acciones automáticas.',
    },
    {
      title: 'Sistema de planes y cursos',
      description:
        '6 cursos: guitarra, piano, canto, batería, bajo y producción musical. Planes para adultos: New Talent, Fast Talent, Artista, Artista Premium, Profesional y Corporativo. Planes Kids & Teens con una metodología según la edad. Cada plan incluye 8 clases al mes, sesiones de grabación en estudio, entregables de mezcla y masterización y presentaciones en vivo. Precios dinámicos y comparación de características.',
    },
    {
      title: 'Presencia digital',
      description:
        'Páginas públicas: inicio con una franja de videos testimoniales, hero con audio en reproducción automática y tarjetas de cursos. Página de nosotros con la sección del equipo (4 instructores con tarjetas filtrables y modales), tarjetas de misión, historia y filosofía, y un carrusel de videos. Página de lecciones con modales premium de los cursos. Página de contacto con integración de WhatsApp y mapa. Metadatos SEO por página. Scroll suave con Lenis. Animaciones con Framer Motion.',
    },
    {
      title: 'Sistema de calendario colombiano',
      description:
        'Cálculo algorítmico de los festivos colombianos (Ley Emiliani, Domingo de Pascua, festivos fijos). Calendario de producción con eventos académicos, conciertos, recitales, presentaciones y cierres. Mapa de festivos para consultas de fecha O(1) en varios años. Bloqueo de la agenda en festivos y fines de semana.',
    },
  ],
  challenges: [
    {
      title: 'Políticas RLS complejas para el acceso por varios roles',
      description:
        'Tres roles de usuario (público, estudiante, administrador) con necesidades de acceso a datos que se superponen. Las sesiones de clase requerían consultas públicas de disponibilidad, lecturas del dashboard del estudiante y acceso total del administrador. Las primeras políticas RLS eran demasiado permisivas o demasiado restrictivas.',
      resolution:
        'Rol de servicio (cliente de administración) para todas las operaciones de administración. Rol de estudiante autenticado con consultas restringidas a cada estudiante. Rol público con acceso de solo lectura a los datos de disponibilidad. Los commits de migración muestran correcciones de RLS dedicadas en más de 5 iteraciones (class_sessions, enrollments, students).',
    },
    {
      title: 'Conflictos en la agenda en tiempo real con reservas simultáneas',
      description:
        'Varios estudiantes reservando el mismo horario generaban condiciones de carrera. La disponibilidad de la sesión cambiaba entre que se mostraba el calendario y se enviaba la reserva.',
      resolution:
        'Validación del cupo en el servidor al reservar. Detección de condiciones de carrera (marca isRaceCondition) con un mensaje para reintentar. Suscripciones en tiempo real (Supabase Realtime) para actualizar el calendario en vivo. El historial de commits muestra correcciones dedicadas de "resiliencia del tiempo real".',
    },
    {
      title: 'Dependencia de la aprobación de plantillas de WhatsApp',
      description:
        'Meta exige aprobar las plantillas antes de enviarlas. Cambiar plantillas o crear nuevas retrasa los despliegues. Un rechazo bloquea notificaciones críticas.',
      resolution:
        '6 plantillas aprobadas de antemano con cuerpos genéricos parametrizados. Respaldo local (console.error + registro en la base de datos) cuando la API no está disponible. Los mensajes idempotentes evitan envíos duplicados. Plantilla de alerta interna para las notificaciones del equipo.',
    },
    {
      title: 'Diferencias entre el sandbox y producción de Bold',
      description:
        'Los entornos sandbox y de producción de Bold se comportan distinto en la API. La validación HMAC del sandbox difiere de la de producción, y el contenido de los webhooks varía entre entornos.',
      resolution:
        'La variable de entorno BOLD_SANDBOX controla la selección de llaves y la omisión de la validación HMAC. Registro completo de webhooks en desarrollo. Registro de actividad de todas las interacciones con la API de Bold. Manejo separado de las llaves de prueba y de producción.',
    },
    {
      title: 'Complejidad del ciclo de vida del estudiante',
      description:
        'Los estudiantes pasan por varios estados (lead → matriculado → activo → riesgo → inactivo → exalumno), con distinta visibilidad de datos, estado de pago y necesidades de comunicación en cada etapa. La lógica de retención debe considerar asistencia, pagos, actividad y factores de tiempo.',
      resolution:
        'Estado del ciclo de vida centralizado con vistas calculadas (v_academic_risk, v_high_risk_students). Sistema de eventos de actividad (más de 30 tipos) como registro de auditoría inmutable. Dashboard de retención con métricas agregadas. Actualización automática del riesgo con cron.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Supabase como único backend en lugar de una API propia',
      context:
        'La plataforma necesita autenticación, base de datos, tiempo real y almacenamiento. Construir una API propia suma tiempo de desarrollo y mantenimiento.',
      decision:
        'Supabase como única plataforma de backend: Auth (Supabase SSR), base de datos (Postgres 17), Storage (bucket de documentos) y Realtime (class_sessions, payments). Cliente de administración (service_role) para las operaciones de administración, cliente autenticado para las del estudiante y cliente público para las consultas anónimas de disponibilidad.',
      reasoning:
        'Reduce la superficie de API a cero: no hacen falta endpoints propios para el CRUD. El tiempo real viene incluido para las actualizaciones de la agenda. Storage guarda los PDF de los contratos. RLS aporta seguridad por fila. Supabase SSR maneja la autenticación por cookies en Next.js.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'WhatsApp Cloud API en lugar de Twilio o CallMeBot',
      context:
        'Necesidades de comunicación con los estudiantes: confirmaciones de inscripción, recordatorios de clase, notificaciones de pago y alertas internas. El sistema anterior usaba CallMeBot para las alertas internas.',
      decision:
        'WhatsApp Cloud API (Meta Graph API v21.0) con 6 plantillas aprobadas de antemano. Mensajes idempotentes mediante la tabla whatsapp_messages. Registro de actividad del sistema. Números de teléfono colombianos normalizados (prefijo 57). Degradación controlada cuando la API no está disponible.',
      reasoning:
        'Sin costo por mensaje para las plantillas dentro de la ventana de 24 horas. Mejor entrega que el SMS. Las plantillas aprobadas por Meta aseguran el cumplimiento. Las alertas internas reemplazan a CallMeBot. El registro de actividad deja una trazabilidad de auditoría.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Contrato digital con PDF y firma en canvas',
      context:
        'La ley colombiana exige contratos firmados para los servicios educativos. Los contratos en papel son lentos y difíciles de seguir.',
      decision:
        'Contrato digital generado como PDF con react-pdf y la firma en canvas incrustada (signature_pad). Hash SHA-256 para la integridad. Documentos guardados en Supabase Storage. Términos v2.0 con 12 secciones, entre ellas protección de datos (Ley 1581 de 2012), derechos de imagen y validez de la firma electrónica (Ley 527 de 1999).',
      reasoning:
        'Válido legalmente según la ley colombiana de comercio electrónico (Ley 527). La firma en canvas aporta autenticidad visual. El hash del PDF evita alteraciones. Guardarlo en Supabase mantiene los documentos junto con los datos del estudiante. Los términos están versionados (v2.0) para futuras actualizaciones.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Patrón de cliente de servicio para administración en lugar de solo RLS',
      context:
        'El panel de administración necesita acceso total a la base de datos de todos los estudiantes, sesiones y pagos. Las políticas RLS por sí solas no distinguen limpiamente los roles de administración de los de estudiante.',
      decision:
        'Patrón de doble cliente: cliente de administración con service_role para las operaciones de administración y cliente de usuario autenticado para las del estudiante. Las rutas de administración usan createAdminClient(), que omite RLS. Las rutas del estudiante usan createClient() con RLS aplicado.',
      reasoning:
        'El cliente de administración evita políticas RLS complejas para leer y escribir como administrador. El cliente del estudiante se beneficia de RLS para aislar los datos. Separación clara de responsabilidades. Sin riesgo de escalamiento de privilegios desde cuentas de estudiante.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Next.js independiente en lugar de monorepo',
      context:
        'Command Center usa un monorepo con Turborepo. 4U Studio Academy es un SaaS de un solo cliente sin necesidad de paquetes compartidos.',
      decision:
        'Aplicación independiente en Next.js 16, con npm para los paquetes. Sin Turborepo ni workspaces de pnpm.',
      reasoning:
        'Una sola aplicación no necesita la sobrecarga de un monorepo. CI/CD más rápido (sin orquestación de workspaces). Despliegue más simple en Vercel. Todavía no hace falta extraer componentes compartidos.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Festivos colombianos calculados con un algoritmo en lugar de una lista fija',
      context:
        'La agenda debe bloquear los festivos colombianos. Las listas fijas requieren actualizarse cada año y se prestan a errores.',
      decision:
        'Cálculo algorítmico: Ley Emiliani (festivos trasladables), festivos fijos, Domingo de Pascua (algoritmo gregoriano anónimo) y Semana Santa. Expuesto como funciones: getColombianHolidays(year), getHolidayMap(year), getHolidayMapForYears(...years).',
      reasoning:
        'Cero mantenimiento: funciona para cualquier año. Exacto según la ley colombiana (Ley 51 de 1983). Consulta O(1) mediante un mapa de fechas. Ampliable a eventos académicos además de los festivos.',
      impact: DECISION_IMPACT.Medium,
    },
  ],
  lessonsLearned: [
    {
      title: 'Las políticas RLS de Supabase requieren iterar por caso de uso',
      description:
        'Al principio se escribieron políticas RLS por tabla que servían para el CRUD básico, pero fallaban en las consultas de administración, las suscripciones en tiempo real y las vistas agregadas. Varios commits de migración muestran correcciones de RLS en las tablas class_sessions, enrollments, students y payments. El patrón de doble cliente (service_role para administración + RLS para usuarios autenticados) fue la solución estable final.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'La gestión de plantillas de WhatsApp es un cuello de botella',
      description:
        'La aprobación de plantillas de Meta tarda de 24 a 48 horas. Un rechazo obliga a reenviarlas y esperar otra aprobación. Las 6 plantillas se aprobaron de entrada, pero cualquier plantilla nueva o cambio exige planear alrededor del ciclo de aprobación. Los mensajes idempotentes evitaron envíos duplicados durante las pruebas de desarrollo.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'El sandbox de Bold no es igual a producción',
      description:
        'El sandbox de Bold se comporta distinto que producción: las firmas HMAC, el contenido de los webhooks y las respuestas de error varían. La variable BOLD_SANDBOX y un registro completo fueron esenciales para depurar. El registro de actividad de todas las interacciones con Bold dejó trazabilidad durante el desarrollo.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'La máquina de estados del ciclo de vida del estudiante necesita una gestión centralizada',
      description:
        'A medida que creció la plataforma, las transiciones de estado de los estudiantes se volvieron complejas. Los cambios manuales de estado producían estados inconsistentes. La solución fue una vista de riesgo calculada (v_academic_risk) con actualizaciones automáticas por cron, eventos de actividad para todas las transiciones y alertas de retención para los casos límite.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'La agenda en tiempo real requiere validación en el servidor',
      description:
        'Verificar la disponibilidad solo en el cliente no basta cuando hay reservas simultáneas. Había condiciones de carrera cuando dos estudiantes reservaban el mismo cupo al mismo tiempo. Validar en el servidor cada reserva, junto con Supabase Realtime para actualizar el calendario en vivo, eliminó el problema.',
      category: LESSON_CATEGORY.Architecture,
    },
  ],
  metrics: { commits: null, contributors: null, durationWeeks: null, modules: null, tests: null, coverage: null },
  media: [
    { type: 'image', url: '/projects/academy-desktop.png', alt: '4U Studio Academy · vista de escritorio', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: true },
    { type: 'image', url: '/projects/academy-mobile.png', alt: '4U Studio Academy · vista de móvil', caption: 'Captura del sitio público · 10 de septiembre de 2026', featured: false }
  ],
  links: {
    live: 'https://4ustudioacademy.com/',
  },
  role: {
    title: 'Software Engineer & Product Owner',
    responsibilities: [
      'Desarrollo full-stack: App Router de Next.js 16 con backend en Supabase',
      'Panel de administración con más de 15 rutas (estudiantes, inscripciones, agenda, instructores, pagos, CRM, retención, automatizaciones)',
      'Portal del estudiante con dashboard, calendario de clases y herramientas musicales con IA',
      'Sistema de contrato digital (react-pdf, signature_pad, Supabase Storage, SHA-256)',
      'Integración con WhatsApp Cloud API (6 plantillas aprobadas por Meta, mensajes idempotentes)',
      'Integración de pagos con Bold (links de pago, webhooks, sandbox, HMAC)',
      'Music 4U AI (quiz de perfil, dream builder, simulador de carrera, puntuación en 5 dimensiones)',
      'Motor de retención y reactivación (seguimiento del ciclo de vida, puntuación de riesgo, campañas automáticas)',
      'Sistema de calendario de festivos colombianos (cálculo algorítmico, Ley Emiliani)',
      'Sistema de agendamiento con disponibilidad en tiempo real, horarios de instructores y confirmación de asistencia',
      'CRM del embudo de inscripciones con métricas, atribución de origen y seguimiento de conversión',
      'Motor de automatización (cron jobs, recordatorios automáticos, actualización del riesgo)',
      'Diseño del esquema de Supabase, políticas RLS y gestión de migraciones de Postgres 17',
    ],
  },
  tags: [
    'nextjs',
    'react',
    'typescript',
    'supabase',
    'postgresql',
    'whatsapp-cloud-api',
    'bold-payments',
    'music-education',
    'colombia',
    'saas',
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
