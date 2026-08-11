# Auditoría de evidencia de `PROJECTS`

## Alcance y método

Esta auditoría cubre exactamente los seis registros exportados por `PROJECTS`, en su orden de
exportación, sobre el baseline Git `33770ba` del 2026-08-11:

1. `command-center`
2. `kliniu`
3. `vevi`
4. `intranet-ess`
5. `lorigine`
6. `4ustudio-academy`

Las únicas fuentes admitidas fueron documentos, código, manifests y Git de este repositorio. No
se consultaron sitios externos ni repositorios de los otros productos. El commit `e31e6db`
introdujo los seis registros; el commit `6d81d32` modificó `intranet-ess`, `lorigine` y
`4ustudio-academy`. Esos commits prueban procedencia dentro de Command Center, pero no validan por
sí solos afirmaciones sobre código que no existe en este worktree.

Los estados significan:

- `VERIFIED`: el campo está completo y existe corroboración local independiente del texto del
  registro.
- `PARTIAL`: el campo tiene contenido o una fuente candidata, pero su alcance, vigencia o verdad
  sustantiva no puede corroborarse por completo con las fuentes admitidas.
- `MISSING` — No se encontró evidencia en las fuentes auditadas.

La presencia y la forma se contrastaron contra
[`project.schema.ts`](../../apps/web/data/projects/project.schema.ts) y las invariantes del
repositorio contra
[`projects.test.ts`](../../apps/web/data/projects/tests/projects.test.ts). El propio registro
cuenta como evidencia de que un valor fue importado, no como corroboración independiente de ese
valor.

## Matriz de completitud

### Identidad a retos

| Proyecto | identity | overview | status | visibility | technologies | architecture | features | challenges |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `command-center` | [VERIFIED](../../README.md) | [PARTIAL](../../apps/web/data/projects/command-center.ts) | VERIFIED — commit `33770ba` | [VERIFIED](../../apps/web/modules/projects/components/projects-grid/component.tsx) | [PARTIAL](../../apps/web/package.json) | [VERIFIED](../engineering/architecture.md) | [PARTIAL](../../apps/web/data/projects/command-center.ts) | [PARTIAL](../../decisions/ADR-005-tailwind-v4-monorepo.md) |
| `kliniu` | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [VERIFIED](../../apps/web/modules/projects/components/projects-grid/component.tsx) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) |
| `vevi` | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [VERIFIED](../../apps/web/modules/projects/components/projects-grid/component.tsx) | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [PARTIAL](../../apps/web/data/projects/vevi.ts) |
| `intranet-ess` | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [VERIFIED](../../apps/web/modules/projects/components/projects-grid/component.tsx) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) |
| `lorigine` | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [VERIFIED](../../apps/web/modules/projects/components/projects-grid/component.tsx) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) |
| `4ustudio-academy` | [PARTIAL](../../apps/web/data/projects/academy.ts) | [PARTIAL](../../apps/web/data/projects/academy.ts) | [PARTIAL](../../apps/web/data/projects/academy.ts) | [VERIFIED](../../apps/web/modules/projects/components/projects-grid/component.tsx) | [PARTIAL](../../apps/web/data/projects/academy.ts) | [PARTIAL](../../apps/web/data/projects/academy.ts) | [PARTIAL](../../apps/web/data/projects/academy.ts) | [PARTIAL](../../apps/web/data/projects/academy.ts) |

### Decisiones a relaciones

| Proyecto | engineeringDecisions | lessonsLearned | metrics | media | repository | live | documentation | relationships |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `command-center` | [PARTIAL](../../decisions/ADR-004-design-system.md) | [PARTIAL](../../apps/web/data/projects/command-center.ts) | [PARTIAL](../../apps/web/data/projects/command-center.ts) | MISSING — No se encontró evidencia en las fuentes auditadas | [VERIFIED](../../apps/web/data/projects/command-center.ts) | [PARTIAL](../engineering/deployment.md) | MISSING — No se encontró evidencia en las fuentes auditadas | [PARTIAL](../../apps/web/data/projects/tests/projects.test.ts) |
| `kliniu` | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | [PARTIAL](../../apps/web/data/projects/kliniu.ts) | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | [PARTIAL](../../apps/web/data/projects/tests/projects.test.ts) |
| `vevi` | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [PARTIAL](../../apps/web/data/projects/vevi.ts) | [PARTIAL](../../apps/web/data/projects/vevi.ts) | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | [PARTIAL](../../apps/web/data/projects/tests/projects.test.ts) |
| `intranet-ess` | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | MISSING — No se encontró evidencia en las fuentes auditadas | [PARTIAL](../../apps/web/data/projects/intranet-ess.ts) | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | [PARTIAL](../../apps/web/data/projects/tests/projects.test.ts) |
| `lorigine` | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | [PARTIAL](../../apps/web/data/projects/lorigine.ts) | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | [PARTIAL](../../apps/web/data/projects/tests/projects.test.ts) |
| `4ustudio-academy` | [PARTIAL](../../apps/web/data/projects/academy.ts) | [PARTIAL](../../apps/web/data/projects/academy.ts) | [PARTIAL](../../apps/web/data/projects/academy.ts) | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | MISSING — No se encontró evidencia en las fuentes auditadas | [PARTIAL](../../apps/web/data/projects/tests/projects.test.ts) |

