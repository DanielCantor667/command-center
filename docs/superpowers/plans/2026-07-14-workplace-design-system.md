# Workplace Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/workplace-design-system` — a standalone, dependency-free (within the monorepo's scene pipeline) knowledge package describing corporate workplace modules, their relations, materials, styles, spatial rules, and headcount planning presets — plus its human-readable companion doc.

**Architecture:** Six data files (`constants.ts`, `modules.ts`, `module-relations.ts`, `styles.ts`, `materials.ts`, `spatial-rules.ts`, `planning-presets.ts`) each exporting a zod schema, a typed registry, and read-only `get*`/`list*` accessors, re-exported from `index.ts`. `materials.ts` is the only file that imports a sibling data file (`styles.ts`), to derive `getCompatibleStyles()` without duplicating palette data.

**Tech Stack:** TypeScript, zod (schema validation), vitest (tests), matches the existing `@command-center/ai-renderer` package's conventions exactly (same `package.json` shape, same `tsconfig`/`eslint`/`vitest` config, same `get*`/`list*` accessor pattern).

## Global Constraints

- Package boundary (verbatim from spec): "El paquete `@command-center/workplace-design-system` contiene únicamente conocimiento de dominio. No implementa algoritmos de planificación, generación de escenas, renderizado ni integración con IA. Todas las funciones expuestas son deterministas, de solo lectura y derivadas de los registros declarativos."
- Zero changes to `@command-center/ai-renderer`, `@command-center/scene-generator`, or any existing package — fully additive, no wiring in this plan.
- Import direction inside the package: `constants.ts` is a leaf; `modules.ts`, `module-relations.ts`, `styles.ts`, `spatial-rules.ts` import only `constants.ts`; `materials.ts` imports `constants.ts` and `styles.ts`; `planning-presets.ts` imports only `constants.ts`. `styles.ts` never imports `materials.ts` — this is what keeps the graph acyclic.
- `styles.ts` is the source of truth for style↔material palettes; `materials.ts` derives compatibility, never duplicates it.
- Spatial rule values are heuristics, not compliance/building-code data — this must be stated in the doc.
- Doc naming matches package naming: `docs/vision/WORKPLACE_DESIGN_SYSTEM.md`.
- Package name: `@command-center/workplace-design-system`, directory: `packages/workplace-design-system`.

---

### Task 1: Scaffold package + `constants.ts`

**Files:**
- Create: `packages/workplace-design-system/package.json`
- Create: `packages/workplace-design-system/tsconfig.json`
- Create: `packages/workplace-design-system/eslint.config.js`
- Create: `packages/workplace-design-system/vitest.config.ts`
- Create: `packages/workplace-design-system/src/constants.ts`
- Test: `packages/workplace-design-system/tests/constants.test.ts`

**Interfaces:**
- Produces: `MODULE_IDS: readonly string[]`, `type ModuleId`, `MODULE_CATEGORIES`, `type ModuleCategory`, `MODULE_PRIORITIES`, `type ModulePriority`, `MATERIAL_FAMILIES`, `type MaterialFamily`, `MATERIAL_IDS`, `type MaterialId`, `MATERIAL_FINISHES`, `type MaterialFinish`, `STYLE_IDS`, `type StyleId`, `SPACE_DENSITIES`, `type SpaceDensity` — all from `src/constants.ts`. Every later task imports from this file.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@command-center/workplace-design-system",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "build": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@command-center/eslint-config": "workspace:*",
    "@command-center/tsconfig": "workspace:*",
    "eslint": "^9.17.0",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "@command-center/tsconfig/base.json",
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `eslint.config.js`**

```js
import config from '@command-center/eslint-config';

export default config;
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
  },
});
```

- [ ] **Step 5: Link the new workspace package**

Run: `pnpm install`
Expected: completes without error; `packages/workplace-design-system` now resolves `@command-center/eslint-config`, `@command-center/tsconfig`, `zod`, `vitest` from the workspace.

- [ ] **Step 6: Write the failing test for `constants.ts`**

```ts
// packages/workplace-design-system/tests/constants.test.ts
import { describe, expect, it } from 'vitest';
import {
  MODULE_IDS,
  MODULE_CATEGORIES,
  MODULE_PRIORITIES,
  MATERIAL_FAMILIES,
  MATERIAL_IDS,
  MATERIAL_FINISHES,
  STYLE_IDS,
  SPACE_DENSITIES,
} from '../src/constants';

describe('constants', () => {
  it('has exactly 14 unique module ids', () => {
    expect(MODULE_IDS).toHaveLength(14);
    expect(new Set(MODULE_IDS).size).toBe(MODULE_IDS.length);
  });

  it('has exactly 16 unique material ids', () => {
    expect(MATERIAL_IDS).toHaveLength(16);
    expect(new Set(MATERIAL_IDS).size).toBe(MATERIAL_IDS.length);
  });

  it('has exactly 6 unique style ids', () => {
    expect(STYLE_IDS).toHaveLength(6);
    expect(new Set(STYLE_IDS).size).toBe(STYLE_IDS.length);
  });

  it('has 5 module categories, 2 module priorities, 4 material families, 3 material finishes, 3 space densities', () => {
    expect(MODULE_CATEGORIES).toHaveLength(5);
    expect(MODULE_PRIORITIES).toHaveLength(2);
    expect(MATERIAL_FAMILIES).toHaveLength(4);
    expect(MATERIAL_FINISHES).toHaveLength(3);
    expect(SPACE_DENSITIES).toHaveLength(3);
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test`
Expected: FAIL — `src/constants.ts` does not exist (`Cannot find module '../src/constants'`).

- [ ] **Step 8: Implement `src/constants.ts`**

