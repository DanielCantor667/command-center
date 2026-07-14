# Spec: Projects Domain

> Nota: el RFC-0007 (Projects Domain) no existe en este repositorio. Esta spec documenta el contrato del dominio implementado en Sprint 0.7 y actúa como su fuente de verdad escrita.

## Objetivo

Definir el dominio `Project` como modelo de ingeniería: un Project es un producto de software, no una tarjeta de portafolio. El dominio describe arquitectura, decisiones técnicas, retos, aprendizajes y métricas. La interfaz solo representa este dominio.

Este dominio no incluye UI, módulo Projects, navegación, APIs ni base de datos.

## Requisitos funcionales

- Modelo `Project` completamente tipado, con secciones: Identity, Description, Status, Visibility, Dates, Technologies, Architecture, Features, Challenges, Engineering Decisions, Lessons Learned, Metrics, Media, Links, Role, Tags, Relationships, Metadata, Ownership.
- **Engineering Decisions** y **Lessons Learned** son campos obligatorios del contrato.
- Repository estático `PROJECTS: readonly Project[]` — sin funciones, filtros ni utilidades.
- Schema de validación runtime que garantiza el contrato.
- Relaciones por ID (`relatedProjects`, `relatedArticles`, `relatedSkills`), nunca objetos anidados.

## Requisitos no funcionales

- Independiente de UI (sin React, Zustand ni lógica de presentación).
- El schema Zod es la única fuente de verdad; los tipos se derivan con `z.infer`.
- Datos inmutables (`readonly` en el tipo y en los schemas).
- Nunca fabricar datos: campos sin información real quedan `null`, vacíos o con `TODO`.

## Diseño técnico

Ubicación: `apps/web/data/projects/`

| Archivo | Responsabilidad |
| --- | --- |
| `project.enums.ts` | Const objects + union types |
| `project.schema.ts` | Zod schemas (fuente de verdad) |
| `project.types.ts` | Tipos derivados con `z.infer` |
| `projects.ts` | Repository (`PROJECTS`) |
| `index.ts` | Barrel |
| `tests/projects.test.ts` | Contrato, schema y repository |

### Enums

- `ProjectStatus`: `planning · development · production · maintenance · archived`
- `TechnologyKind`: `language · framework · library · database · infrastructure · tooling · platform`
- `TechnologyLevel`: `learning · working · proficient · expert`
- `ArchitecturePattern`: conjunto tipado (`monorepo`, `clean-architecture`, `ddd`, `rest`, `cqrs`, `graphql`, `module-system`, `design-system`, `layered-architecture`, `event-driven`, `serverless`)
- `DecisionImpact`: `low · medium · high`
- `LessonCategory`: `architecture · tooling · process · product`
- `MediaType`: `image · video · diagram`
- `OwnershipType`: `personal · client · company · academic`

### Invariantes validadas por el schema

- `slug` en kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
- Fechas en formato ISO `YYYY-MM-DD`; `completedAt` nullable.
- URLs válidas en `links` y `media`.
- `metrics.coverage` entre 0 y 100; contadores enteros no negativos; todos nullable.
- `metadata.version` es el literal `1` (versionado del contrato).
- Strings no vacíos en todos los campos de texto.

### Dependencia

- `zod` (v4) agregada a `apps/web`. Justificación: validación runtime del contrato con derivación de tipos (una sola definición), estándar del ecosistema, sin dependencias transitivas. Documentada también en el README del dominio.

## Riesgos

- `relatedArticles` y `relatedSkills` referencian dominios que aún no existen; su integridad referencial no puede validarse todavía.
- Los esqueletos (`todo-project-1`, `todo-project-2`) deben reemplazarse con proyectos reales; permanecen `public: false` hasta entonces.
- Si el contrato cambia, incrementar `metadata.version` y documentar la migración en una nueva spec o ADR — nunca editar esta retroactivamente sin registro.
