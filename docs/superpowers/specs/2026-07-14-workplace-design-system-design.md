# Workplace Design System — Design Spec

Status: Approved
Date: 2026-07-14
Owner: Daniel Cantor

## Purpose

> El paquete `@command-center/workplace-design-system` contiene únicamente conocimiento de dominio. No implementa algoritmos de planificación, generación de escenas, renderizado ni integración con IA. Todas las funciones expuestas son deterministas, de solo lectura y derivadas de los registros declarativos.

This is the architectural guardrail for the package. It exists so that future work on the Scene Planner, Scene Generator, or Renderer never leaks business logic into this package — this package only *describes* the workplace domain (modules, relations, materials, styles, spatial rules, planning presets). It does not decide, compute, or generate anything beyond simple deterministic lookups over its own data.

## Scope

**This sprint delivers:**
- `docs/vision/WORKPLACE_DESIGN_SYSTEM.md` — human-readable knowledge document (modules, rules, materials, styles), same tone/format as `docs/vision/PRODUCT_VISION.md`.
- `packages/workplace-design-system/` — the same knowledge as typed, zod-validated TypeScript constants and read-only lookup functions.

**Explicitly out of scope (future sprints):**
- Modeling real `.glb` assets (the "asset library" priority from the 3D pipeline work).
- The Scene Planner (headcount → module breakdown → dimensions → circulation → scene).
- Any change to `@command-center/ai-renderer`, `@command-center/scene-generator`, or the LLM system prompt. This package has zero dependents and zero dependencies on the existing scene pipeline packages. It is wired in when the Planner is built.

**Dependency direction (for when the Planner exists):**

```
Workplace Design System
        │
        ▼
   Scene Planner
        │
        ▼
  Scene Generator
        │
        ▼
   Scene Schema
        │
   ┌────┴────┐
   ▼         ▼
Scene Builder  Blender
```

Never the reverse — nothing upstream of Workplace Design System may be imported by it.

## Package structure

```
packages/workplace-design-system/
  src/
    constants.ts
    modules.ts
    module-relations.ts
    materials.ts
    spatial-rules.ts
    styles.ts
    planning-presets.ts
    index.ts
  tests/
    modules.test.ts
    module-relations.test.ts
    materials.test.ts
    spatial-rules.test.ts
    styles.test.ts
    planning-presets.test.ts
  package.json
  tsconfig.json
  eslint.config.js
  vitest.config.ts
```

Matches the sibling-package convention already in the monorepo (`ai-renderer`, `scene-builder`, `scene-generator`): `zod` schemas for validation, plain TS objects as the registries, `list*()` / `get*ById()` read-only accessor functions, `index.ts` re-exporting the public surface. `package.json` has one dependency (`zod`) and the same devDependencies/scripts (`lint`, `test`, `build` = `tsc --noEmit`) as `ai-renderer`.

### Import graph inside the package (no cycles)

- `constants.ts` — leaf. Exports `MODULE_IDS`/`ModuleId`, `MATERIAL_IDS`/`MaterialId`, `STYLE_IDS`/`StyleId`, `MaterialFamily`, `ModuleCategory`, `ModulePriority` as `as const` arrays + derived union types. Nothing else is imported here.
- `modules.ts` — imports `constants.ts` only.
- `module-relations.ts` — imports `constants.ts` only.
- `materials.ts` — imports `constants.ts` **and** `styles.ts` (to compute `getCompatibleStyles`, reading `STYLE_REGISTRY`).
- `styles.ts` — imports `constants.ts` only (never imports `materials.ts` — this is what keeps the graph acyclic).
- `spatial-rules.ts` — imports `constants.ts` only.
- `planning-presets.ts` — imports `constants.ts` and `modules.ts` (for `recommendedModules: ModuleId[]`).
- `index.ts` — re-exports everything.

## `constants.ts`