```ts
export const MODULE_IDS = [
  'reception',
  'waiting_area',
  'open_workspace',
  'private_office',
  'meeting_room',
  'phone_booth',
  'collaboration_area',
  'cafeteria',
  'break_room',
  'print_area',
  'server_room',
  'storage',
  'executive_office',
  'training_room',
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const MODULE_CATEGORIES = ['arrival', 'work', 'meeting', 'support', 'amenity'] as const;
export type ModuleCategory = (typeof MODULE_CATEGORIES)[number];

export const MODULE_PRIORITIES = ['required', 'optional'] as const;
export type ModulePriority = (typeof MODULE_PRIORITIES)[number];

export const MATERIAL_FAMILIES = ['floor', 'wall', 'furniture', 'fabric'] as const;
export type MaterialFamily = (typeof MATERIAL_FAMILIES)[number];

export const MATERIAL_IDS = [
  'concrete',
  'wood',
  'carpet',
  'stone',
  'white_paint',
  'gray_paint',
  'wood_panels',
  'glass',
  'oak',
  'walnut',
  'black_metal',
  'white_metal',
  'gray',
  'blue',
  'green',
  'black',
] as const;
export type MaterialId = (typeof MATERIAL_IDS)[number];

export const MATERIAL_FINISHES = ['matte', 'glossy', 'textured'] as const;
export type MaterialFinish = (typeof MATERIAL_FINISHES)[number];

export const STYLE_IDS = [
  'corporate_standard',
  'tech_startup',
  'executive_premium',
  'minimal',
  'scandinavian',
  'creative_studio',
] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export const SPACE_DENSITIES = ['low', 'medium', 'high'] as const;
export type SpaceDensity = (typeof SPACE_DENSITIES)[number];
```

- [ ] **Step 9: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test`
Expected: PASS — 4 tests pass.

- [ ] **Step 10: Commit**

```bash
git add packages/workplace-design-system/package.json packages/workplace-design-system/tsconfig.json packages/workplace-design-system/eslint.config.js packages/workplace-design-system/vitest.config.ts packages/workplace-design-system/src/constants.ts packages/workplace-design-system/tests/constants.test.ts pnpm-lock.yaml
git commit -m "feat(workplace-design-system): scaffold package and add shared id constants"
```

---

### Task 2: `modules.ts` — the 14 architectural modules

**Files:**
- Create: `packages/workplace-design-system/src/modules.ts`
- Test: `packages/workplace-design-system/tests/modules.test.ts`

**Interfaces:**
- Consumes: `MODULE_IDS`, `ModuleId`, `MODULE_CATEGORIES`, `ModuleCategory`, `MODULE_PRIORITIES`, `ModulePriority` from `../src/constants`.
- Produces: `moduleSchema` (zod), `type Module`, `MODULE_REGISTRY: Record<ModuleId, Module>`, `getModule(id: ModuleId): Module`, `listModules(): Module[]`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/workplace-design-system/tests/modules.test.ts
import { describe, expect, it } from 'vitest';
import { MODULE_IDS } from '../src/constants';
import { moduleSchema, MODULE_REGISTRY, getModule, listModules } from '../src/modules';

describe('modules', () => {
  it('has a valid, schema-conformant entry for every module id', () => {
    for (const id of MODULE_IDS) {
      expect(() => moduleSchema.parse(getModule(id))).not.toThrow();
    }
  });

  it('lists all 14 modules', () => {
    expect(listModules()).toHaveLength(MODULE_IDS.length);
  });

  it('marks exactly reception, waiting_area, open_workspace, and meeting_room as required', () => {
    const required = listModules()
      .filter((module) => module.priority === 'required')
      .map((module) => module.id)
      .sort();
    expect(required).toEqual(['meeting_room', 'open_workspace', 'reception', 'waiting_area'].sort());
  });

  it('rejects a module with both minAreaSqm and areaPerOccupantSqm set', () => {
    expect(() =>
      moduleSchema.parse({
        ...MODULE_REGISTRY.reception,
        minAreaSqm: 20,
        areaPerOccupantSqm: 6,
      }),
    ).toThrow();
  });

  it('rejects a module with neither minAreaSqm nor areaPerOccupantSqm set', () => {
    const { minAreaSqm: _minAreaSqm, ...rest } = MODULE_REGISTRY.reception;
    expect(() => moduleSchema.parse(rest)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test -- modules`
Expected: FAIL — `Cannot find module '../src/modules'`.

- [ ] **Step 3: Implement `src/modules.ts`**

```ts
import { z } from 'zod';
import { MODULE_CATEGORIES, MODULE_IDS, MODULE_PRIORITIES, type ModuleId } from './constants';

export const moduleSchema = z
  .object({
    id: z.enum(MODULE_IDS),
    label: z.string(),
    category: z.enum(MODULE_CATEGORIES),
    priority: z.enum(MODULE_PRIORITIES),
    minAreaSqm: z.number().positive().optional(),
    areaPerOccupantSqm: z.number().positive().optional(),
    requiredAssets: z.array(z.string()),
  })
  .refine((module) => (module.minAreaSqm === undefined) !== (module.areaPerOccupantSqm === undefined), {
    message: 'exactly one of minAreaSqm or areaPerOccupantSqm must be set',
  });

export type Module = z.infer<typeof moduleSchema>;

export const MODULE_REGISTRY: Record<ModuleId, Module> = {
  reception: {
    id: 'reception',
    label: 'Reception',
    category: 'arrival',
    priority: 'required',
    minAreaSqm: 20,
    requiredAssets: ['reception_desk', 'logo_wall', 'sofa', 'side_table', 'planter', 'display_screen'],
  },
  waiting_area: {
    id: 'waiting_area',
    label: 'Waiting Area',
    category: 'arrival',
    priority: 'required',
    minAreaSqm: 15,
    requiredAssets: ['waiting_chair', 'side_table', 'planter', 'magazine_rack'],
  },
  open_workspace: {
    id: 'open_workspace',
    label: 'Open Workspace',
    category: 'work',
    priority: 'required',
    areaPerOccupantSqm: 6,
    requiredAssets: ['desk', 'office_chair', 'monitor', 'laptop_dock', 'waste_bin', 'planter'],
  },
  private_office: {
    id: 'private_office',
    label: 'Private Office',
    category: 'work',
    priority: 'optional',
    minAreaSqm: 10,
    requiredAssets: ['desk', 'office_chair', 'guest_chair', 'bookshelf', 'planter'],
  },
  meeting_room: {
    id: 'meeting_room',
    label: 'Meeting Room',
    category: 'meeting',
    priority: 'required',
    minAreaSqm: 8,
    requiredAssets: ['conference_table', 'meeting_chair', 'wall_tv', 'conference_camera', 'whiteboard', 'acoustic_panel'],
  },
  phone_booth: {
    id: 'phone_booth',
    label: 'Phone Booth',
    category: 'meeting',
    priority: 'optional',
    minAreaSqm: 2,
    requiredAssets: ['booth_stool', 'booth_desk', 'acoustic_panel'],
  },
  collaboration_area: {
    id: 'collaboration_area',
    label: 'Collaboration Area',
    category: 'work',
    priority: 'optional',
    minAreaSqm: 20,
    requiredAssets: ['lounge_seating', 'low_table', 'whiteboard', 'planter'],
  },
  cafeteria: {
    id: 'cafeteria',
    label: 'Cafeteria',
    category: 'amenity',
    priority: 'optional',
    areaPerOccupantSqm: 1.8,
    requiredAssets: ['dining_table', 'dining_chair', 'counter', 'vending_machine'],
  },
  break_room: {
    id: 'break_room',
    label: 'Break Room',
    category: 'amenity',
    priority: 'optional',
    minAreaSqm: 15,
    requiredAssets: ['kitchenette', 'dining_table', 'dining_chair', 'refrigerator', 'coffee_machine'],
  },
  print_area: {
    id: 'print_area',
    label: 'Print Area',
    category: 'support',
    priority: 'optional',
    minAreaSqm: 6,
    requiredAssets: ['printer', 'supply_cabinet', 'waste_bin'],
  },
  server_room: {
    id: 'server_room',
    label: 'Server Room',
    category: 'support',
    priority: 'optional',
    minAreaSqm: 10,
    requiredAssets: ['server_rack', 'cooling_unit', 'access_panel'],
  },
  storage: {
    id: 'storage',
    label: 'Storage',
    category: 'support',
    priority: 'optional',
    minAreaSqm: 10,
    requiredAssets: ['storage_shelving', 'storage_bin'],
  },
  executive_office: {
    id: 'executive_office',
    label: 'Executive Office',
    category: 'work',
    priority: 'optional',
    minAreaSqm: 20,
    requiredAssets: ['executive_desk', 'bookshelf', 'sofa', 'artwork', 'planter'],
  },
  training_room: {
    id: 'training_room',
    label: 'Training Room',
    category: 'meeting',
    priority: 'optional',
    areaPerOccupantSqm: 2,
    requiredAssets: ['training_table', 'training_chair', 'projector_screen', 'whiteboard'],
  },
};

export function getModule(id: ModuleId): Module {
  return MODULE_REGISTRY[id];
}

export function listModules(): Module[] {
  return Object.values(MODULE_REGISTRY);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test -- modules`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/workplace-design-system/src/modules.ts packages/workplace-design-system/tests/modules.test.ts