## Detalle por proyecto

### `command-center`

- `identity` está corroborado por [`README.md`](../../README.md),
  [`package.json`](../../package.json), el remote Git `origin` y el registro
  [`command-center.ts`](../../apps/web/data/projects/command-center.ts).
- `overview` es `PARTIAL` porque describe correctamente el monorepo, el sistema de módulos, el
  design system y la capa de evidencia, pero conserva una instantánea de siete módulos y de la
  fundación inicial. El modelo vigente está documentado en
  [`COMMAND_CENTER_PRODUCT_MODEL.md`](COMMAND_CENTER_PRODUCT_MODEL.md) y el código ya incluye el
  subsistema de escenas y paquetes adicionales.
- `status` está sustentado como desarrollo activo por el historial hasta el commit `33770ba`, la
  ausencia de `completedAt` y el trabajo de producto aprobado en
  [`2026-08-11-command-center-product-clarity-design.md`](../superpowers/specs/2026-08-11-command-center-product-clarity-design.md).
  La fecha `lastUpdated: 2026-07-09` no refleja la actividad posterior.
- `visibility` está corroborado: `public: true` entra en el filtro de
  [`projects-grid/component.tsx`](../../apps/web/modules/projects/components/projects-grid/component.tsx)
  y `featured: true` es consumido por
  [`projects/component.tsx`](../../apps/web/modules/projects/component.tsx).
- `technologies` es `PARTIAL`: los manifests corroboran TypeScript, Next.js, React, Tailwind CSS,
  Zustand, Zod, Prisma, Supabase, Turborepo, Vitest y pnpm, pero los niveles de dominio son una
  valoración editorial sin fuente independiente. Fuentes:
  [`apps/web/package.json`](../../apps/web/package.json) y [`package.json`](../../package.json).
- `architecture` está corroborado por
  [`docs/engineering/architecture.md`](../engineering/architecture.md), la separación `apps/` y
  `packages/`, [`module-registry`](../../apps/web/modules/module-registry) y
  [`packages/ui`](../../packages/ui).
- `features` es `PARTIAL`: las nueve entradas importadas tienen código o documentación local, pero
  el conjunto y varios conteos quedaron por detrás del estado actual. Fuentes:
  [`command-center.ts`](../../apps/web/data/projects/command-center.ts),
  [`apps/web/modules`](../../apps/web/modules) y [`packages`](../../packages).
- `challenges`, `engineeringDecisions` y `lessonsLearned` son `PARTIAL`. Los problemas de Tailwind
  y design system sí están respaldados por
  [`ADR-004`](../../decisions/ADR-004-design-system.md) y
  [`ADR-005`](../../decisions/ADR-005-tailwind-v4-monorepo.md); el resto mezcla hechos rastreables
  con síntesis retrospectivas que no tienen una fuente individual por entrada.
- `metrics` es `PARTIAL`: el registro declara 27 commits, mientras el baseline `33770ba` contiene
  64 commits (`git rev-list --count 33770ba`). También conserva siete módulos y 228 pruebas; la
  suite requerida por esta auditoría ejecutó 264 pruebas. Son cifras no recalculadas en el
  registro. Los valores `durationWeeks` y `coverage` permanecen `null`, como permite
  [`project.schema.ts`](../../apps/web/data/projects/project.schema.ts).
- `media` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `repository` coincide con el remote Git `origin` y con
  [`command-center.ts`](../../apps/web/data/projects/command-center.ts).
- `live` es `PARTIAL`: [`deployment.md`](../engineering/deployment.md) registra un alias público,
  pero `links.live` está ausente y la política de esta auditoría impide comprobar la respuesta de
  red.
- `documentation` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `relationships` es `PARTIAL`: el registro no declara relaciones salientes, mientras los otros
  cinco proyectos lo referencian. La validez de esos IDs sí está cubierta por
  [`projects.test.ts`](../../apps/web/data/projects/tests/projects.test.ts); la reciprocidad no es
  una invariante del schema.

### `kliniu`