```ts
export const MODULE_IDS = [
  'reception', 'waiting_area', 'open_workspace', 'private_office',
  'meeting_room', 'phone_booth', 'collaboration_area', 'cafeteria',
  'break_room', 'print_area', 'server_room', 'storage',
  'executive_office', 'training_room',
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const MODULE_CATEGORIES = ['arrival', 'work', 'meeting', 'support', 'amenity'] as const;
export type ModuleCategory = (typeof MODULE_CATEGORIES)[number];

export const MODULE_PRIORITIES = ['required', 'optional'] as const;
export type ModulePriority = (typeof MODULE_PRIORITIES)[number];

export const MATERIAL_FAMILIES = ['floor', 'wall', 'furniture', 'fabric'] as const;
export type MaterialFamily = (typeof MATERIAL_FAMILIES)[number];

export const MATERIAL_IDS = [
  'concrete', 'wood', 'carpet', 'stone',
  'white_paint', 'gray_paint', 'wood_panels', 'glass',
  'oak', 'walnut', 'black_metal', 'white_metal',
  'gray', 'blue', 'green', 'black',
] as const;
export type MaterialId = (typeof MATERIAL_IDS)[number];

export const MATERIAL_FINISHES = ['matte', 'glossy', 'textured'] as const;
export type MaterialFinish = (typeof MATERIAL_FINISHES)[number];

export const STYLE_IDS = [
  'corporate_standard', 'tech_startup', 'executive_premium',
  'minimal', 'scandinavian', 'creative_studio',
] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export const SPACE_DENSITIES = ['low', 'medium', 'high'] as const;
export type SpaceDensity = (typeof SPACE_DENSITIES)[number];
```

## `modules.ts`

Zod schema:

```ts
export const moduleSchema = z.object({
  id: z.enum(MODULE_IDS),
  label: z.string(),
  category: z.enum(MODULE_CATEGORIES),
  priority: z.enum(MODULE_PRIORITIES),
  minAreaSqm: z.number().positive().optional(),
  areaPerOccupantSqm: z.number().positive().optional(),
  requiredAssets: z.array(z.string()),
});
```

Every module has exactly one of `minAreaSqm` (fixed-size modules) or `areaPerOccupantSqm` (modules that scale with headcount) — enforced by a `.refine()`. `requiredAssets` are this package's own vocabulary (e.g. `'reception_desk'`), **not** `@command-center/ai-renderer`'s `AssetId` — those don't exist for these yet; wiring the two together happens when real assets are modeled.

| id | category | priority | area | requiredAssets |
|---|---|---|---|---|
| reception | arrival | required | 20 sqm | reception_desk, logo_wall, sofa, side_table, planter, display_screen |
| waiting_area | arrival | required | 15 sqm | waiting_chair, side_table, planter, magazine_rack |
| open_workspace | work | required | 6 sqm/occupant | desk, office_chair, monitor, laptop_dock, waste_bin, planter |
| private_office | work | optional | 10 sqm | desk, office_chair, guest_chair, bookshelf, planter |
| meeting_room | meeting | required | 8 sqm (matches `spatial-rules.meeting.small`; medium/large tiers used when the Planner needs bigger rooms) | conference_table, meeting_chair, wall_tv, conference_camera, whiteboard, acoustic_panel |
| phone_booth | meeting | optional | 2 sqm | booth_stool, booth_desk, acoustic_panel |
| collaboration_area | work | optional | 20 sqm | lounge_seating, low_table, whiteboard, planter |
| cafeteria | amenity | optional | 1.8 sqm/occupant | dining_table, dining_chair, counter, vending_machine |
| break_room | amenity | optional | 15 sqm | kitchenette, dining_table, dining_chair, refrigerator, coffee_machine |
| print_area | support | optional | 6 sqm | printer, supply_cabinet, waste_bin |
| server_room | support | optional | 10 sqm | server_rack, cooling_unit, access_panel |
| storage | support | optional | 10 sqm | storage_shelving, storage_bin |
| executive_office | work | optional | 20 sqm | executive_desk, bookshelf, sofa, artwork, planter |
| training_room | meeting | optional | 2 sqm/occupant | training_table, training_chair, projector_screen, whiteboard |

`reception`, `waiting_area`, `open_workspace`, `meeting_room` are the only `required` modules — the minimum viable office. Everything else is `optional` and is included or excluded by whatever consumes this package (the future Planner), based on company size/type — that decision logic is explicitly out of scope here.

## `module-relations.ts`

```ts
export const moduleRelationSchema = z.object({
  id: z.enum(MODULE_IDS),
  adjacentTo: z.array(z.enum(MODULE_IDS)),
  avoidAdjacentTo: z.array(z.enum(MODULE_IDS)),
});
```

Fully typed graph (`ModuleId[]`, not strings), one entry per module:

| id | adjacentTo | avoidAdjacentTo |
|---|---|---|
| reception | waiting_area | server_room, storage |
| waiting_area | reception, open_workspace | server_room |
| open_workspace | waiting_area, collaboration_area, meeting_room, print_area | server_room |
| private_office | open_workspace | cafeteria, break_room |
| meeting_room | open_workspace, collaboration_area | server_room, storage |
| phone_booth | open_workspace, collaboration_area | — |
| collaboration_area | open_workspace, meeting_room | server_room |
| cafeteria | break_room | server_room, private_office, executive_office |
| break_room | cafeteria, open_workspace | server_room, executive_office |
| print_area | open_workspace | cafeteria |
| server_room | storage | break_room, meeting_room, cafeteria, reception, waiting_area |
| storage | server_room, print_area | reception, executive_office |
| executive_office | private_office | server_room, storage, print_area, cafeteria |
| training_room | collaboration_area | server_room |