git commit -m "feat(workplace-design-system): add the 14 architectural module definitions"
```

---

### Task 3: `module-relations.ts` — the adjacency graph

**Files:**
- Create: `packages/workplace-design-system/src/module-relations.ts`
- Test: `packages/workplace-design-system/tests/module-relations.test.ts`

**Interfaces:**
- Consumes: `MODULE_IDS`, `ModuleId` from `../src/constants`.
- Produces: `moduleRelationSchema` (zod), `type ModuleRelation`, `MODULE_RELATIONS: Record<ModuleId, ModuleRelation>`, `getModuleRelations(id: ModuleId): ModuleRelation`, `listModuleRelations(): ModuleRelation[]`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/workplace-design-system/tests/module-relations.test.ts
import { describe, expect, it } from 'vitest';
import { MODULE_IDS } from '../src/constants';
import { moduleRelationSchema, MODULE_RELATIONS, getModuleRelations, listModuleRelations } from '../src/module-relations';

describe('module relations', () => {
  it('has a valid, schema-conformant entry for every module id', () => {
    for (const id of MODULE_IDS) {
      expect(() => moduleRelationSchema.parse(getModuleRelations(id))).not.toThrow();
    }
  });

  it('lists all 14 relation entries', () => {
    expect(listModuleRelations()).toHaveLength(MODULE_IDS.length);
  });

  it('never lists a module as adjacent or to-avoid to itself', () => {
    for (const relation of listModuleRelations()) {
      expect(relation.adjacentTo).not.toContain(relation.id);
      expect(relation.avoidAdjacentTo).not.toContain(relation.id);
    }
  });

  it('never lists the same neighbor in both adjacentTo and avoidAdjacentTo', () => {
    for (const relation of listModuleRelations()) {
      const overlap = relation.adjacentTo.filter((id) => relation.avoidAdjacentTo.includes(id));
      expect(overlap).toEqual([]);
    }
  });

  it('keeps server_room away from break_room, meeting_room, and cafeteria', () => {
    const serverRoom = getModuleRelations('server_room');
    expect(serverRoom.avoidAdjacentTo).toEqual(
      expect.arrayContaining(['break_room', 'meeting_room', 'cafeteria']),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test -- module-relations`
Expected: FAIL — `Cannot find module '../src/module-relations'`.

- [ ] **Step 3: Implement `src/module-relations.ts`**

```ts
import { z } from 'zod';
import { MODULE_IDS, type ModuleId } from './constants';

export const moduleRelationSchema = z.object({
  id: z.enum(MODULE_IDS),
  adjacentTo: z.array(z.enum(MODULE_IDS)),
  avoidAdjacentTo: z.array(z.enum(MODULE_IDS)),
});

export type ModuleRelation = z.infer<typeof moduleRelationSchema>;

export const MODULE_RELATIONS: Record<ModuleId, ModuleRelation> = {
  reception: { id: 'reception', adjacentTo: ['waiting_area'], avoidAdjacentTo: ['server_room', 'storage'] },
  waiting_area: { id: 'waiting_area', adjacentTo: ['reception', 'open_workspace'], avoidAdjacentTo: ['server_room'] },
  open_workspace: {
    id: 'open_workspace',
    adjacentTo: ['waiting_area', 'collaboration_area', 'meeting_room', 'print_area'],
    avoidAdjacentTo: ['server_room'],
  },
  private_office: { id: 'private_office', adjacentTo: ['open_workspace'], avoidAdjacentTo: ['cafeteria', 'break_room'] },
  meeting_room: {
    id: 'meeting_room',
    adjacentTo: ['open_workspace', 'collaboration_area'],
    avoidAdjacentTo: ['server_room', 'storage'],
  },
  phone_booth: { id: 'phone_booth', adjacentTo: ['open_workspace', 'collaboration_area'], avoidAdjacentTo: [] },
  collaboration_area: {
    id: 'collaboration_area',
    adjacentTo: ['open_workspace', 'meeting_room'],
    avoidAdjacentTo: ['server_room'],
  },
  cafeteria: {
    id: 'cafeteria',
    adjacentTo: ['break_room'],
    avoidAdjacentTo: ['server_room', 'private_office', 'executive_office'],
  },
  break_room: {
    id: 'break_room',
    adjacentTo: ['cafeteria', 'open_workspace'],
    avoidAdjacentTo: ['server_room', 'executive_office'],
  },
  print_area: { id: 'print_area', adjacentTo: ['open_workspace'], avoidAdjacentTo: ['cafeteria'] },
  server_room: {
    id: 'server_room',
    adjacentTo: ['storage'],
    avoidAdjacentTo: ['break_room', 'meeting_room', 'cafeteria', 'reception', 'waiting_area'],
  },
  storage: { id: 'storage', adjacentTo: ['server_room', 'print_area'], avoidAdjacentTo: ['reception', 'executive_office'] },
  executive_office: {
    id: 'executive_office',
    adjacentTo: ['private_office'],
    avoidAdjacentTo: ['server_room', 'storage', 'print_area', 'cafeteria'],
  },
  training_room: { id: 'training_room', adjacentTo: ['collaboration_area'], avoidAdjacentTo: ['server_room'] },
};

export function getModuleRelations(id: ModuleId): ModuleRelation {
  return MODULE_RELATIONS[id];
}

export function listModuleRelations(): ModuleRelation[] {
  return Object.values(MODULE_RELATIONS);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test -- module-relations`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/workplace-design-system/src/module-relations.ts packages/workplace-design-system/tests/module-relations.test.ts