- `identity`, `overview`, `status`, `technologies`, `architecture`, `features`, `challenges`,
  `engineeringDecisions` y `lessonsLearned` son `PARTIAL`. El registro
  [`kliniu.ts`](../../apps/web/data/projects/kliniu.ts) contiene esos campos y el commit `e31e6db`
  prueba su importación, pero este worktree no contiene código, manifest, documentación ni
  historial Git de Kliniu para corroborar sus afirmaciones.
- `visibility` está corroborado dentro de Command Center: `public: true` hace que el registro pase
  el filtro de [`projects-grid/component.tsx`](../../apps/web/modules/projects/components/projects-grid/component.tsx)
  y `featured: false` evita que sea la selección destacada.
- `metrics` es `PARTIAL`: declara 194 commits, un contribuidor, ocho semanas y quince módulos;
  `tests` y `coverage` son `null`. No existe Git o suite de Kliniu dentro de las fuentes admitidas
  para reproducir los valores no nulos.
- `media` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `repository` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `live` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `documentation` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `relationships` es `PARTIAL`: `command-center` es un ID válido, pero el significado de la
  relación solo aparece en [`kliniu.ts`](../../apps/web/data/projects/kliniu.ts). Los arrays de
  artículos y capacidades están vacíos.

### `vevi`

- `identity`, `overview`, `status`, `technologies`, `architecture`, `features`, `challenges`,
  `engineeringDecisions` y `lessonsLearned` son `PARTIAL`. El registro
  [`vevi.ts`](../../apps/web/data/projects/vevi.ts) tiene contenido y procede del commit `e31e6db`,
  pero no hay código, manifests, documentación ni Git de Vevi en este worktree.
- `visibility` está corroborado dentro de Command Center por `public: true`, `featured: false` y
  el consumidor [`projects-grid/component.tsx`](../../apps/web/modules/projects/components/projects-grid/component.tsx).
- `metrics` es `PARTIAL`: declara dos commits, un contribuidor y trece módulos, con los otros tres
  valores en `null`; no hay fuentes locales del producto para reproducir esas cifras.
- `media` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `repository` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `live` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `documentation` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `relationships` es `PARTIAL`: la referencia a `command-center` pasa la integridad referencial,
  pero no tiene corroboración semántica fuera de
  [`vevi.ts`](../../apps/web/data/projects/vevi.ts). Los arrays de artículos y capacidades están
  vacíos.

### `intranet-ess`

- `identity`, `overview`, `status`, `technologies`, `architecture`, `features`, `challenges`,
  `engineeringDecisions` y `lessonsLearned` son `PARTIAL`. La evidencia admitida se limita al
  registro [`intranet-ess.ts`](../../apps/web/data/projects/intranet-ess.ts), su importación en el
  commit `e31e6db` y el ajuste público del commit `6d81d32`; no está el código ni el Git del
  producto Intranet ESS.
- `visibility` está corroborado dentro de Command Center por `public: true`, `featured: false` y
  [`projects-grid/component.tsx`](../../apps/web/modules/projects/components/projects-grid/component.tsx).
- `metrics` es `PARTIAL`: declara 51 commits, un contribuidor, una semana, siete módulos y 58
  pruebas; `coverage` es `null`. El repositorio auditado no permite reproducir esas cifras.
- `media` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `repository` es `PARTIAL`: existe una URL en
  [`intranet-ess.ts`](../../apps/web/data/projects/intranet-ess.ts), pero no coincide con ningún
  remote del worktree y no se verificó por red.
- `live` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `documentation` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `relationships` es `PARTIAL`: `command-center` existe y pasa la prueba de integridad, pero la
  semántica solo está declarada en el registro. Los arrays de artículos y capacidades están
  vacíos.

### `lorigine`

- `identity`, `overview`, `status`, `technologies`, `architecture`, `features`, `challenges`,
  `engineeringDecisions` y `lessonsLearned` son `PARTIAL`. El detalle está en
  [`lorigine.ts`](../../apps/web/data/projects/lorigine.ts) y su procedencia se rastrea a los
  commits `e31e6db` y `6d81d32`, pero no hay fuentes independientes de L'ORIGINE dentro del
  worktree.
- `visibility` está corroborado dentro de Command Center por `public: true`, `featured: false` y
  [`projects-grid/component.tsx`](../../apps/web/modules/projects/components/projects-grid/component.tsx).
- `metrics` es `PARTIAL`: declara trece commits, un contribuidor y nueve módulos; los valores de
  duración, pruebas y cobertura están en `null`. No hay Git ni suite local del producto para
  reproducir las cifras.
