# Projects Domain

## Filosofía

Un `Project` no es una tarjeta de portafolio. Es un producto de software.

El dominio describe ingeniería: arquitectura, decisiones técnicas, retos, aprendizajes y métricas. La interfaz (futura) solo representa este dominio; nunca lo define. Por eso este directorio no contiene React, Zustand ni lógica de UI.

Dos conceptos son obligatorios en el contrato:

- **Engineering Decisions** — cada proyecto explica sus decisiones técnicas importantes (qué se decidió, en qué contexto, por qué, y su impacto).
- **Lessons Learned** — cada proyecto registra aprendizajes obtenidos durante el desarrollo, categorizados.

## Estructura

```
data/projects/
├── index.ts              # Barrel: enums, schema, tipos y PROJECTS
├── project.enums.ts      # Const objects + union types (status, kind, level, patterns…)
├── project.schema.ts     # Zod schemas — única fuente de verdad del contrato
├── project.types.ts      # Tipos derivados con z.infer (sin interfaces duplicadas)
├── projects.ts           # Repository: exporta únicamente PROJECTS
├── README.md
└── tests/
    └── projects.test.ts  # Contrato, schema y repository
```

Reglas del diseño:

- **El schema Zod es la única fuente de verdad.** Los tipos se derivan con `z.infer`. No existen interfaces manuales duplicadas.
- **Zod** se eligió como librería de validación runtime: es el estándar del ecosistema TypeScript, permite derivar tipos del schema (una sola definición del contrato) y no arrastra dependencias transitivas.
- `projects.ts` exporta únicamente `PROJECTS: readonly Project[]`. Sin funciones, filtros ni utilidades — cualquier consulta o derivación pertenece a capas superiores.
- Los enums son const objects + union types (no `enum` nativo), consistentes con el TypeScript estricto del monorepo.

## Modelo

Secciones de `Project`:

| Sección | Campos |
| --- | --- |
| Identity | `id`, `slug` (kebab-case), `name`, `tagline` |
| Description | `summary`, `description` |
| Status | `planning · development · production · maintenance · archived` |
| Visibility | `featured`, `public` |
| Dates | `startedAt`, `completedAt` (nullable), `lastUpdated` — ISO `YYYY-MM-DD` |
| Technologies | `{ name, kind, level }[]` |
| Architecture | `ArchitecturePattern[]` (conjunto tipado, no strings libres) |
| Features | `{ title, description }[]` |
| Challenges | `{ title, description, resolution? }[]` |
| Engineering Decisions | `{ title, context, decision, reasoning, impact }[]` |
| Lessons Learned | `{ title, description, category }[]` |
| Metrics | `{ commits, contributors, durationWeeks, modules, tests, coverage }` (nullable por campo) |
| Media | `{ type, url, alt, caption?, featured }[]` |
| Links | `{ repository?, live?, documentation?, article?, figma? }` |
| Role | `{ title, responsibilities }` |
| Tags | `string[]` |
| Relationships | `{ relatedProjects, relatedArticles, relatedSkills }` — solo IDs |
| Metadata | `{ version: 1 }` |
| Ownership | `{ type: personal · client · company · academic, confidential }` |

## Relaciones

Las relaciones guardan **únicamente IDs** (`string[]`), nunca objetos anidados:

- `relatedProjects` → IDs de otros proyectos en `PROJECTS` (los tests verifican integridad referencial).
- `relatedArticles` / `relatedSkills` → IDs de dominios futuros; hoy no se validan contra un repositorio porque esos dominios no existen aún.

## Cómo agregar un nuevo proyecto

1. Agrega el objeto al array `PROJECTS` en `projects.ts`. Usa los const objects de `project.enums.ts` (`PROJECT_STATUS`, `TECHNOLOGY_KIND`, etc.) en lugar de strings literales.
2. `id` y `slug` deben ser únicos y en kebab-case.
3. No inventes datos. Si falta información, usa `null`, arrays vacíos o marca `// TODO:` — nunca fabricar métricas, fechas ni decisiones.
4. Completa `engineeringDecisions` y `lessonsLearned` antes de marcar el proyecto como `public: true` — son la razón de ser del dominio.
5. Corre las pruebas: `pnpm test` (desde `apps/web/`). Validan el schema, la unicidad de IDs/slugs y la integridad de `relatedProjects`.

## Datos actuales

- `command-center` — proyecto real, completo.
- `todo-project-1`, `todo-project-2` — esqueletos marcados con TODO. Reemplazar con proyectos reales; mientras tanto permanecen `public: false` y `status: planning`.