git commit -m "feat(workplace-design-system): add the module adjacency graph"
```

---

### Task 4: `styles.ts` — the 6 corporate style typologies

**Files:**
- Create: `packages/workplace-design-system/src/styles.ts`
- Test: `packages/workplace-design-system/tests/styles.test.ts`

**Interfaces:**
- Consumes: `STYLE_IDS`, `StyleId`, `MATERIAL_IDS`, `SPACE_DENSITIES` from `../src/constants`.
- Produces: `styleSchema` (zod), `type Style`, `STYLE_REGISTRY: Record<StyleId, Style>`, `getStyle(id: StyleId): Style`, `listStyles(): Style[]`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/workplace-design-system/tests/styles.test.ts
import { describe, expect, it } from 'vitest';
import { STYLE_IDS } from '../src/constants';
import { styleSchema, getStyle, listStyles } from '../src/styles';

describe('styles', () => {
  it('has a valid, schema-conformant entry for every style id', () => {
    for (const id of STYLE_IDS) {
      expect(() => styleSchema.parse(getStyle(id))).not.toThrow();
    }
  });

  it('lists all 6 styles', () => {
    expect(listStyles()).toHaveLength(STYLE_IDS.length);
  });

  it('gives tech_startup a high space density and executive_premium a low one', () => {
    expect(getStyle('tech_startup').spaceDensity).toBe('high');
    expect(getStyle('executive_premium').spaceDensity).toBe('low');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test -- styles`
Expected: FAIL — `Cannot find module '../src/styles'`.

- [ ] **Step 3: Implement `src/styles.ts`**

```ts
import { z } from 'zod';
import { MATERIAL_IDS, SPACE_DENSITIES, STYLE_IDS, type StyleId } from './constants';

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

export type Style = z.infer<typeof styleSchema>;

export const STYLE_REGISTRY: Record<StyleId, Style> = {
  corporate_standard: {
    id: 'corporate_standard',
    label: 'Corporate Standard',
    description: 'The default professional office typology: neutral, reliable, low visual risk.',
    materialPalette: { floor: 'carpet', wall: 'gray_paint', furniture: 'black_metal', fabric: 'gray' },
    spaceDensity: 'medium',
    mood: ['professional', 'neutral', 'reliable'],
  },
  tech_startup: {
    id: 'tech_startup',
    label: 'Tech Startup',
    description: 'Open, casual, high-density tech company office with an energetic feel.',
    materialPalette: { floor: 'concrete', wall: 'white_paint', furniture: 'black_metal', fabric: 'green' },
    spaceDensity: 'high',
    mood: ['energetic', 'open', 'casual'],
  },
  executive_premium: {
    id: 'executive_premium',
    label: 'Executive Premium',
    description: 'Low-density, high-finish typology for leadership-heavy or client-facing offices.',
    materialPalette: { floor: 'wood', wall: 'wood_panels', furniture: 'walnut', fabric: 'black' },
    spaceDensity: 'low',
    mood: ['premium', 'quiet', 'refined'],
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean, uncluttered, bright typology with the fewest materials and the most negative space.',
    materialPalette: { floor: 'concrete', wall: 'white_paint', furniture: 'white_metal', fabric: 'gray' },
    spaceDensity: 'low',
    mood: ['clean', 'uncluttered', 'bright'],
  },
  scandinavian: {
    id: 'scandinavian',
    label: 'Scandinavian',
    description: 'Warm, natural-material typology with light woods and soft, muted accent colors.',
    materialPalette: { floor: 'wood', wall: 'white_paint', furniture: 'oak', fabric: 'green' },
    spaceDensity: 'medium',
    mood: ['warm', 'natural', 'light'],
  },
  creative_studio: {
    id: 'creative_studio',
    label: 'Creative Studio',
    description: 'High-density, expressive typology for design/creative teams that favors flexible collaboration space.',
    materialPalette: { floor: 'wood', wall: 'gray_paint', furniture: 'black_metal', fabric: 'blue' },
    spaceDensity: 'high',
    mood: ['playful', 'expressive', 'flexible'],
  },
};

export function getStyle(id: StyleId): Style {
  return STYLE_REGISTRY[id];
}

export function listStyles(): Style[] {
  return Object.values(STYLE_REGISTRY);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test -- styles`
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/workplace-design-system/src/styles.ts packages/workplace-design-system/tests/styles.test.ts
git commit -m "feat(workplace-design-system): add the 6 corporate style typologies"
```

---

### Task 5: `materials.ts` — the 16 materials + derived style compatibility

**Files:**
- Create: `packages/workplace-design-system/src/materials.ts`
- Test: `packages/workplace-design-system/tests/materials.test.ts`

**Interfaces:**
- Consumes: `MATERIAL_FAMILIES`, `MATERIAL_FINISHES`, `MATERIAL_IDS`, `MaterialId` from `../src/constants`; `listStyles` and `type StyleId` from `../src/styles` / `../src/constants`.
- Produces: `materialSchema` (zod), `type Material`, `MATERIAL_REGISTRY: Record<MaterialId, Material>`, `getMaterial(id: MaterialId): Material`, `listMaterials(): Material[]`, `getCompatibleStyles(materialId: MaterialId): StyleId[]`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/workplace-design-system/tests/materials.test.ts
import { describe, expect, it } from 'vitest';
import { MATERIAL_IDS } from '../src/constants';
import { materialSchema, getMaterial, listMaterials, getCompatibleStyles } from '../src/materials';
import { listStyles } from '../src/styles';

describe('materials', () => {
  it('has a valid, schema-conformant entry for every material id', () => {
    for (const id of MATERIAL_IDS) {
      expect(() => materialSchema.parse(getMaterial(id))).not.toThrow();
    }
  });

  it('lists all 16 materials', () => {
    expect(listMaterials()).toHaveLength(MATERIAL_IDS.length);
  });

  it('derives style compatibility from every style palette, with no drift', () => {
    for (const style of listStyles()) {
      for (const materialId of Object.values(style.materialPalette)) {
        expect(getCompatibleStyles(materialId)).toContain(style.id);
      }
    }
  });

  it('returns an empty list for a material no style palette references', () => {
    // stone is not used in any of the 6 v1 style palettes
    expect(getCompatibleStyles('stone')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test -- materials`