- `media` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `repository` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `live` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `documentation` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `relationships` es `PARTIAL`: `command-center` es válido, pero la relación solo está declarada
  en [`lorigine.ts`](../../apps/web/data/projects/lorigine.ts). Los arrays de artículos y
  capacidades están vacíos.

### `4ustudio-academy`

- `identity`, `overview`, `status`, `technologies`, `architecture`, `features`, `challenges`,
  `engineeringDecisions` y `lessonsLearned` son `PARTIAL`. La única fuente sustantiva local es
  [`academy.ts`](../../apps/web/data/projects/academy.ts), importada en `e31e6db` y ajustada en
  `6d81d32`; el código, los manifests y el Git de 4U Studio Academy no están en el worktree.
- `visibility` está corroborado dentro de Command Center por `public: true`, `featured: false` y
  [`projects-grid/component.tsx`](../../apps/web/modules/projects/components/projects-grid/component.tsx).
- `metrics` es `PARTIAL`: declara 253 commits, un contribuidor y veinte módulos, con duración,
  pruebas y cobertura en `null`. No existen fuentes locales del producto para reproducir los
  valores no nulos.
- `media` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `repository` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `live` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `documentation` está vacío: MISSING — No se encontró evidencia en las fuentes auditadas.
- `relationships` es `PARTIAL`: la referencia a `command-center` es válida, pero su significado
  solo está declarado en [`academy.ts`](../../apps/web/data/projects/academy.ts). Los arrays de
  artículos y capacidades están vacíos.

## Integridad del conjunto

| Comprobación | Estado | Evidencia y resultado |
| --- | --- | --- |
| Exactamente seis registros y orden de exportación | [VERIFIED](../../apps/web/data/projects/projects.ts) | Los IDs son `command-center`, `kliniu`, `vevi`, `intranet-ess`, `lorigine`, `4ustudio-academy`, sin proyectos externos. |
| IDs únicos | [VERIFIED](../../apps/web/data/projects/tests/projects.test.ts) | La suite compara el tamaño del `Set` de IDs con el array. |
| Slugs únicos y válidos | [VERIFIED](../../apps/web/data/projects/tests/projects.test.ts) | La suite comprueba unicidad y el schema exige kebab-case. |
| `relatedProjects` referencialmente válidos | [VERIFIED](../../apps/web/data/projects/tests/projects.test.ts) | Los cinco registros externos apuntan a `command-center`; no hay IDs huérfanos. |
| Relaciones semánticamente corroboradas | [PARTIAL](../../apps/web/data/projects/projects.ts) | Las referencias son válidas, pero su significado solo está declarado en los registros; artículos y capacidades están vacíos. |
| URLs con forma válida | [VERIFIED](../../apps/web/data/projects/project.schema.ts) | Zod valida sintaxis URL. Solo hay dos URLs de repositorio en los seis registros. |
| URLs de repositorio comprobables desde este Git | [PARTIAL](../../apps/web/data/projects/command-center.ts) | La URL de Command Center coincide con `origin`; la de Intranet ESS no puede comprobarse con los remotes locales. |
| Enlaces públicos | [PARTIAL](../engineering/deployment.md) | Hay un alias documentado para Command Center, pero ningún registro define `links.live` y no hubo verificación de red. |
| Enlaces de documentación | MISSING — No se encontró evidencia en las fuentes auditadas | Ningún registro define `links.documentation`. |
| Métricas reales o `null` | [PARTIAL](../../apps/web/data/projects/project.schema.ts) | Todos los valores satisfacen el tipo o son `null`; las cifras externas no son reproducibles y las de Command Center no están actualizadas al baseline. |
| Media real o ausente | [VERIFIED](../../apps/web/data/projects/projects.ts) | Los seis arrays están vacíos; no se publican URLs ni descripciones de media sin respaldo. |
| Status sustentado | [PARTIAL](../../apps/web/data/projects/projects.ts) | Command Center tiene actividad local que respalda desarrollo; los otros cinco estados solo constan en sus registros importados. |
| Visibilidad sustentada | [VERIFIED](../../apps/web/modules/projects/components/projects-grid/component.tsx) | Los seis son públicos, solo Command Center es destacado y el consumidor aplica ambos flags. |

## Resultado

El contrato estructural de `PROJECTS` es consistente, pero la evidencia sustantiva no es uniforme.
Command Center dispone de código, documentación, manifests y Git locales; aun así, su dossier
necesita actualizar overview, features, fechas y métricas. Los otros cinco proyectos tienen
registros editoriales extensos sin las fuentes de origen necesarias en este worktree para elevar
sus campos técnicos o históricos a `VERIFIED`. La siguiente fase debe incorporar evidencia real
por proyecto antes de completar enlaces, media o cifras; esta auditoría no propone valores
sustitutos.
