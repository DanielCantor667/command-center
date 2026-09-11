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

export const intranetEss: Project = {
  id: 'intranet-ess',
  slug: 'intranet-ess',
  name: 'Intranet ESS',
  tagline:
    'ERP corporativo modular para empresas colombianas — DDD primero, implementación después.',
  summary:
    'Sistema ERP empresarial con backend NestJS + CQRS + Prisma (PostgreSQL) y frontend Next.js 16 (App Router) + React 19 + Tailwind 4. Monorepo Turborepo con pnpm. Domain-Driven Design: 8 bounded contexts (Auth, Organizations, Users, Roles & Permissions, RRHH, Workforce Time, Documents, Workflows), CQRS con @nestjs/cqrs, Outbox/Inbox pattern, JWT auth con scrypt + TOTP MFA + detección de robo de tokens, RBAC con permisos granulares, multi-tenancy via organization_id, 21 rutas frontend con AppShell + Sidebar + RBAC.',
  description:
    'Intranet ESS es un sistema ERP corporativo diseñado para empresas colombianas, construido con Domain-Driven Design como principio arquitectónico central. Organizado como monorepo Turborepo con apps/api (NestJS 10 + CQRS + Prisma 5 + PostgreSQL 16) y apps/web (Next.js 16 App Router + React 19 + Tailwind 4). Arquitectura hexagonal con capas domain/application/infrastructure/presentation por bounded context. Persistencia compartida: PrismaService (hereda PrismaClient), PrismaRepository abstracto, ITransactionManager, Outbox/Inbox pattern (at-least-once). API versionada (/api/v1/) con Swagger. JWT (cookie + Bearer) con detección de robo via RefreshTokenFamily, scrypt para password hashing, TOTP MFA. Frontend: 21 rutas con AppShell, Sidebar colapsable, Topbar con búsqueda ⌘K, theme toggle (next-themes), TanStack React Query. RBAC con 28 códigos de permiso. Docker Compose local (PostgreSQL 16, Redis 7, MinIO) con healthchecks. CI/CD via GitHub Actions (lint, typecheck, test, build). Sprint 0: infraestructura base + 7 módulos implementados. Documents y Workflows: diseño aprobado, implementación pendiente. Dashboard, Notifications, GlobalSearch: rutas frontend con datos mock.',
  status: PROJECT_STATUS.Development,
  featured: false,
  public: true,
  startedAt: '2026-06-30',
  completedAt: null,
  lastUpdated: '2026-07-09',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Expert },
    { name: 'NestJS', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Prisma', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'PostgreSQL', kind: TECHNOLOGY_KIND.Database, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Redis', kind: TECHNOLOGY_KIND.Infrastructure, level: TECHNOLOGY_LEVEL.Working },
    { name: 'MinIO', kind: TECHNOLOGY_KIND.Infrastructure, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Docker', kind: TECHNOLOGY_KIND.Infrastructure, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Zod', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'JWT', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Passport', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'class-validator', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'pino', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Helmet', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Turborepo', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'pnpm', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Tailwind CSS', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'TanStack React Query', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Swagger', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Jest', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'OpenTelemetry', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
  ],
  architecture: [
    ARCHITECTURE_PATTERN.Monorepo,
    ARCHITECTURE_PATTERN.DomainDrivenDesign,
    ARCHITECTURE_PATTERN.Cqrs,
    ARCHITECTURE_PATTERN.CleanArchitecture,
    ARCHITECTURE_PATTERN.EventDriven,
    ARCHITECTURE_PATTERN.LayeredArchitecture,
    ARCHITECTURE_PATTERN.Rest,
  ],
  features: [
    {
      title: 'Identity & Access Management',
      description:
        'Registro de cuentas con email + scrypt password hash (12 rounds). Autenticación multifactor vía TOTP (RFC 6238) con backup codes. Manejo de sesiones con refresh token rotation y detección de robo via RefreshTokenFamily. Evaluación de riesgo de contexto de sesión (ubicación, fingerprint, dispositivo). Ciclo de vida de cuenta: PENDING_VERIFICATION, ACTIVE, LOCKED, SUSPENDED, DELETED (soft delete). Identidad federada preparada (OAuth2, SAML, SSO). Rate limiting por IP. 8 comandos CQRS, 13 queries, 30 domain events.',
    },
    {
      title: 'Multi-Tenant Organization Management',
      description:
        'Ciclo de vida de tenants (provisioning, activation, suspension, cancellation, deletion). 4 planes de suscripción: FREE (5 users, 10 employees, 1GB), STARTER, BUSINESS, ENTERPRISE. Feature flags por organización. Settings organizacionales configurables: políticas de password (min length, uppercase, history, expiration), sesión (TTL, max active, inactivity), MFA, lockout (threshold, window, duration). Verificación de dominio corporativo via DNS TXT. Branding corporativo (logo, colores). Aislamiento multi-tenant via organization_id shared schema.',
    },
    {
      title: 'People Directory',
      description:
        'Registro de personas con nombres completos (primer, segundo, apellido, segundo apellido), preferredName. Documentos de identidad colombianos: CC, CE, NIT, PASSPORT, TI. Información de contacto (email personal, teléfono, móvil, dirección). Avatar, preferencias (JSON), contactos de emergencia. Tags y clasificaciones. Vinculación opcional con Account de Auth. Lifecycle: ACTIVE, INACTIVE, DELETED.',
    },
    {
      title: 'Roles & Permissions (RBAC)',
      description:
        'Definición de roles con conjuntos de permisos. Roles del sistema (SUPERADMIN, ADMIN) y roles personalizados por organización. Catálogo de permisos registrados por módulo (29 códigos: attendance.*, hr.*, roles.*, users.*, etc.). Asignación de roles a usuarios con expiración. Guards de autorización en frontend (PermissionsGuard) y backend. Servicio IAuthorizationService consumido por todos los bounded contexts.',
    },
    {
      title: 'Human Resources (RRHH)',
      description:
        'Ciclo de vida del empleado: hire, promote, transfer, terminate, start/return from leave. Employment relationships con tipos de contrato colombianos: INDEFINITE, FIXED_TERM, WORK_OR_LABOR, APPRENTICESHIP, TEMPORARY, CIVIL. Salario (periodo mensual, quincenal, por hora), moneda COP. Seguridad social colombiana: EPS, AFP, ARL con nivel de riesgo (I-V). Departamentos jerárquicos (hasta 10 niveles) con hierarchyPath. Historial laboral append-only via EmploymentEvent. Centros de costo. 13 tipos de evento laboral.',
    },
    {
      title: 'Time & Attendance',
      description:
        'Marcación de entrada/salida/descanso via 6 métodos: WEB, MOBILE, BIOMETRIC, QR, NFC, INTEGRATION. ClockEvent inmutable — no modificación ni eliminación. Correcciones via ClockCorrectionRequest que genera nuevo ClockEvent. Política de asistencia por organización: métodos habilitados, ventana de duplicados (60s), política de eventos faltantes. Time-off requests (VACATION, PERMIT, LEAVE, INCAPACITY, COMPENSATORY, UNPAID) con flujo de aprobación. Time-off balances con accrual (monthly/yearly). Turnos (Shift), WorkSchedules, WorkCalendars con resolución jerárquica (EMPLOYEE > BRANCH > DEPARTMENT > ORGANIZATION) y carga masiva de festivos.',
    },
    {
      title: 'Document Management',
      description:
        'Diseño de dominio aprobado (v1.0), con implementación planificada. Define 5 aggregate roots: Document, DocumentType, DocumentRetentionPolicy, DocumentTemplate y DocumentRequest; ciclo de vida draft → published → archived → deleted, políticas de retención, control de acceso, versionado y firma electrónica mediante integración externa.',
    },
    {
      title: 'Workflow Engine',
      description:
        'Diseño de dominio aprobado (v1.0), con implementación planificada. Define WorkflowDefinition y WorkflowInstance para plantillas de flujo, asignación a usuarios o roles, aprobaciones secuenciales/paralelas, condiciones, escalamiento, SLAs e historial de ejecución.',
    },
    {
      title: 'Dashboard & KPIs',
      description:
        'Dashboard principal con métricas: total empleados, departamentos, aprobaciones pendientes, resumen de asistencia, eventos próximos, distribución de empleados por departamento. Datos mock para desarrollo sin dependencia de backend.',
    },
    {
      title: 'Global Search',
      description:
        'Experiencia de búsqueda global planificada. La base técnica ya incluye hooks para consultar empleados y usuarios mediante query string, preparada para consolidarse en una interfaz única.',
    },
    {
      title: 'Notifications',
      description:
        'Infraestructura de notificaciones in-app. Mock data para desarrollo. Integración con Topbar (badge de notificaciones no leídas). Preparado para notificaciones push y email.',
    },
    {
      title: 'Administration & System Settings',
      description:
        'Panel de administración del sistema: directorio de usuarios del sistema (invitar con contraseña temporal, activar/desactivar), configuración de identidad y acceso (RBAC), settings globales de la organización. Tema claro/oscuro persistente via next-themes.',
    },
  ],
  challenges: [
    {
      title: 'Infraestructura de persistencia antes del Sprint 1',
      description:
        'Todos los bounded contexts debían compartir la misma base de persistencia, pero no había modelos de negocio en Sprint 0. Había que diseñar PrismaService, PrismaRepository, TransactionManager y Outbox/Inbox sin conocer los agregados futuros. Phase 0.2 usó composición (porque no había modelos para prisma generate); Phase 0.3 migró a herencia al agregar OutboxEvent/InboxEvent.',
      resolution:
        'Diseño en 3 phases: 0.1 (Turborepo + Docker + CI), 0.2 (NestJS scaffold + Prisma vacío + composición), 0.3 (Outbox/Inbox models → prisma generate → migración a herencia). PrismaRepository abstracto con método db() que centraliza la selección entre conexión principal y transaction client. Los bounded contexts extienden sin redefinir infraestructura.',
    },
    {
      title: 'Multi-tenant isolation con shared schema',
      description:
        'Usar shared schema + organization_id requiere que TODAS las queries incluyan el filtro de organización. Un error en cualquier query puede filtrar datos entre tenants. No hay isolation física (como schemas separados por tenant) que actúe como red de seguridad.',
      resolution:
        'organization_id como campo obligatorio en todas las tablas de negocio con índices compuestos. TenantIsolationService como servicio de infraestructura que deriva el tenant del token JWT. Validación en capa de aplicación: toda operación verifica que el recurso pertenece al tenant del usuario autenticado. Cross-tenant operations solo permitidas para SUPERADMIN.',
    },
    {
      title: 'Outbox/Inbox patterns sin worker',
      description:
        'Los patrones Outbox/Inbox requieren un worker que procese los eventos PENDING y los entregue a los consumidores. En Sprint 0, el publisher y el schema están listos, pero no hay worker. Los eventos se acumulan en estado PENDING hasta Sprint 1+.',
      resolution:
        'OutboxEvent publicado en la misma transacción que el aggregate (garantía at-least-once). PrismaOutboxPublisher acepta tx?: unknown para insertarse en la transacción del caso de uso. Worker diferido a Sprint 1+ (BullMQ o cron). InboxEvent con PK compuesta (eventId, consumer) para idempotencia cuando el worker se implemente. Aceptable para Sprint 0: infraestructura lista, worker se añade sin cambios al schema ni al publisher.',
    },
    {
      title: 'Lectura cross-context sin acoplamiento entre bounded contexts',
      description:
        'Workforce Time necesita leer datos de empleados (Employee) de RRHH, pero no debe depender directamente del módulo RRHH ni de su implementación. La misma necesidad existe entre Users, Organizations y Auth.',
      resolution:
        'Patrón Port/Adapter: cada bounded context expone interfaces (ports) como IEmployeeDirectory, IUserDirectory, ITenantContext. Los adapters leen tablas de otros módulos directamente via PrismaService (sin inyección de servicios cross-module). Esto evita dependencias circulares y mantiene los bounded contexts desacoplados. Los adapters se registran como providers en el módulo consumidor.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Prisma como ORM con type-safety end-to-end',
      context:
        'Necesitábamos un ORM con type-safety desde el schema hasta las queries, capacidad de transaction client para repositories, y generación automática de cliente. Alternativas: TypeORM, Drizzle, Kysely.',
      decision:
        'Prisma 5 con PostgreSQL 16. Prisma.TransactionClient para aislamiento de repositorios. prisma generate genera el cliente del schema — sin mapeo manual.',
      reasoning:
        'Type-safety end-to-end desde el schema, Prisma.TransactionClient permite aislar repositorios de la conexión concreta, generación automática reduce boilerplate.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Domain-Driven Design + CQRS + Hexagonal Architecture',
      context:
        'El sistema ERP tiene múltiples submódulos (RRHH, asistencia, documentos) con lógica compleja y reglas de negocio cambiantes. Sin una separación clara, el código se vuelve inmantenible.',
      decision:
        'DDD con bounded contexts, CQRS via @nestjs/cqrs, y arquitectura hexagonal (domain/application/infrastructure/presentation por módulo). Los domain models nunca exponen entidades Prisma.',
      reasoning:
        'Separación clara de responsabilidades, los casos de uso se modelan como comandos/queries explícitos, los domain services contienen lógica de negocio pura sin dependencias de infraestructura, facilita testing y evolución independiente de módulos.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'URI versioning desde Sprint 0',
      context:
        'La API debía permitir evolución sin breaking changes. Alternativas: header versioning, media type versioning, sin versionar.',
      decision:
        'VersioningType.URI con defaultVersion: "1" y setGlobalPrefix("api"). Resultado: /api/v1/{resource}.',
      reasoning:
        'URI versioning es explícito y fácil de consumir desde clientes. defaultVersion: "1" evita decoradores en cada controller nuevo. Introducirlo desde Sprint 0 evita breaking changes retroactivos.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Infrastructure DI tokens en lugar de clases concretas',
      context:
        'Los servicios de aplicación necesitan SystemClock, UuidGenerator, TransactionManager. Inyectar clases concretas acopla la aplicación a implementaciones específicas y dificulta el mocking.',
      decision:
        'Registro de providers via tokens simbólicos: CLOCK_TOKEN → SystemClock, ID_GENERATOR_TOKEN → UuidGenerator, TRANSACTION_MANAGER_TOKEN → PrismaTransactionManager, DOMAIN_EVENT_PUBLISHER_TOKEN → PrismaOutboxPublisher.',
      reasoning:
        'Application layer inyecta la interfaz por token, nunca la clase concreta. Facilita mocking en tests sin providers reales. Swap de implementaciones (ej: SystemClock → FixedClock en tests) sin cambiar código de aplicación.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Zod para env vars, class-validator para DTOs',
      context:
        'Coexistían dos bibliotecas de validación. class-validator con decoradores para DTOs (NestJS natural), pero para env vars los decoradores son verbose y no infieren tipos.',
      decision:
        'Zod para validación de variables de entorno (envSchema con z.infer). class-validator + class-transformer para DTOs de endpoints.',
      reasoning:
        'Zod infiere tipos TypeScript directamente del schema sin decoradores, más legible para config. safeParse() da errores estructurados. class-validator se mantiene para DTOs donde los decoradores son el estándar NestJS.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'scrypt para hashing de contraseñas',
      context:
        'Se necesitaba un algoritmo de hashing de contraseñas resistente a fuerza bruta con GPU/ASIC. Alternativas: bcrypt, argon2, pbkdf2.',
      decision:
        'scrypt con parámetros configurables (N, r, p, keylen). Hash + salt almacenados en PrimaryCredential. Password history (últimos N) para evitar reuso.',
      reasoning:
        'scrypt es memory-hard (resistente a ASIC/GPU), nativo en Node.js crypto sin dependencias externas, parámetros configurables para ajustar costo computacional.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Patrón Outbox para eventos de dominio',
      context:
        'Los agregados necesitan publicar eventos al persistirse, pero publicar directamente a un message broker fuera de la transacción de BD crea riesgo de inconsistencia (evento publicado pero aggregate no persistido, o viceversa).',
      decision:
        'OutboxEvent persistido en la misma transacción que el aggregate. PrismaOutboxPublisher implementa IDomainEventPublisher. Eventos en estado PENDING hasta que un worker los procese.',
      reasoning:
        'Garantiza at-least-once delivery: el evento se persiste en la misma transacción que el aggregate. Sin riesgo de eventos huérfanos. Worker diferido (Sprint 1+) no requiere cambios en el publisher ni en el schema.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Cross-module reads via Port/Adapter, no service injection',
      context:
        'Workforce Time necesita employeeId de RRHH, Users necesita accountId de Auth. Inyectar servicios de otros módulos crea acoplamiento directo y dependencias circulares potenciales.',
      decision:
        'Cada bounded context expone interfaces (ports: IEmployeeDirectory, IUserDirectory, ITenantContext, IIdentityProvider). Los adapters leen tablas de otros módulos directamente via PrismaService.',
      reasoning:
        'Sin inyección de servicios cross-module, sin dependencias circulares, los ports definen contratos explícitos, los adapters son implementaciones livianas que solo leen tablas.',
      impact: DECISION_IMPACT.Medium,
    },
  ],
  lessonsLearned: [
    {
      title: 'Persistencia compartida antes que módulos de negocio',
      description:
        'Construir PrismaService, PrismaRepository, TransactionManager y Outbox/Inbox antes de cualquier código de dominio evitó que cada bounded context reinventara patrones de persistencia. La migración de composición a herencia entre Phase 0.2 y 0.3 fue posible porque no había modelos de negocio acoplados.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'URI versioning desde el día uno',
      description:
        'Configurar VersioningType.URI en Sprint 0, antes de exponer la API, evitó el problema de introducir versioning retroactivamente. Todos los endpoints nacieron con /api/v1/ sin necesidad de refactors.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'DI tokens aíslan dominio de infraestructura',
      description:
        'Los tokens CLOCK_TOKEN, ID_GENERATOR_TOKEN, TRANSACTION_MANAGER_TOKEN permiten que la capa de aplicación dependa de interfaces, no de implementaciones concretas. En tests, reemplazar SystemClock por FixedClock requiere cero cambios en código de aplicación.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Cross-context reads via ports evitan acoplamiento',
      description:
        'Workforce Time necesita Employee de RRHH pero no debe depender del módulo RRHH. El port IEmployeeDirectory resuelve esto: el adaptor lee la tabla employees via PrismaService directamente, sin servicios intermedios. Esto evita dependencias circulares y mantiene bounded contexts independientes.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Outbox/Inbox desde Sprint 0 habilita event-driven sin retrofitting',
      description:
        'Implementar OutboxEvent e InboxEvent en la infraestructura base, aunque el worker se implemente después, significa que los bounded contexts pueden empezar a publicar eventos desde el día uno sin necesidad de refactor cuando llegue el worker.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'commitlint con conventional commits desde el inicio',
      description:
        'Husky + commitlint con conventional commits (feat/fix/chore/docs/test/ci) desde el primer commit mantiene el historial de git estructurado y navegable. Los 51 commits del proyecto siguen el formato consistente, facilitando generación de changelog y búsqueda de cambios por tipo.',
      category: LESSON_CATEGORY.Process,
    },
  ],
  metrics: { commits: null, contributors: null, durationWeeks: null, modules: null, tests: null, coverage: null },
  media: [],
  links: {
    repository: 'https://github.com/DanielCantor667/intranet',
  },
  role: {
    title: 'Software Engineer & Full-Stack Architect',
    responsibilities: [
      'DDD + CQRS + Hexagonal architecture design across 8 bounded contexts',
      'NestJS backend: persistence layer (Prisma, transactions, outbox/inbox), auth (JWT, TOTP, sessions), RBAC',
      'Next.js frontend: 21 routes, AppShell, Sidebar, RBAC guards, theme system',
      'Multi-tenant architecture with shared schema + organization_id isolation',
      'Database schema design: 27 Prisma models across 7 módulos (Auth, Organizations, Users, Roles, RRHH, Workforce Time, y Outbox/Inbox infra)',
      'Docker infrastructure: PostgreSQL, Redis, MinIO with healthchecks',
      'CI/CD pipeline: GitHub Actions with lint, typecheck, test, build',
      'Monorepo governance: Turborepo, pnpm workspaces, Husky, commitlint',
      'Domain documentation: 8 domain design docs (auth, organizations, users, roles, rrhh, workforce-time, documents, workflows)',
      'Test strategy: 56 unit tests + 2 e2e specs across all implemented modules',
    ],
  },
  tags: [
    'erp',
    'nestjs',
    'nextjs',
    'react',
    'typescript',
    'ddd',
    'cqrs',
    'prisma',
    'postgresql',
    'docker',
    'rrhh',
    'time-attendance',
    'rbac',
    'jwt',
    'turborepo',
    'pnpm',
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