A test asserts every `ModuleId` in `MODULE_IDS` has exactly one relation entry, and every id referenced inside `adjacentTo`/`avoidAdjacentTo` is a valid `ModuleId` (self-references excluded).

## `materials.ts`

```ts
export const materialSchema = z.object({
  id: z.enum(MATERIAL_IDS),
  label: z.string(),
  family: z.enum(MATERIAL_FAMILIES),
  baseColorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  finish: z.enum(MATERIAL_FINISHES),
});

export function getCompatibleStyles(materialId: MaterialId): StyleId[] {
  return listStyles()
    .filter((style) => Object.values(style.materialPalette).includes(materialId))
    .map((style) => style.id);
}
```

`getCompatibleStyles` is derived, not stored — **`styles.ts` is the source of truth for palettes**; `materials.ts` only reads it. That's why the compatibility lookup lives on the materials side instead of being a field stored on each material: there is no hand-maintained duplicate that can drift out of sync.

| id | family | baseColorHex | finish |
|---|---|---|---|
| concrete | floor | #B7B8B6 | textured |
| wood | floor | #A9754F | matte |
| carpet | floor | #5B6470 | textured |
| stone | floor | #8C8A85 | matte |
| white_paint | wall | #F5F4F0 | matte |
| gray_paint | wall | #9CA0A6 | matte |
| wood_panels | wall | #8A5A34 | matte |
| glass | wall | #CFE8F0 | glossy |
| oak | furniture | #C69A63 | matte |
| walnut | furniture | #5B3A29 | matte |
| black_metal | furniture | #232323 | matte |
| white_metal | furniture | #E7E7E4 | matte |
| gray | fabric | #8D8F92 | textured |
| blue | fabric | #3A5A78 | textured |
| green | fabric | #4C6B54 | textured |
| black | fabric | #1D1D1D | textured |

`baseColorHex` is an approximate visual reference for the future renderer/viewer, not a real PBR texture — no texture files exist yet, that's priority-2/3 work on the 3D pipeline.

## `styles.ts`

```ts
export const styleSchema = z.object({
  id: z.enum(STYLE_IDS),
  label: z.string(),
  description: z.string(),
  materialPalette: z.object({
    floor: z.enum(MATERIAL_IDS),
    wall: z.enum(MATERIAL_IDS),
    furniture: z.enum(MATERIAL_IDS),
    fabric: z.enum(MATERIAL_IDS),
  }),
  spaceDensity: z.enum(SPACE_DENSITIES),
  mood: z.array(z.string()),
});
```

Six corporate typologies for v1 (not pure aesthetics — each implies a different density and material logic; banking/legal/logistics/hospitality typologies are deferred to v2):

| id | palette (floor/wall/furniture/fabric) | density | mood |
|---|---|---|---|
| corporate_standard | carpet / gray_paint / black_metal / gray | medium | professional, neutral, reliable |
| tech_startup | concrete / white_paint / black_metal / green | high | energetic, open, casual |
| executive_premium | wood / wood_panels / walnut / black | low | premium, quiet, refined |
| minimal | concrete / white_paint / white_metal / gray | low | clean, uncluttered, bright |
| scandinavian | wood / white_paint / oak / green | medium | warm, natural, light |
| creative_studio | wood / gray_paint / black_metal / blue | high | playful, expressive, flexible |

A test asserts every material id in every `materialPalette` exists in `MATERIAL_IDS`, and that `getCompatibleStyles` correctly inverts every palette entry (property test, not example-based).

## `spatial-rules.ts`

Grouped, not flat — six groups, each its own zod object, composed into one `SPATIAL_RULES` constant:

