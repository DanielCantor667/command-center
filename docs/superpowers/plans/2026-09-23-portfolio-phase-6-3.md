# Portafolio Fase 6.3 Implementation Plan

Estado: aprobado por Daniel el 23 de septiembre de 2026 e implementado localmente. Resultados en `docs/product/portfolio-3d-evidence/portfolio-phase-6-3-validation.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a los cuatro casos una apertura y un cierre distintivos que expliquen la participacion documentada desde el primer viewport, sin perder el rendimiento ni la continuidad 3D existente.

**Architecture:** Cada caso conserva su TSX y CSS Module como dueño de su composicion. La informacion de rol sale de `project.role.title`; Drokex conserva la atribucion de CV y propiedad no confirmada. Motion limitado a CSS de portada; `ExperienceGate` y las escenas 3D se mantienen intactos salvo conflicto reproducible.

**Tech Stack:** React 19, Next.js 15, TypeScript, CSS Modules, `next/image`, lucide-react, Vitest y Chrome con Playwright.

**Spec:** `docs/superpowers/specs/2026-09-23-portfolio-phase-6-3-design.md`

## Global Constraints

- No renders Blender, escenas WebGL, dependencias ni datos inventados nuevos.
- Sin sonido, scroll secuestrado ni bloqueo de controles; `prefers-reduced-motion` muestra estado final.
- H1 igual al nombre del proyecto; enlaces reales; Drokex no afirma autoria exclusiva ni resultados comerciales.
- Pantallas objetivo: 1440x1000, 1920x1080, 390x844 y 320x568. En todas asoma la siguiente seccion y no hay solapes ni desbordes.
- Preservar entrada/retorno de ciudad, 3D opt-in, foco y transiciones de fase 6.2.
- No commit, push, deploy, provisioning ni modificaciones a repositorios de marcas.

## Review Focus

1. Viewport 320x568: titulo, rol y acciones deben caber sin ocultar el render ni empujar fuera la siguiente seccion. Lo comprueba Task 5.
2. Drokex: el rol proviene del proyecto y la propiedad no confirmada queda visible arriba. Lo comprueba Task 4.
3. Cambio caso->caso: animacion de portada no debe competir con el barrido de 440 ms. Lo comprueba Task 5.
4. Movimiento reducido: portada final util, sin espera ni contenido invisible. Lo comprueba Task 5.
5. WebGL ausente: enlaces y evidencias reales siguen visibles, sin canvas de portada. Lo comprueban Tasks 1-4 y Task 5.

---

### Task 1: Kliniu, producto primero

**Files:**
- Modify: `apps/web/modules/projects/components/portfolio-case/kliniu-case.tsx`
- Modify: `apps/web/modules/projects/components/portfolio-case/kliniu-case.module.css`
- Test: `apps/web/modules/projects/components/portfolio-case/kliniu-case.test.tsx`

**Interfaces:** Consumes `PortfolioCaseProps.project.role.title` y `project.links.live`. Produces markup de portada con `data-case-context="kliniu"` y mantiene `onSelect`/`onReturn` existentes.

- [ ] **Step 1: RED, contexto visible.** Ampliar la prueba existente para exigir un bloque cercano al H1, enlace real y ausencia de canvas adicional:

```tsx
const project = PROJECTS.find(p => p.id === 'kliniu')!;
const main = screen.getByRole('main');
expect(main.querySelector('[data-case-context="kliniu"]')).toHaveTextContent(project.role.title);
expect(screen.getByRole('link', { name: /Visitar sitio/ })).toHaveAttribute('href', project.links.live);
expect(main.querySelector('canvas')).toBeNull();
```

- [ ] **Step 2: Ejecutar RED.** `cd apps/web && npx vitest run modules/projects/components/portfolio-case/kliniu-case.test.tsx`; debe fallar por falta de `data-case-context`.
- [ ] **Step 3: Implementar.** En `.opening`, junto a `.lead`, añadir el contexto con copy verificable. Mantener `kliniu-surface`, captura real y enlace a imagen completa. En CSS, acotar la altura visible de la captura con `object-fit: cover; object-position: top` y ajustar `opening` para que el principio de `.brief` asome; nunca estirar la imagen. El enlace existente a siguiente proyecto permanece funcional.

```tsx
<p data-case-context="kliniu" className={styles.context}>
  Catálogo y cotizaciones para compras institucionales.
  <strong>{project.role.title}</strong>