Expected: FAIL — `Cannot find module '../src/materials'`.

- [ ] **Step 3: Implement `src/materials.ts`**

```ts
import { z } from 'zod';
import { MATERIAL_FAMILIES, MATERIAL_FINISHES, MATERIAL_IDS, type MaterialId, type StyleId } from './constants';
import { listStyles } from './styles';

export const materialSchema = z.object({
  id: z.enum(MATERIAL_IDS),
  label: z.string(),
  family: z.enum(MATERIAL_FAMILIES),
  baseColorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  finish: z.enum(MATERIAL_FINISHES),
});

export type Material = z.infer<typeof materialSchema>;

export const MATERIAL_REGISTRY: Record<MaterialId, Material> = {
  concrete: { id: 'concrete', label: 'Concrete', family: 'floor', baseColorHex: '#B7B8B6', finish: 'textured' },
  wood: { id: 'wood', label: 'Wood', family: 'floor', baseColorHex: '#A9754F', finish: 'matte' },
  carpet: { id: 'carpet', label: 'Carpet', family: 'floor', baseColorHex: '#5B6470', finish: 'textured' },
  stone: { id: 'stone', label: 'Stone', family: 'floor', baseColorHex: '#8C8A85', finish: 'matte' },
  white_paint: { id: 'white_paint', label: 'White Paint', family: 'wall', baseColorHex: '#F5F4F0', finish: 'matte' },
  gray_paint: { id: 'gray_paint', label: 'Gray Paint', family: 'wall', baseColorHex: '#9CA0A6', finish: 'matte' },
  wood_panels: { id: 'wood_panels', label: 'Wood Panels', family: 'wall', baseColorHex: '#8A5A34', finish: 'matte' },
  glass: { id: 'glass', label: 'Glass', family: 'wall', baseColorHex: '#CFE8F0', finish: 'glossy' },
  oak: { id: 'oak', label: 'Oak', family: 'furniture', baseColorHex: '#C69A63', finish: 'matte' },
  walnut: { id: 'walnut', label: 'Walnut', family: 'furniture', baseColorHex: '#5B3A29', finish: 'matte' },
  black_metal: { id: 'black_metal', label: 'Black Metal', family: 'furniture', baseColorHex: '#232323', finish: 'matte' },
  white_metal: { id: 'white_metal', label: 'White Metal', family: 'furniture', baseColorHex: '#E7E7E4', finish: 'matte' },
  gray: { id: 'gray', label: 'Gray', family: 'fabric', baseColorHex: '#8D8F92', finish: 'textured' },
  blue: { id: 'blue', label: 'Blue', family: 'fabric', baseColorHex: '#3A5A78', finish: 'textured' },
  green: { id: 'green', label: 'Green', family: 'fabric', baseColorHex: '#4C6B54', finish: 'textured' },
  black: { id: 'black', label: 'Black', family: 'fabric', baseColorHex: '#1D1D1D', finish: 'textured' },
};

export function getMaterial(id: MaterialId): Material {
  return MATERIAL_REGISTRY[id];
}

export function listMaterials(): Material[] {
  return Object.values(MATERIAL_REGISTRY);
}

export function getCompatibleStyles(materialId: MaterialId): StyleId[] {
  return listStyles()
    .filter((style) => Object.values(style.materialPalette).includes(materialId))
    .map((style) => style.id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test -- materials`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/workplace-design-system/src/materials.ts packages/workplace-design-system/tests/materials.test.ts
git commit -m "feat(workplace-design-system): add the 16 materials and derived style compatibility"
```

---

### Task 6: `spatial-rules.ts` — grouped dimensional heuristics

**Files:**
- Create: `packages/workplace-design-system/src/spatial-rules.ts`
- Test: `packages/workplace-design-system/tests/spatial-rules.test.ts`

**Interfaces:**
- Consumes: nothing from sibling files (no `ModuleId`/`MaterialId`/`StyleId` needed).
- Produces: `spatialRulesSchema` (zod), `type SpatialRules`, `SPATIAL_RULES: SpatialRules`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/workplace-design-system/tests/spatial-rules.test.ts
import { describe, expect, it } from 'vitest';
import { spatialRulesSchema, SPATIAL_RULES } from '../src/spatial-rules';

describe('spatial rules', () => {
  it('is schema-conformant', () => {
    expect(() => spatialRulesSchema.parse(SPATIAL_RULES)).not.toThrow();
  });

  it('has strictly increasing meeting room tiers by area', () => {
    const { small, medium, large } = SPATIAL_RULES.meeting;
    expect(small.minAreaSqm).toBeLessThan(medium.minAreaSqm);
    expect(medium.minAreaSqm).toBeLessThan(large.minAreaSqm);
  });

  it('has all six rule groups', () => {
    expect(Object.keys(SPATIAL_RULES).sort()).toEqual(
      ['accessibility', 'circulation', 'furniture', 'meeting', 'planning', 'safety'].sort(),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test -- spatial-rules`
Expected: FAIL — `Cannot find module '../src/spatial-rules'`.

- [ ] **Step 3: Implement `src/spatial-rules.ts`**

