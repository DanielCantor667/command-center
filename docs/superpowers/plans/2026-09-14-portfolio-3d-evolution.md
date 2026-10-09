# Portfolio 3D Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el portafolio público en una experiencia 3D más dominante, clara y verificable, empezando por el primer viewport y avanzando por fases aprobadas.

**Architecture:** `ExperienceModule` mantiene navegación y estado público; la escena R3F se conserva como pieza central con modos de cámara más claros. Los datos siguen en `apps/web/data`, la UI accesible sigue en HTML/CSS Modules y el canvas consume relaciones ya validadas.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS Modules, React Three Fiber 9, drei 10, Three.js 0.171, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-portfolio-3d-evolution-design.md`

## Global Constraints

- No avanzar de fase sin aprobación explícita de Daniel.
- No desplegar, provisionar servicios ni publicar datos privados.
- No inventar métricas, porcentajes, seniority ni datos de negocio.
- No usar emoji literal en UI, `alert()` ni `<select>` nativo.
- Usar patrones existentes de `apps/web/modules/experience` y `apps/web/data`.
- Verificar con navegador real antes de decir que funciona.
- Antes de probar en navegador, matar cualquier `next dev` viejo en puerto 3000.
- Mantener funcionalidad completa sin WebGL y a 320 px.

---

## File Structure

- Modify: `apps/web/modules/experience/component.tsx`
  - Orquesta secciones, selección de proyecto, selección de tecnología y nuevo layout.
- Modify: `apps/web/modules/experience/experience.module.css`
  - Rediseña hero, stage, paneles, responsive y estados accesibles.
- Modify: `apps/web/modules/experience/components/city-navigator.tsx`
  - Ajusta cámara, modo overview/project/technologies y presencia de biblioteca central.
- Modify: `apps/web/modules/experience/components/city-navigator-loader.tsx`
  - Refina poster, fallback, activación mobile y mensajes.
- Modify: `apps/web/modules/experience/components/workshop-table.tsx`
  - Refuerza mesa, biblioteca central y detalles de taller reutilizables.
- Modify: `apps/web/modules/experience/components/technology-explorer.tsx`
  - Conecta mejor selección técnica con escena y proyectos.
- Modify: `apps/web/modules/experience/components/technology-explorer.module.css`
  - Pulido visual del explorador para que no parezca panel separado.
- Modify: `apps/web/modules/experience/tests/experience.test.tsx`
  - Pruebas de navegación pública, selección y fallback textual.
- Modify: `apps/web/modules/experience/tests/technology-explorer.test.tsx`
  - Pruebas de búsqueda, selección y proyectos relacionados.
- Create: `docs/product/portfolio-3d-evolution-validation.md`
  - Registro de verificación con comandos, screenshots revisados y límites.

---

## Task 1: Fase 1.1 Hero 3D dominante

**Files:**
- Modify: `apps/web/modules/experience/component.tsx`
- Modify: `apps/web/modules/experience/experience.module.css`
- Test: `apps/web/modules/experience/tests/experience.test.tsx`

**Interfaces:**
- Consumes: `PROJECTS`, `PUBLIC_PROFILE`, `PORTFOLIO_TECHNOLOGIES`, `CityNavigatorLoader`.
- Produces: primera pantalla con `section === 'projects'`, proyecto seleccionado y acciones "Explorar proyectos" / "Ver tecnologías".

- [ ] **Step 1: Write failing tests for hero navigation**

```tsx
it('renders the 3D-first public hero with project and technology actions', () => {
  const onEnter = vi.fn();
  render(<ExperienceModule onEnter={onEnter} />);
  expect(screen.getByRole('heading', { name: /productos reales/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /explorar tecnologías/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/portafolio de proyectos/i)).toBeInTheDocument();
});

it('moves from the hero into technology mode without losing the selected project list', async () => {
  render(<ExperienceModule onEnter={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: /explorar tecnologías/i }));
  expect(screen.getByText(/biblioteca técnica/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /volver a proyectos/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npx pnpm --filter @command-center/web vitest run apps/web/modules/experience/tests/experience.test.tsx`

Expected: FAIL because the requested heading/action copy and mode labels are not present yet.

- [ ] **Step 3: Update `ExperienceModule` hero copy and actions**

Implement:

```tsx
<h1>
  Productos reales
  <br />
  en 3D.
</h1>
<p>
  Un taller navegable donde cada proyecto muestra producto, arquitectura y decisiones de ejecución.
</p>
<div className={styles.heroActions}>
  <button type="button" onClick={() => navigate('projects')}>Explorar proyectos</button>
  <button type="button" onClick={() => navigate('technologies')}>Explorar tecnologías</button>
</div>
```

Keep existing project list and `CityNavigatorLoader` wiring. Do not remove case links.

- [ ] **Step 4: Update CSS for first viewport**

In `experience.module.css`, make `.workbench` feel like a full first viewport:

```css
.workbench {
  min-height: calc(100svh - 132px);
  display: grid;
  grid-template-columns: minmax(260px, 0.34fr) minmax(0, 1fr);
  align-items: stretch;
}
.cityStage {
  height: clamp(560px, 58vw, 760px);
  border-radius: 8px;
}
.heroActions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}
```

Adjust exact selectors to match the current file and keep mobile stacking under existing media queries.

- [ ] **Step 5: Run unit tests**

Run: `npx pnpm --filter @command-center/web vitest run apps/web/modules/experience/tests/experience.test.tsx`

Expected: PASS.

- [ ] **Step 6: Browser verification**

Run local server after killing old port 3000:

```bash
lsof -ti :3000 | xargs -r kill
npx pnpm --filter @command-center/web dev
```

Verify with Playwright at 1440, 390 and 320 px:

- home first viewport visible;
- no horizontal overflow;
- "Explorar tecnologías" changes mode;
- project selection still updates preview;
- canvas is not blank when WebGL is available.

- [ ] **Step 7: Commit checkpoint only if requested**

Do not commit unless Daniel asks. If requested:

```bash
git add apps/web/modules/experience/component.tsx apps/web/modules/experience/experience.module.css apps/web/modules/experience/tests/experience.test.tsx
git commit -m "feat: strengthen 3d portfolio hero"
```

---

## Task 2: Fase 1.2 Project district detail

**Files:**
- Modify: `apps/web/modules/experience/component.tsx`
- Modify: `apps/web/modules/experience/components/city-navigator.tsx`
- Modify: `apps/web/modules/experience/components/workshop-table.tsx`
- Modify: `apps/web/modules/experience/experience.module.css`
- Test: `apps/web/modules/experience/tests/experience.test.tsx`

**Interfaces:**
- Consumes: selected project id and existing `detail` state.
- Produces: visible project-detail mode with copy, stack chips, capture and camera focus.

- [ ] **Step 1: Write failing test for project detail mode**

```tsx
it('opens a project district detail with architecture and real capture access', async () => {
  render(<ExperienceModule onEnter={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: /acercar distrito/i }));
  expect(screen.getByText(/arquitectura del producto/i)).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /vista real/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused test and confirm failure**

Run: `npx pnpm --filter @command-center/web vitest run apps/web/modules/experience/tests/experience.test.tsx`

Expected: FAIL because the detail copy is not present.

- [ ] **Step 3: Add project-detail content block**

Add a compact architecture summary near `.previewContent`:

```tsx
{detail && (
  <div className={styles.architectureBrief}>
    <h4>Arquitectura del producto</h4>
    <p>{selected.name} se presenta como un distrito con módulos de interfaz, datos, operación e integraciones.</p>
  </div>
)}
```

Keep copy generic unless the selected project has verified project-specific data.

- [ ] **Step 4: Tune camera destination**

In `city-navigator.tsx`, keep `detail` camera but make it more dramatic:

```ts
if (detail) {
  return {
    target: new Vector3(p[0], 0.85, p[2]),
    position: new Vector3(p[0] + 3.2, 4.8, p[2] + 5.8),
    zoom: 2.35,
  };
}
```

Respect reduced motion by keeping the existing instant step.

- [ ] **Step 5: Add CSS for detail panel**

```css
.architectureBrief {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.architectureBrief h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
```

- [ ] **Step 6: Run tests and browser**

Run:

```bash
npx pnpm --filter @command-center/web vitest run apps/web/modules/experience/tests/experience.test.tsx
```

Browser verify:

- click "Acercar distrito";
- camera focuses selected project;
- detail text appears;
- "Alejar distrito" returns to overview.

---

## Task 3: Fase 1.3 Technology library upgrade

**Files:**
- Modify: `apps/web/modules/experience/components/technology-explorer.tsx`
- Modify: `apps/web/modules/experience/components/technology-explorer.module.css`
- Modify: `apps/web/modules/experience/components/workshop-table.tsx`
- Test: `apps/web/modules/experience/tests/technology-explorer.test.tsx`

**Interfaces:**
- Consumes: `PORTFOLIO_TECHNOLOGIES`, `selectedTechnologyId`, `highlightedProjectIds`.
- Produces: visual library language and stronger selected technology detail.

- [ ] **Step 1: Write failing tests for selected technology detail**

```tsx
it('shows selected technology usage and related projects', async () => {
  const onProjectSelect = vi.fn();
  render(
    <TechnologyExplorer
      selectedId="nextjs"
      onSelect={vi.fn()}
      onProjectSelect={onProjectSelect}
    />,
  );
  expect(screen.getByRole('heading', { name: /next\.js/i })).toBeInTheDocument();
  expect(screen.getByText(/proyectos relacionados/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused test and confirm failure or current coverage gap**

Run: `npx pnpm --filter @command-center/web vitest run apps/web/modules/experience/tests/technology-explorer.test.tsx`

Expected: FAIL if the explicit related-project heading is missing, PASS if already covered. If PASS, keep test as regression coverage.

- [ ] **Step 3: Rename UI copy to "Biblioteca técnica"**

Use sentence-case labels:

```tsx
<h2>Biblioteca técnica</h2>
<p>Selecciona una tecnología para ver dónde aparece y qué resuelve.</p>
```

- [ ] **Step 4: Strengthen selected detail**

Show related project buttons with existing names and `onProjectSelect(project.id)`. Do not invent descriptions.

- [ ] **Step 5: Style the explorer as part of the 3D workbench**

Use existing palette variables and avoid nested cards:

```css
.explorer {
  display: grid;
  grid-template-columns: minmax(220px, 0.34fr) minmax(0, 1fr);
  gap: 24px;
}
.technologyDetail {
  border-left: 1px solid var(--line);
  padding-left: 24px;
}
```

- [ ] **Step 6: Verify relation with scene**

Browser verify:

- open Tecnologías;
- select `Three.js`;
- project list highlights related projects;
- clicking a related project enters its case.

---

## Task 4: Fase 1.4 Journey and contact polish

**Files:**
- Modify: `apps/web/modules/experience/component.tsx`
- Modify: `apps/web/modules/experience/experience.module.css`
- Test: `apps/web/modules/experience/tests/experience.test.tsx`

**Interfaces:**
- Consumes: `PORTFOLIO_CAREER`, `PUBLIC_PROFILE`.
- Produces: trajectory section that reads as part of the workshop.

- [ ] **Step 1: Write failing test for trajectory content**

```tsx
it('renders trajectory with experience, education and languages', () => {
  render(<ExperienceModule onEnter={vi.fn()} />);
  expect(screen.getByRole('heading', { name: /trayectoria/i })).toBeInTheDocument();
  expect(screen.getByText(/experiencia/i)).toBeInTheDocument();
  expect(screen.getByText(/formación/i)).toBeInTheDocument();
  expect(screen.getByText(/idiomas/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused test**

Run: `npx pnpm --filter @command-center/web vitest run apps/web/modules/experience/tests/experience.test.tsx`

Expected: FAIL if current heading copy differs. Adjust test to exact approved copy after implementation.

- [ ] **Step 3: Add route-like visual hierarchy**

Keep content from `PORTFOLIO_CAREER`; change wrapper labels to:

```tsx
<p className={styles.eyebrow}>Ruta de construcción</p>
<h2>Trayectoria</h2>
```

- [ ] **Step 4: CSS for spatial timeline**

Use CSS lines and nodes, not a new canvas:

```css
.career article {
  position: relative;
  padding-left: 24px;
}
.career article::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--portfolio-accent);
}
```

- [ ] **Step 5: Verify mobile**

Browser verify:

- trajectory content stacks at 320 px;
- no overlapping period labels;
- contact links remain visible and usable.

---

## Task 5: Fase 1.5 Full verification and delivery note

**Files:**
- Create: `docs/product/portfolio-3d-evolution-validation.md`

**Interfaces:**
- Consumes: finished local changes from Tasks 1-4.
- Produces: verification record and final delivery summary.

- [ ] **Step 1: Run unit suite**

Run:

```bash
npx pnpm --filter @command-center/web vitest run
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
npx pnpm --filter @command-center/web lint
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
npx pnpm --filter @command-center/web build
```

Expected: PASS.

- [ ] **Step 4: Run browser verification**

Start local dev after killing old 3000:

```bash
lsof -ti :3000 | xargs -r kill
npx pnpm --filter @command-center/web dev
```

Use Playwright to verify:

- 1440 px home, project detail, technologies, trajectory, contact;
- 390 px and 320 px no horizontal overflow;
- project selected from list and scene;
- technology selected and related project opened;
- 3D close/fallback still leaves content usable;
- reduced motion does not animate camera slowly.

- [ ] **Step 5: Write validation doc**

Create `docs/product/portfolio-3d-evolution-validation.md`:

```md
# Portfolio 3D Evolution Validation

Date: 2026-09-14

## Commands

- npx pnpm --filter @command-center/web vitest run
- npx pnpm --filter @command-center/web lint
- npx pnpm --filter @command-center/web build

## Browser Checks

- 1440 px: home, project detail, technologies, trajectory, contact.
- 390 px: mobile layout and 3D activation.
- 320 px: no horizontal overflow.

## Limits

No deployment was performed. No new services were provisioned.
```

- [ ] **Step 6: Final report**

Report:

- files changed;
- tests passed;
- browser checks performed;
- local URL;
- unresolved risks.

Do not say "funciona" unless the browser checks were actually completed.

---

## Self-Review

Spec coverage: covered home, project detail, technologies, trajectory, performance, accessibility and verification.

Completion scan: no incomplete markers remain in the execution steps.

Type consistency: task interfaces use existing component names and props from the current `experience` module.

## Execution Options

Plan complete and saved. Recommended execution is phase-by-phase inline in this session because Daniel requires explicit approval before moving phases. Start with Task 1 only after Daniel approves Fase 1.1.