```ts
export const spatialRulesSchema = z.object({
  circulation: z.object({
    mainCorridorWidthM: z.number(),
    secondaryCorridorWidthM: z.number(),
    minTurningRadiusM: z.number(),
  }),
  furniture: z.object({
    deskSeparationM: z.number(),
    chairClearanceM: z.number(),
    monitorDistanceM: z.number(),
  }),
  meeting: z.object({
    small: z.object({ capacity: z.string(), minAreaSqm: z.number() }),
    medium: z.object({ capacity: z.string(), minAreaSqm: z.number() }),
    large: z.object({ capacity: z.string(), minAreaSqm: z.number() }),
  }),
  accessibility: z.object({
    minDoorWidthM: z.number(),
    wheelchairTurningRadiusM: z.number(),
    accessibleDeskClearanceM: z.number(),
  }),
  safety: z.object({
    minEmergencyExitWidthM: z.number(),
    maxDistanceToExitM: z.number(),
    minFireExtinguisherSpacingM: z.number(),
  }),
  planning: z.object({
    maxPeoplePerOpenWorkspace: z.number(),
    peoplePerMeetingRoom: z.number(),
    peoplePerExecutiveOffice: z.number(),
    peoplePerPhoneBooth: z.number(),
    peoplePerBreakRoom: z.number(),
  }),
});
```

Values (approximate, plausible office-design practice — not a compliance/building-code document):

- **Circulation**: main corridor 1.5m, secondary corridor 1.0m, turning radius 1.5m.
- **Furniture**: desk separation 1.2m, chair clearance 0.75m, monitor distance 0.6m.
- **Meeting**: small = 2-4 people / 8 sqm, medium = 5-8 people / 16 sqm, large = 9-16 people / 30 sqm.
- **Accessibility**: min door width 0.9m, wheelchair turning radius 1.5m, accessible desk clearance 1.5m.
- **Safety**: min emergency exit width 1.1m, max distance to exit 30m, min fire-extinguisher spacing 25m.
- **Planning** — the group the Planner will read constantly, so it never hardcodes ratios: max 60 people per open workspace before splitting, 1 meeting room per 12 people, 1 executive office per 25 people, 1 phone booth per 15 people, 1 break room per 30 people.

> Estos valores son heurísticos de diseño corporativo y no sustituyen normativa técnica ni regulaciones locales (código de construcción, accesibilidad, seguridad contra incendios). Sirven para que el Planner genere escenas con sentido espacial, no para certificar un espacio real.

## `planning-presets.ts`

```ts
export const planningPresetSchema = z.object({
  id: z.string(),
  label: z.string(),
  minOccupants: z.number(),
  maxOccupants: z.number().nullable(),
  recommendedModules: z.array(z.enum(MODULE_IDS)),
  targetStyle: z.enum(STYLE_IDS).optional(),
});
```

`targetStyle` is a non-binding suggestion — the Planner (or whoever calls it) is free to override it with an explicit user choice; it just gives a sensible default when none is provided.

Four size tiers, each with a baseline module set so the Planner looks up a starting point instead of computing one from scratch:

| id | label | occupants | recommendedModules | targetStyle |
|---|---|---|---|---|
| small_office | Small Office | 1–10 | reception, waiting_area, open_workspace, meeting_room, break_room | tech_startup |
| medium_office | Medium Office | 11–40 | + phone_booth, print_area, private_office | corporate_standard |
| large_office | Large Office | 41–120 | + collaboration_area, cafeteria, server_room, storage | corporate_standard |
| enterprise | Enterprise | 121+ (no max) | + executive_office, training_room | executive_premium |

Each tier's `recommendedModules` list is written out in full in the code (cumulative in this table for readability only — the data itself is not "inherited," each preset is a complete standalone array).

## Testing strategy

Every registry gets a test file that:
1. Parses the full registry through its zod schema — catches malformed data immediately.
2. Asserts completeness — every id in the relevant `*_IDS` constant has exactly one registry entry (e.g. all 14 `MODULE_IDS` have a `modules.ts` entry, all 16 `MATERIAL_IDS` have a `materials.ts` entry).
3. Asserts referential integrity — every foreign id referenced (e.g. `module-relations.ts`'s `adjacentTo`, `styles.ts`'s `materialPalette`, `planning-presets.ts`'s `recommendedModules`) exists in its owning registry.

`materials.test.ts` additionally property-tests `getCompatibleStyles`: for every style in `STYLE_REGISTRY`, every material id in its `materialPalette` must include that style in `getCompatibleStyles(materialId)`.

No rendering, no snapshot images, no integration test with `ai-renderer`/`scene-generator` — this package has no runtime dependents yet.

## `docs/vision/WORKPLACE_DESIGN_SYSTEM.md`

Human-readable companion document, same voice/format as `PRODUCT_VISION.md`. Contains the same content as this spec's tables (modules, relations, materials, styles, spatial rules, presets) in prose/table form for humans, plus the architectural guardrail statement from the Purpose section verbatim. This is the document the user described as "el conocimiento del Scene Planner" — written for a human or an LLM prompt to read directly, whereas the package is the same knowledge in a form code can import and validate.