```ts
import { z } from 'zod';

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

export type SpatialRules = z.infer<typeof spatialRulesSchema>;

export const SPATIAL_RULES: SpatialRules = {
  circulation: {
    mainCorridorWidthM: 1.5,
    secondaryCorridorWidthM: 1.0,
    minTurningRadiusM: 1.5,
  },
  furniture: {
    deskSeparationM: 1.2,
    chairClearanceM: 0.75,
    monitorDistanceM: 0.6,
  },
  meeting: {
    small: { capacity: '2-4', minAreaSqm: 8 },
    medium: { capacity: '5-8', minAreaSqm: 16 },
    large: { capacity: '9-16', minAreaSqm: 30 },
  },
  accessibility: {
    minDoorWidthM: 0.9,
    wheelchairTurningRadiusM: 1.5,
    accessibleDeskClearanceM: 1.5,
  },
  safety: {
    minEmergencyExitWidthM: 1.1,
    maxDistanceToExitM: 30,
    minFireExtinguisherSpacingM: 25,
  },
  planning: {
    maxPeoplePerOpenWorkspace: 60,
    peoplePerMeetingRoom: 12,
    peoplePerExecutiveOffice: 25,
    peoplePerPhoneBooth: 15,
    peoplePerBreakRoom: 30,
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test -- spatial-rules`
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/workplace-design-system/src/spatial-rules.ts packages/workplace-design-system/tests/spatial-rules.test.ts
git commit -m "feat(workplace-design-system): add grouped spatial and planning rules"
```

---

### Task 7: `planning-presets.ts` — headcount tiers

**Files:**
- Create: `packages/workplace-design-system/src/planning-presets.ts`
- Test: `packages/workplace-design-system/tests/planning-presets.test.ts`

**Interfaces:**
- Consumes: `MODULE_IDS`, `STYLE_IDS` from `../src/constants`.
- Produces: `planningPresetSchema` (zod), `type PlanningPreset`, `PLANNING_PRESETS: PlanningPreset[]`, `getPlanningPreset(id: string): PlanningPreset | undefined`, `listPlanningPresets(): PlanningPreset[]`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/workplace-design-system/tests/planning-presets.test.ts
import { describe, expect, it } from 'vitest';
import { planningPresetSchema, PLANNING_PRESETS, getPlanningPreset, listPlanningPresets } from '../src/planning-presets';

describe('planning presets', () => {
  it('is schema-conformant for every preset', () => {
    for (const preset of PLANNING_PRESETS) {
      expect(() => planningPresetSchema.parse(preset)).not.toThrow();
    }
  });

  it('has exactly 4 presets: small_office, medium_office, large_office, enterprise', () => {
    expect(listPlanningPresets().map((preset) => preset.id).sort()).toEqual(
      ['enterprise', 'large_office', 'medium_office', 'small_office'].sort(),
    );
  });

  it('covers headcount 1 to infinity with no gaps or overlaps', () => {
    const sorted = [...PLANNING_PRESETS].sort((a, b) => a.minOccupants - b.minOccupants);
    expect(sorted[0].minOccupants).toBe(1);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].minOccupants).toBe((sorted[i - 1].maxOccupants ?? Infinity) + 1);
    }
    expect(sorted[sorted.length - 1].maxOccupants).toBeNull();
  });

  it('finds a preset by id', () => {
    expect(getPlanningPreset('small_office')?.label).toBe('Small Office');
    expect(getPlanningPreset('does_not_exist')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test -- planning-presets`
Expected: FAIL — `Cannot find module '../src/planning-presets'`.

- [ ] **Step 3: Implement `src/planning-presets.ts`**

```ts
import { z } from 'zod';
import { MODULE_IDS, STYLE_IDS } from './constants';

export const planningPresetSchema = z.object({
  id: z.string(),
  label: z.string(),
  minOccupants: z.number(),
  maxOccupants: z.number().nullable(),
  recommendedModules: z.array(z.enum(MODULE_IDS)),
  targetStyle: z.enum(STYLE_IDS).optional(),
});

export type PlanningPreset = z.infer<typeof planningPresetSchema>;

export const PLANNING_PRESETS: PlanningPreset[] = [
  {
    id: 'small_office',
    label: 'Small Office',
    minOccupants: 1,
    maxOccupants: 10,
    recommendedModules: ['reception', 'waiting_area', 'open_workspace', 'meeting_room', 'break_room'],
    targetStyle: 'tech_startup',
  },
  {
    id: 'medium_office',
    label: 'Medium Office',
    minOccupants: 11,
    maxOccupants: 40,
    recommendedModules: [
      'reception',
      'waiting_area',
      'open_workspace',
      'meeting_room',
      'break_room',
      'phone_booth',
      'print_area',
      'private_office',
    ],
    targetStyle: 'corporate_standard',
  },
  {
    id: 'large_office',
    label: 'Large Office',
    minOccupants: 41,
    maxOccupants: 120,
    recommendedModules: [
      'reception',
      'waiting_area',
      'open_workspace',
      'meeting_room',
      'break_room',
      'phone_booth',
      'print_area',
      'private_office',
      'collaboration_area',
      'cafeteria',
      'server_room',
      'storage',
    ],
    targetStyle: 'corporate_standard',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    minOccupants: 121,
    maxOccupants: null,
    recommendedModules: [
      'reception',
      'waiting_area',
      'open_workspace',
      'meeting_room',
      'break_room',
      'phone_booth',
      'print_area',
      'private_office',
      'collaboration_area',
      'cafeteria',
      'server_room',
      'storage',
      'executive_office',
      'training_room',
    ],
    targetStyle: 'executive_premium',
  },
];

export function getPlanningPreset(id: string): PlanningPreset | undefined {
  return PLANNING_PRESETS.find((preset) => preset.id === id);
}

export function listPlanningPresets(): PlanningPreset[] {
  return PLANNING_PRESETS;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test -- planning-presets`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/workplace-design-system/src/planning-presets.ts packages/workplace-design-system/tests/planning-presets.test.ts
git commit -m "feat(workplace-design-system): add headcount planning presets"
```

---

### Task 8: `index.ts` — public barrel export

**Files:**
- Create: `packages/workplace-design-system/src/index.ts`
- Test: `packages/workplace-design-system/tests/index.test.ts`

**Interfaces:**
- Consumes: every export from `constants.ts`, `modules.ts`, `module-relations.ts`, `styles.ts`, `materials.ts`, `spatial-rules.ts`, `planning-presets.ts`.
- Produces: the package's full public API, importable as `@command-center/workplace-design-system` by future consumers (the Scene Planner).

- [ ] **Step 1: Write the failing test**

```ts
// packages/workplace-design-system/tests/index.test.ts
import { describe, expect, it } from 'vitest';
import {
  MODULE_IDS,
  getModule,
  listModules,
  getModuleRelations,
  listModuleRelations,
  getStyle,
  listStyles,
  getMaterial,
  listMaterials,
  getCompatibleStyles,
  SPATIAL_RULES,
  getPlanningPreset,
  listPlanningPresets,
} from '../src/index';

