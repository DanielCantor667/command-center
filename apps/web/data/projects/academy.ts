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
    '4U Studio Academy is a full-stack platform for a presencial music academy based in Bogotá, Colombia (Calle 93 #46-44). Built with Next.js 16 App Router, React 19, TypeScript 6, and Supabase (Postgres 17, Auth, Storage, Realtime). The platform serves three user roles: public visitors, students, and administrators. Public-facing pages include a homepage, plans for adults and kids/teens, courses/lessons (6 instruments: guitar, piano, voice, drums, bass, production), about page (nosotros), contact, booking (agendar), enrollment (inscripcion) with digital contract signed via canvas (signature_pad) and generated as PDF (react-pdf, SHA-256 hash, stored in Supabase Storage), AI music tools (profile quiz, dream builder, career simulator with 5-dimension scoring), terms v2.0, corporate info, and token-based attendance confirmation flow. The student portal (/mi-cuenta) includes dashboard, class calendar, monthly schedule, Music 4U AI journey history, login, registration, and password recovery. The admin panel has 15+ routes: executive dashboard with live stats, student management (full lifecycle: lead, matriculado, activo, riesgo, inactivo, exalumno), enrollment pipeline (CRM Comercial V1 with funnel metrics, conversion tracking, source attribution), agenda/scheduling with real-time availability (10am-10pm Mon-Fri, Colombian holiday blocking), instructor management (profiles, schedules, availability), payments (Bold payment link generation, webhook verification, overdue tracking), sales dashboard, lead management, retention dashboard (risk scoring, alerts, activity timeline), reactivation center (tasks, campaigns), academic indicators, system activity log, and automation engine (cron jobs for attendance reminders, risk updates, automated follow-ups). WhatsApp Cloud API (Meta Graph v21.0) handles enrollment confirmations, payment notifications, class reminders, rescheduling alerts, and internal team alerts with idempotent messaging and activity logging. Bold payment gateway integration supports sandbox testing, HMAC signature verification, payment link generation, and webhook processing. Retention system uses student lifecycle status tracking, risk scoring, activity event logging (30+ event types), and automated reactivation campaigns. Calendar system computes Colombian holidays algorithmically (Ley Emiliani, Easter calculation) for schedule blocking. Infrastructure: standalone Next.js, Supabase, Vercel deployment, no monorepo.',
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
      title: 'Admin Panel — 15+ Routes',
      description:
        'Full admin panel with executive dashboard, student management (full lifecycle CRM), enrollment pipeline with funnel metrics, agenda/scheduling with real-time availability and Colombian holiday blocking, instructor profiles and availability, payment management with Bold link generation, sales dashboard, lead management, retention dashboard with risk scoring, reactivation task center, academic indicators, system activity log with 30+ event types, and automation engine. Dark theme with light/dark mode toggle. Responsive drawer navigation on mobile.',
    },
    {
      title: 'Enrollment System with Digital Contract',
      description:
        'Multi-step enrollment form (inscripcion) supporting self, child, and other registration types. Collects student info, course interest, level, preferred schedule, legal consents (terms v2.0, data processing, image rights). Generates digital contract as PDF via react-pdf with embedded canvas signature (signature_pad). SHA-256 hash of PDF stored for integrity verification. Documents uploaded to Supabase Storage. Enrollment status pipeline: pending, contacted, clase_prueba, perdido, converted. Automatic WhatsApp notification on enrollment received.',
    },
    {
      title: 'Booking & Agenda System',
      description:
        'Multi-step booking flow (agendar) with course selection, instructor showcase with bios, real-time calendar showing available slots (10am-10pm Mon-Fri). Colombian holiday blocking via algorithmic computation (Ley Emiliani, Easter calculation). Instructor availability management. Student class booking, rescheduling, and cancellation with 24h policy. Attendance confirmation via token-based links. Late cancellation and no-show tracking. Recurring weekly schedule support.',
    },
    {
      title: 'Student Portal (Mi Cuenta)',
      description:
        'Full student portal with role-aware dashboard showing next class, plan progress, monthly usage stats, and recent activity. Class calendar with real-time schedule. Monthly class report with PDF download. Music 4U AI journey history. Login, registration, and password recovery flows. Supabase SSR auth with cookie-based sessions.',
    },
    {
      title: 'WhatsApp Cloud API Integration',
      description:
        'Full WhatsApp Cloud API (Meta Graph v21.0) integration. 6 Meta-approved templates: enrollment_received, payment_confirmed, account_activated, class_reminder, class_rescheduled, internal_alert. Idempotent messaging via whatsapp_messages table. System activity logging for all messages. Graceful degradation when API unavailable. Colombian phone normalization.',
    },
    {
      title: 'Bold Payments Gateway',
      description:
        'Colombian payment gateway integration (Bold). Payment link generation with CLOSE amount type, COP currency. Sandbox mode with HMAC signature verification. Webhook processing with idempotency. Payment lifecycle tracking: pending, confirmed, overdue. Manual payment registration and overdue tracking.',
    },
    {
      title: 'Music 4U AI',
      description:
        'Three interactive AI tools: Profile Quiz (5-dimension music scoring: creatividad, disciplina, interpretacion, produccion, performance), Dream Builder (personalized roadmap with phased milestones), and Career Simulator (branching scenarios with score deltas). 6 music archetypes (Creador Expresivo, Intérprete Nato, Arquitecto Sonoro, Técnico Disciplinado, Artista Integral, Explorador Musical). 4 career types. Course and plan recommendations from scores. Journey persistence with anonymous key tracking.',
    },
    {
      title: 'Retention & Reactivation Engine',
      description:
        'Student lifecycle management (lead, matriculado, activo, riesgo, inactivo, exalumno). Retention alerts with severity levels (info, warning, critical). Reactivation task system with automated campaign messaging. Risk scoring based on attendance patterns, payment history, and activity. Activity event logging with 30+ event types. Automated cron jobs for risk updates and follow-ups.',
    },
    {
      title: 'Automation Engine',
      description:
        'Cron-based automation system: attendance reminders (daily), automation runner (daily — processes scheduled jobs), risk update (daily — recalculates student risk scores). Job queue via automation_jobs table. Activity logging for all automated actions.',
    },
    {
      title: 'Plan & Course System',
      description:
        '6 courses: guitarra, piano, canto, batería, bajo, producción musical. Adult plans: New Talent, Fast Talent, Artista, Artista Premium, Profesional, Corporativo. Kids & Teens plans with age-adjusted methodology. Each plan includes 8 monthly classes, studio recording sessions, mix/mastering deliverables, and live presentations. Dynamic pricing and feature comparison.',
    },
    {
      title: 'Digital Presence',
      description:
        'Public-facing pages: homepage with testimonial video strip, hero with audio autoplay, and course cards. About page (nosotros) with team section (4 instructors with filterable cards and modals), mission/history/philosophy cards, and video carousel. Lessons page with premium course modals. Contact page with WhatsApp integration and map. SEO metadata per page. Lenis smooth scroll. Framer Motion animations.',
    },
    {
      title: 'Colombian Calendar System',
      description:
        'Algorithmic Colombian holiday computation (Ley Emiliani, Easter Sunday, fixed holidays). Production calendar with academic events, concerts, recitals, presentations, and closures. Holiday map for O(1) date lookups across multiple years. Schedule blocking for holidays and weekends.',
    },
  ],
  challenges: [
    {
      title: 'Complex RLS policies for multi-role access',
      description:
        'Three user roles (public, student, admin) with overlapping data access needs. Class sessions needed public availability queries, student dashboard reads, and admin full access. Initial RLS policies were too permissive or too restrictive.',
      resolution:
        'Service role (admin client) for all admin operations. Authenticated student role with restricted per-student queries. Public role with read-only access to availability data. Migration commits show dedicated RLS fixes across 5+ iterations (class_sessions, enrollments, students).',
    },
    {
      title: 'Real-time agenda conflicts with concurrent booking',
      description:
        'Multiple students booking the same time slot led to race conditions. Class session availability changed between calendar render and booking submission.',
      resolution:
        'Server-side slot validation on booking action. Race condition detection (isRaceCondition flag) with user-facing retry message. Realtime subscriptions (Supabase Realtime) for live calendar updates. Commit history shows dedicated "realtime resilience" fixes.',
    },
    {
      title: 'WhatsApp template approval dependencies',
      description:
        'Meta requires template approval before sending. Template changes or new templates create deployment delays. Template rejection blocks critical notifications.',
      resolution:
        '6 templates pre-approved with generic parameterized bodies. Local fallback (console.error + DB logging) when API unavailable. Idempotent messaging prevents duplicate sends. Internal alert template for team notifications.',
    },
    {
      title: 'Bold sandbox vs production parity',
      description:
        'Bold sandbox and production environments have different API behaviors. Sandbox HMAC validation differs from production. Webhook payloads vary between environments.',
      resolution:
        'BOLD_SANDBOX env var controls key selection and HMAC validation skipping. Comprehensive webhook logging in development. Activity log for all Bold API interactions. Separate test/production key management.',
    },
    {
      title: 'Student lifecycle complexity',
      description:
        'Students transition through multiple states (lead → matriculado → activo → riesgo → inactivo → exalumno) with different data visibility, payment status, and communication needs at each stage. Retention logic must consider attendance, payments, activity, and time-based factors.',
      resolution:
        'Centralized lifecycle status with computed views (v_academic_risk, v_high_risk_students). Activity event system (30+ types) for immutable audit trail. Retention dashboard with aggregated metrics. Automated risk updates via cron.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Supabase as sole backend over custom API',
      context:
        'The platform needs auth, database, realtime, and storage. Building a custom API adds development time and maintenance burden.',
      decision:
        'Supabase as the single backend platform. Auth (Supabase SSR), DB (Postgres 17), Storage (documents bucket), and Realtime (class_sessions, payments). Admin client (service_role) for all admin operations. Authenticated client for student operations. Public client for anonymous availability queries.',
      reasoning:
        'Reduces API surface to zero — no custom endpoints needed for CRUD. Realtime comes free for agenda updates. Storage handles contract PDFs. RLS provides row-level security. Supabase SSR handles cookie-based auth for Next.js.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'WhatsApp Cloud API over Twilio/CallMeBot',
      context:
        'Student communication needs: enrollment confirmations, class reminders, payment notifications, and internal alerts. Previous system used CallMeBot for internal alerts.',
      decision:
        'WhatsApp Cloud API (Meta Graph API v21.0) with 6 pre-approved templates. Idempotent messaging via whatsapp_messages table. System activity logging. Normalized Colombian phone numbers (57 prefix). Graceful degradation when API unavailable.',
      reasoning:
        'No per-message cost for template messages within 24h window. Higher deliverability than SMS. Meta-approved templates ensure compliance. Internal alerts replace CallMeBot. Activity logging provides audit trail.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Digital contract with PDF + canvas signature',
      context:
        'Colombian law requires signed contracts for educational services. Paper contracts are slow and hard to track.',
      decision:
        'Digital contract generated as PDF via react-pdf with embedded canvas signature (signature_pad). SHA-256 hash for integrity. Documents stored in Supabase Storage. Terms v2.0 with 12 sections including data protection (Ley 1581 de 2012), image rights, and electronic signature validity (Ley 527 de 1999).',
      reasoning:
        'Legally valid under Colombian e-commerce law (Ley 527). Canvas signature provides visual authenticity. PDF hash prevents tampering. Storage in Supabase keeps documents with student data. Terms versioned (v2.0) for future updates.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Admin service client pattern over RLS-only',
      context:
        'Admin panel needs full database access across all students, sessions, and payments. RLS policies alone cannot distinguish admin roles from student roles cleanly.',
      decision:
        'Dual client pattern: service_role admin client for admin operations, authenticated user client for student operations. Admin routes use createAdminClient() which bypasses RLS. Student routes use createClient() with RLS enforcement.',
      reasoning:
        'Admin client avoids complex RLS policies for admin read/write. Student client benefits from RLS for data isolation. Clear separation of concerns. No risk of privilege escalation from student accounts.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Standalone Next.js over monorepo',
      context:
        'Command Center uses Turborepo monorepo. 4U Studio Academy is a single-tenant SaaS with no shared packages needed.',
      decision:
        'Standalone Next.js 16 application. npm for package management. No Turborepo, no pnpm workspaces.',
      reasoning:
        'Single app needs no monorepo overhead. Faster CI/CD (no workspace orchestration). Simpler deployment to Vercel. No shared component extraction needed yet.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Colombian holidays computed algorithmically over hardcoded list',
      context:
        'Agenda system must block Colombian holidays. Hardcoded lists require annual updates and risk errors.',
      decision:
        'Algorithmic computation: Ley Emiliani (festivos trasladables), fixed holidays, Easter Sunday (Anonymous Gregorian algorithm), and Semana Santa. Exposed as functions: getColombianHolidays(year), getHolidayMap(year), getHolidayMapForYears(...years).',
      reasoning:
        'Zero maintenance — works for any year. Accurate per Colombian law (Ley 51 de 1983). O(1) lookup via date map. Extensible for academic events beyond holidays.',
      impact: DECISION_IMPACT.Medium,
    },
  ],
  lessonsLearned: [
    {
      title: 'Supabase RLS requires iteration across use cases',
      description:
        'Initially wrote per-table RLS policies that worked for basic CRUD but failed for admin queries, realtime subscriptions, and aggregated views. Multiple migration commits show RLS fixes across class_sessions, enrollments, students, and payments tables. The dual client pattern (admin service_role + authenticated RLS) was the eventual stable solution.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'WhatsApp template management is a bottleneck',
      description:
        'Meta template approval takes 24-48h. Template rejection requires resubmission and re-approval. All 6 templates were approved upfront, but any new template or modification requires planning around the approval cycle. The idempotent messaging system prevented duplicate sends during development testing.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'Bold sandbox != production',
      description:
        'Bold sandbox behaves differently from production: HMAC signatures, webhook payloads, and error responses all vary. The BOLD_SANDBOX env var toggle and comprehensive logging were essential for debugging. Activity log for all Bold interactions provided audit trail during development.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'Student lifecycle state machine needs centralized management',
      description:
        'As the platform grew, student status transitions became complex. Manual status changes led to inconsistent states. The solution was a computed risk view (v_academic_risk) with automated cron updates, activity events for all transitions, and retention alerts for edge cases.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Real-time agenda requires server-side validation',
      description:
        'Client-side availability checking is not sufficient for concurrent booking. Race conditions occurred when two students booked the same slot simultaneously. Server-side validation on every booking action, combined with Supabase Realtime for live calendar updates, eliminated the issue.',
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
      'Full-stack development: Next.js 16 App Router with Supabase backend',
      'Admin panel with 15+ routes (students, enrollments, agenda, instructors, payments, CRM, retention, automations)',
      'Student portal with dashboard, class calendar, and AI music tools',
      'Digital contract system (react-pdf, signature_pad, Supabase Storage, SHA-256)',
      'WhatsApp Cloud API integration (6 Meta-approved templates, idempotent messaging)',
      'Bold payments integration (payment links, webhooks, sandbox, HMAC)',
      'Music 4U AI (profile quiz, dream builder, career simulator, 5-dimension scoring)',
      'Retention and reactivation engine (lifecycle tracking, risk scoring, automated campaigns)',
      'Colombian holiday calendar system (algorithmic computation, Ley Emiliani)',
      'Booking/agenda system with real-time availability, instructor scheduling, attendance confirmation',
      'Enrollment pipeline CRM with funnel metrics, source attribution, conversion tracking',
      'Automation engine (cron jobs, automated reminders, risk updates)',
      'Supabase schema design, RLS policies, and Postgres 17 migration management',
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
