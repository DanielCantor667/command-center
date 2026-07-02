# Sprint 0.3: Design System Core

## Estado

Implementado. Verificado (tests, lint, typecheck en verde). Pendiente de merge a `main` vía PR.

## Objetivo del sprint

Construir el conjunto mínimo de primitives visuales reutilizables sobre el Foundation Engine
(tokens + theming de Sprint 0.2), para que Sprint 0.4 (Application Shell) y sprints futuros
compongan UI sin crear estilos ad-hoc ni valores hardcodeados.

## Alcance

### Primitives implementados

- `Surface` — base visual (fondo, borde, radio) de la que derivan `Panel` y `Window`.
- `Panel` — contenedor con padding, deriva de `Surface`.
- `Window` (+ `WindowHeader`, `WindowContent`, `WindowFooter`) — contenedor de nivel ventana,
  `role="group"`, deriva de `Panel`.
- `Typography` (+ `Display`, `Heading`, `Title`, `Body`, `Caption`, `Mono`) — escala tipográfica
  completa mapeada a los tokens de `packages/config/tokens/typography.css`.
- `Divider` — separador, `role="separator"` + `aria-orientation`.
- `Stack` — layout de flujo (flex) con `gap` tokenizado.
- `Grid` — layout de grilla responsive (breakpoints `tablet`/`laptop`).
- `Button` — variantes/tamaños vía diccionarios en `styles.ts`, estados `loading`/`disabled` con
  `aria-busy`.
- `IconButton` — deriva de `Button`, requiere `label` (tipado) → `aria-label`.
- `lib/cn.ts` — helper de merge de clases (`clsx` + `tailwind-merge` con class-groups custom para
  clases semánticas como `text-display-xl`).

### Jerarquía de componentes

```
Surface
 └─ Panel
     └─ Window (Header / Content / Footer)

Typography
 └─ Display / Heading / Title / Body / Caption / Mono

Button
 └─ IconButton

Stack, Grid, Divider — primitives de layout independientes
```

### Patrón de carpeta (idéntico para los 9 primitives)

```
<component>/
  component.tsx
  types.ts
  styles.ts
  index.ts
  tests/<component>.test.tsx
  stories.md
  README.md
```

Cada `README.md` documenta: Purpose, Responsibilities, API (tabla Prop/Type/Default),
Accessibility, Usage Example, Known Limitations, Future Extensions. Cada `stories.md` documenta
variantes de uso (markdown estático, sin Storybook instalado).

### Restricciones respetadas

- Cero colores/spacing/radius/shadows/duración hardcodeados: todo resuelve a un token de
  `packages/config/tokens/*.css`.
- TypeScript estricto (`noUncheckedIndexedAccess`), sin `any`.
- Cero warnings de ESLint (`@command-center/eslint-config`).
- Sin lógica de negocio, sin páginas, sin dashboard.
- Sin snapshot tests — tests de comportamiento + accesibilidad (`vitest-axe`, cero violaciones).
- Componentes de presentación puros (regla heredada de `specs/foundation.md`).

## Documentación por componente

Ya existe para los 9 primitives (`README.md` + `stories.md` en cada carpeta). Resumen agregado en
`packages/ui/DESIGN_SYSTEM.md` (folder tree, jerarquía, API pública, ejemplos de composición,
reporte de accesibilidad, mejoras sugeridas no implementadas).

## Verificación

- `pnpm test` (Vitest + Testing Library + `vitest-axe`): **56/56 tests pasan**, cero violaciones
  de accesibilidad por componente.
- `pnpm lint` (ESLint flat config compartida): sin errores ni warnings.
- `tsc --noEmit`: sin errores.
- `git status`: working tree limpio.

## Deuda técnica / extensiones futuras (documentadas, no implementadas)

Ver `packages/ui/DESIGN_SYSTEM.md` → "Suggested Improvements":

- `Tooltip` / patrón de nombre accesible compartido para controles con ícono.
- Tokens de opacidad/alpha dedicados (hoy `opacity-50`/`/90` son valores crudos de Tailwind).
- Tipografía fluida (`clamp()`) para mejor escalado entre breakpoints.
- `Stack`/`Grid` responsive en los cinco breakpoints semánticos completos (hoy solo
  `tablet`/`laptop`).
- `Skeleton` (cuando existan estados de carga en pantallas reales).
- `VisuallyHidden` reutilizable (hoy solo existe inline en el loading label de `Button`).

## Criterios de aceptación

- ✓ Los 9 primitives existen con estructura consistente.
- ✓ Cada primitive deriva de tokens, sin valores hardcodeados.
- ✓ Build/TypeScript/ESLint/Tests pasan, cero warnings.
- ✓ Accesibilidad verificada por test (`vitest-axe`) en cada componente.
- ✓ Documentación por componente (README + stories) completa.
- ✓ `packages/ui/index.ts` re-exporta la superficie pública completa.

## Review

Pendiente de aprobación vía Pull Request.

## Retrospectiva

Pendiente (post-merge).