describe('public API', () => {
  it('exposes every registry accessor through the barrel', () => {
    expect(listModules()).toHaveLength(MODULE_IDS.length);
    expect(getModule('reception').label).toBe('Reception');
    expect(getModuleRelations('reception').adjacentTo).toContain('waiting_area');
    expect(listModuleRelations().length).toBeGreaterThan(0);
    expect(getStyle('minimal').spaceDensity).toBe('low');
    expect(listStyles().length).toBe(6);
    expect(getMaterial('oak').family).toBe('furniture');
    expect(listMaterials().length).toBe(16);
    expect(getCompatibleStyles('walnut')).toContain('executive_premium');
    expect(SPATIAL_RULES.circulation.mainCorridorWidthM).toBe(1.5);
    expect(getPlanningPreset('enterprise')?.maxOccupants).toBeNull();
    expect(listPlanningPresets().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @command-center/workplace-design-system test -- index`
Expected: FAIL — `Cannot find module '../src/index'`.

- [ ] **Step 3: Implement `src/index.ts`**

```ts
export {
  MODULE_IDS,
  MODULE_CATEGORIES,
  MODULE_PRIORITIES,
  MATERIAL_FAMILIES,
  MATERIAL_IDS,
  MATERIAL_FINISHES,
  STYLE_IDS,
  SPACE_DENSITIES,
} from './constants';
export type {
  ModuleId,
  ModuleCategory,
  ModulePriority,
  MaterialFamily,
  MaterialId,
  MaterialFinish,
  StyleId,
  SpaceDensity,
} from './constants';

export { moduleSchema, MODULE_REGISTRY, getModule, listModules } from './modules';
export type { Module } from './modules';

export { moduleRelationSchema, MODULE_RELATIONS, getModuleRelations, listModuleRelations } from './module-relations';
export type { ModuleRelation } from './module-relations';

export { styleSchema, STYLE_REGISTRY, getStyle, listStyles } from './styles';
export type { Style } from './styles';

export { materialSchema, MATERIAL_REGISTRY, getMaterial, listMaterials, getCompatibleStyles } from './materials';
export type { Material } from './materials';

export { spatialRulesSchema, SPATIAL_RULES } from './spatial-rules';
export type { SpatialRules } from './spatial-rules';

export { planningPresetSchema, PLANNING_PRESETS, getPlanningPreset, listPlanningPresets } from './planning-presets';
export type { PlanningPreset } from './planning-presets';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @command-center/workplace-design-system test -- index`
Expected: PASS — 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add packages/workplace-design-system/src/index.ts packages/workplace-design-system/tests/index.test.ts
git commit -m "feat(workplace-design-system): add public barrel export"
```

---

### Task 9: `docs/vision/WORKPLACE_DESIGN_SYSTEM.md` — human-readable companion doc

**Files:**
- Create: `docs/vision/WORKPLACE_DESIGN_SYSTEM.md`

**Interfaces:**
- Consumes: nothing (pure documentation, mirrors the data in Tasks 1-7 for human/LLM-prompt reading).
- Produces: the doc referenced by `CHANGELOG.md` in Task 10 and by future Scene Planner prompt work.

- [ ] **Step 1: Write the doc**

```markdown
# WORKPLACE DESIGN SYSTEM

> Knowledge base for corporate office scene generation. v1 covers corporate/tech office typologies.

---

# Status

Approved

Version

1.0

Owner

Daniel Cantor

---

# Purpose

Este documento describe el conocimiento arquitectónico y funcional de los espacios de oficina corporativa que Command Center puede generar: qué módulos existen, cómo se relacionan entre sí, qué materiales y estilos están disponibles, y qué reglas espaciales aproximadas rigen su distribución.

> Este documento (y el paquete `@command-center/workplace-design-system` que lo codifica) contiene únicamente conocimiento de dominio. No implementa algoritmos de planificación, generación de escenas, renderizado ni integración con IA. Todas las funciones expuestas son deterministas, de solo lectura y derivadas de los registros declarativos.

Es la base de conocimiento que usará el futuro Scene Planner para convertir un requisito de negocio ("oficina para 60 personas") en una distribución espacial con sentido arquitectónico.

---

# Módulos arquitectónicos

14 módulos, agrupados en 5 categorías. `reception`, `waiting_area`, `open_workspace` y `meeting_room` son los únicos **requeridos** — la oficina mínima viable. El resto son **opcionales**, incluidos según tamaño/tipo de empresa.

| Módulo | Categoría | Prioridad | Área |
|---|---|---|---|
| Reception | arrival | required | 20 m² |
| Waiting Area | arrival | required | 15 m² |
| Open Workspace | work | required | 6 m²/persona |
| Private Office | work | optional | 10 m² |
| Meeting Room | meeting | required | 8 m² (mínimo; ver tiers en Reglas Espaciales) |
| Phone Booth | meeting | optional | 2 m² |
| Collaboration Area | work | optional | 20 m² |
| Cafeteria | amenity | optional | 1.8 m²/persona |
| Break Room | amenity | optional | 15 m² |
| Print Area | support | optional | 6 m² |
| Server Room | support | optional | 10 m² |
| Storage | support | optional | 10 m² |
| Executive Office | work | optional | 20 m² |
| Training Room | meeting | optional | 2 m²/persona |

---

# Relaciones entre módulos

El grafo de adyacencia evita que el Planner coloque módulos incompatibles uno junto al otro (ej. nunca Reception junto a Server Room).

| Módulo | Adyacente a | Evitar junto a |
|---|---|---|
| Reception | Waiting Area | Server Room, Storage |
| Waiting Area | Reception, Open Workspace | Server Room |
| Open Workspace | Waiting Area, Collaboration Area, Meeting Room, Print Area | Server Room |
| Private Office | Open Workspace | Cafeteria, Break Room |
| Meeting Room | Open Workspace, Collaboration Area | Server Room, Storage |
| Phone Booth | Open Workspace, Collaboration Area | — |
| Collaboration Area | Open Workspace, Meeting Room | Server Room |
| Cafeteria | Break Room | Server Room, Private Office, Executive Office |
| Break Room | Cafeteria, Open Workspace | Server Room, Executive Office |
| Print Area | Open Workspace | Cafeteria |
| Server Room | Storage | Break Room, Meeting Room, Cafeteria, Reception, Waiting Area |
| Storage | Server Room, Print Area | Reception, Executive Office |
| Executive Office | Private Office | Server Room, Storage, Print Area, Cafeteria |
| Training Room | Collaboration Area | Server Room |

---

# Materiales

4 familias, 4 opciones cada una — pocas, bien elegidas, no 200 texturas.

| Familia | Opciones |
|---|---|
| Floor | Concrete, Wood, Carpet, Stone |
| Walls | White Paint, Gray Paint, Wood Panels, Glass |
| Furniture | Oak, Walnut, Black Metal, White Metal |
| Fabric | Gray, Blue, Green, Black |

La compatibilidad estilo↔material se deriva de la paleta de cada estilo (ver abajo) — no es una lista mantenida a mano, así que nunca queda desincronizada.

---

# Estilos (v1: tipologías corporativas/tech)

No son solo estéticos — cada uno implica una densidad espacial distinta, que cambia por completo la distribución del layout.

| Estilo | Paleta (floor/wall/furniture/fabric) | Densidad | Mood |
|---|---|---|---|
| Corporate Standard | Carpet / Gray Paint / Black Metal / Gray | medium | professional, neutral, reliable |
| Tech Startup | Concrete / White Paint / Black Metal / Green | high | energetic, open, casual |
| Executive Premium | Wood / Wood Panels / Walnut / Black | low | premium, quiet, refined |
| Minimal | Concrete / White Paint / White Metal / Gray | low | clean, uncluttered, bright |
| Scandinavian | Wood / White Paint / Oak / Green | medium | warm, natural, light |
| Creative Studio | Wood / Gray Paint / Black Metal / Blue | high | playful, expressive, flexible |

Tipologías adicionales (banca/legal/logística/hospitality) quedan para v2.

---

# Reglas espaciales

> Estos valores son heurísticos de diseño corporativo y no sustituyen normativa técnica ni regulaciones locales (código de construcción, accesibilidad, seguridad contra incendios). Sirven para que el Planner genere escenas con sentido espacial, no para certificar un espacio real.

**Circulation** — pasillo principal 1.5 m, pasillo secundario 1.0 m, radio de giro mínimo 1.5 m.

**Furniture** — separación entre escritorios 1.2 m, espacio libre de silla 0.75 m, distancia al monitor 0.6 m.

**Meeting** — chica: 2-4 personas / 8 m². mediana: 5-8 personas / 16 m². grande: 9-16 personas / 30 m².

**Accessibility** — ancho mínimo de puerta 0.9 m, radio de giro silla de ruedas 1.5 m, espacio libre de escritorio accesible 1.5 m.

**Safety** — ancho mínimo salida de emergencia 1.1 m, distancia máxima a salida 30 m, separación mínima entre extintores 25 m.

**Planning** — las reglas que el Planner consultará constantemente en lugar de tener lógica hardcodeada: máximo 60 personas por Open Workspace antes de dividir, 1 Meeting Room cada 12 personas, 1 Executive Office cada 25 personas, 1 Phone Booth cada 15 personas, 1 Break Room cada 30 personas.

---

# Presets de planificación

Cuatro tramos por cantidad de personas, cada uno con un set base de módulos recomendados y un estilo sugerido (no vinculante) — el Planner consulta el preset en vez de calcular todo desde cero.

| Preset | Personas | Módulos recomendados | Estilo sugerido |
|---|---|---|---|
| Small Office | 1–10 | Reception, Waiting Area, Open Workspace, Meeting Room, Break Room | Tech Startup |
| Medium Office | 11–40 | + Phone Booth, Print Area, Private Office | Corporate Standard |
| Large Office | 41–120 | + Collaboration Area, Cafeteria, Server Room, Storage | Corporate Standard |
| Enterprise | 121+ | + Executive Office, Training Room | Executive Premium |

---

# Arquitectura del sistema

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

La dependencia es de una sola dirección: nada aguas arriba del Workplace Design System importa de lo que está aguas abajo.

---

Owner

Command Center

Maintainer

Daniel Cantor
```

- [ ] **Step 2: Commit**

```bash
git add docs/vision/WORKPLACE_DESIGN_SYSTEM.md
git commit -m "docs: add WORKPLACE_DESIGN_SYSTEM.md human-readable companion doc"
```

---

### Task 10: CHANGELOG entry + full monorepo verification

**Files:**
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: nothing new — this task verifies everything Tasks 1-9 produced works together at the monorepo level.

- [ ] **Step 1: Add the CHANGELOG entry**

In `CHANGELOG.md`, under `## [Unreleased]` → `### Added`, add:

```markdown
### Added

- `@command-center/workplace-design-system`: paquete de conocimiento de dominio para oficinas corporativas (14 módulos arquitectónicos, grafo de adyacencia, 16 materiales, 6 estilos, reglas espaciales agrupadas, presets de planificación por headcount). No implementa lógica de generación ni renderizado — ver `docs/vision/WORKPLACE_DESIGN_SYSTEM.md` y el spec en `docs/superpowers/specs/2026-07-14-workplace-design-system-design.md`.
```

- [ ] **Step 2: Run the full test suite for the new package**

Run: `pnpm --filter @command-center/workplace-design-system test`
Expected: PASS — all test files (constants, modules, module-relations, styles, materials, spatial-rules, planning-presets, index) pass, 0 failures.

- [ ] **Step 3: Run lint for the new package**

Run: `pnpm --filter @command-center/workplace-design-system lint`
Expected: PASS — 0 errors, 0 warnings.

- [ ] **Step 4: Run build (type-check) for the new package**

Run: `pnpm --filter @command-center/workplace-design-system build`
Expected: PASS — `tsc --noEmit` exits 0.

- [ ] **Step 5: Run the full monorepo build/lint/test via turbo to confirm nothing else broke**

Run: `pnpm turbo run build lint test`
Expected: all tasks succeed across all packages, including the newly-added `@command-center/workplace-design-system` (turbo picks it up automatically via the `packages/*` glob in `pnpm-workspace.yaml` — no manual registration needed).

- [ ] **Step 6: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: log workplace-design-system package in CHANGELOG"
```

- [ ] **Step 7: Push**

Run: `git push`
Expected: branch `sprint-0.4-application-shell` updated on `origin`, PR #2 picks up the new commits automatically.