</p>
```
- [ ] **Step 4: GREEN.** Repetir el comando de Step 2 y revisar foco del H1, boton de regreso y etapas de `KliniuSequence`.

### Task 2: L'ORIGINE, marca y evidencia

**Files:**
- Modify: `apps/web/modules/projects/components/portfolio-case/lorigine-case.tsx`
- Modify: `apps/web/modules/projects/components/portfolio-case/lorigine-case.module.css`
- Test: `apps/web/modules/projects/components/portfolio-case/lorigine-case.test.tsx`

**Interfaces:** Consumes `project.role.title`, render `/experience/lorigine-hero-*-v4.webp` y enlace de sitio. Produces `data-case-context="lorigine"` en portada; conserva `LorigineGallery`.

- [ ] **Step 1: RED, marca y rol.** En la prueba de apertura añadir:

```tsx
expect(screen.getByRole('main').querySelector('[data-case-context="lorigine"]')).toHaveTextContent(project.role.title);
expect(screen.getByAltText('Galería conceptual L’ORIGINE creada en Blender')).toBeInTheDocument();
expect(screen.getByRole('link', { name: 'Visitar sitio' })).toHaveAttribute('href', project.links.live);
```

- [ ] **Step 2: Ejecutar RED.** `cd apps/web && npx vitest run modules/projects/components/portfolio-case/lorigine-case.test.tsx`; debe fallar por contexto ausente.
- [ ] **Step 3: Implementar.** Completar `.heroTitle`/`.heroFoot` con el siguiente contexto. No ponerlo sobre el objeto central; usar banda inferior de ancho completo, no tarjeta. Mantener el rotulo conceptual del `alt` y capturas reales en `.evidence`. Ajustar CSS de portada para mostrar inicio de `.intro` y optimizar el asset mobile existente. No introducir otro canvas.

```tsx
<p data-case-context="lorigine" className={styles.context}>
  Tienda de cuidado capilar profesional.
  <strong>{project.role.title}</strong>
</p>
```
- [ ] **Step 4: GREEN.** Repetir Step 2 y comprobar galeria, enlaces, regreso y siguiente proyecto.

### Task 3: 4U Studio Academy, sala y aprendizaje

**Files:**
- Modify: `apps/web/modules/projects/components/portfolio-case/academy-case.tsx`
- Modify: `apps/web/modules/projects/components/portfolio-case/academy-case.module.css`
- Test: `apps/web/modules/projects/components/portfolio-case/academy-case.test.tsx`

**Interfaces:** Consumes `project.role.title` y render `/experience/academy-hero-*-v4.webp`. Produces `data-case-context="4ustudio-academy"`; conserva `AcademyStudio` y sus vistas.

- [ ] **Step 1: RED, funcion y rol.** Ampliar test:

```tsx
const context = screen.getByRole('main').querySelector('[data-case-context="4ustudio-academy"]');
expect(context).toHaveTextContent(project.role.title);
expect(context).toHaveTextContent(/academia|lecciones/i);
expect(screen.getByAltText('Estudio musical conceptual de 4U, render de Blender')).toBeInTheDocument();
```

- [ ] **Step 2: Ejecutar RED.** `cd apps/web && npx vitest run modules/projects/components/portfolio-case/academy-case.test.tsx`; debe fallar por contexto ausente.
- [ ] **Step 3: Implementar.** Situar este resumen sin cruzar instrumentos ni H1. Ajustar encuadre desktop/mobile con `object-position` y altura responsive de `.hero`, preservando su render y el enlace a lecciones reales. Movimiento breve en titulo/banda, sin sonido ni transform sobre el contenedor del 3D. El cierre anterior/siguiente sigue usando `onSelect`.

```tsx
<p data-case-context="4ustudio-academy" className={styles.context}>
  Academia de música y lecciones presenciales.
  <strong>{project.role.title}</strong>
</p>
```
- [ ] **Step 4: GREEN.** Repetir Step 2 y comprobar las tres vistas, fallback WebGL, enlaces y navegacion.

### Task 4: Drokex, red con atribucion honesta

**Files:**
- Modify: `apps/web/modules/projects/components/portfolio-case/drokex-case.tsx`
- Modify: `apps/web/modules/projects/components/portfolio-case/drokex-case.module.css`
- Test: `apps/web/modules/projects/components/portfolio-case/drokex-case.test.tsx`

**Interfaces:** Consumes `project.role.title`, `project.ownership.type` y render `/experience/drokex-hero-*-v4.webp`. Produces `data-case-context="drokex"`; conserva `DrokexNetwork` y navegacion.

- [ ] **Step 1: RED, atribucion arriba.** Ampliar test:

```tsx
const context = screen.getByRole('main').querySelector('[data-case-context="drokex"]');
expect(context).toHaveTextContent(project.role.title);
expect(context).toHaveTextContent('Participación descrita en el CV de Daniel.');
expect(context).toHaveTextContent('Propiedad no confirmada.');
```

- [ ] **Step 2: Ejecutar RED.** `cd apps/web && npx vitest run modules/projects/components/portfolio-case/drokex-case.test.tsx`; debe fallar por contexto ausente.
- [ ] **Step 3: Implementar.** Incorporar el contexto en la banda inferior del hero, manteniendo visible el objeto 3D y CTA. La nota extensa de `.intro` puede permanecer; no transformar esa nota en resultado comercial. Reducir altura fija de `.hero` en viewport corto y ajustar `heroTitle`/`heroFoot` para 320 px sin solapes. Mantener `alt` conceptual y las capturas publicadas de productos/directorio.

```tsx
<p data-case-context="drokex" className={styles.context}>
  Directorio de empresas y productos. <strong>{project.role.title}</strong>
  <span>Participación descrita en el CV de Daniel. Propiedad no confirmada.</span>
</p>
```
- [ ] **Step 4: GREEN.** Repetir Step 2 y comprobar red, fallback, foco y regreso.

### Task 5: Motion, QA visual y regresion conjunta

**Files:**
- Modify: los cuatro CSS Modules anteriores, solo para motion y correcciones visuales observadas.
- Create: `docs/product/portfolio-3d-evidence/verify-phase-6-3.cjs`
- Create: `docs/product/portfolio-3d-evidence/portfolio-phase-6-3-validation.md`

**Interfaces:** Consumes las portadas `data-case-context` de Tasks 1-4. No altera API de Gate ni escenas WebGL.

- [ ] **Step 1: Preparar QA de navegador.** Crear un script Playwright similar a `verify-phase-6-2.cjs`: entrar a cada caso desde ciudad en viewports `[[1440,1000],[1920,1080],[390,844],[320,568]]`; guardar screenshot del primer viewport y del cierre. Para cada caso, comprobar visibilidad geometrica de contexto y siguiente seccion, ademas de H1, enlace de sitio, foco, ancho y ausencia de canvas de portada. Para Drokex afirmar nota de atribucion. Ejemplo de chequeo por pagina:

```js
const visible = await page.locator('[data-case-context]').evaluate((element) => {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= innerHeight && rect.width > 0;
});
assert.equal(visible, true, 'Contexto visible en el primer viewport');
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
const next = page.locator('main article > section').nth(1);
assert.ok((await next.boundingBox()).y < height, 'Seccion siguiente asoma');
```

Ejecutar con `PLAYWRIGHT_PATH=/Users/creativo/Documents/kliniu/node_modules/playwright` y Chrome real.
- [ ] **Step 2: Implementar motion CSS.** Aplicar solo a texto/capa visual de portada, maximo 600 ms, con `@media (prefers-reduced-motion: no-preference)` y neutralizacion bajo `html[data-portfolio-transition]` para no competir con fase 6.2. Nunca animar el root, el canvas, el H1 enfocado fuera de pantalla o el layout. `@media (prefers-reduced-motion: reduce)` deja contenido final inmediatamente visible.
- [ ] **Step 3: Chrome visual.** Ejecutar `verify-phase-6-3.cjs` en Chrome real; inspeccionar las 16 capturas de apertura mas cierres. Corregir CSS hasta que no haya solapes, texto ilegible, medio vacio, scroll horizontal ni portada de altura excesiva. Verificar `320x568` con las cuatro portadas, no solo Drokex. Conservar la navegacion existente en los cuatro cierres.
- [ ] **Step 4: Regresion de interaccion.** Ejecutar `verify-phase-6-2.cjs` y `verify-continuity-phase-6-1.cjs` con Chrome: caso->caso, caso->ciudad, Escape, reduced motion, 3D opt-in y estado de camara/scroll. Anotar fallos reales y corregir solo dentro del alcance.
- [ ] **Step 5: Cierre.** `cd apps/web && npx vitest run --silent --reporter=dot`, `npx tsc --noEmit`, `npx eslint modules/projects/components/portfolio-case`, y desde raiz `git diff --check`. Guardar resultados, capturas representativas, limites de QA y URL local en `portfolio-phase-6-3-validation.md`. Mantener servidor local; no commit ni push.

## Self-review

- Cobertura: direccion visual individual en Tasks 1-4; contenido y atribucion en sus pruebas; motion, mobile, accesibilidad y continuidad en Task 5.
- No se agregan interfaces compartidas, dependencias ni renders. Los cierres ya existentes se preservan; miniaturas son opcionales y deben retirarse si perjudican mobile.
- El test de viewport no sustituye inspeccion visual de capturas. Las metricas no documentadas siguen ausentes.

## Ejecucion

Daniel aprobo el plan. Se implemento de forma nativa en este workspace, caso por caso, con QA conjunta de ciudad y transiciones. No se hizo commit, push ni deploy.
