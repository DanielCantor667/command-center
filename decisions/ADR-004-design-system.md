# ADR-004: Design System

Status

Accepted

Context

Sprint 0.2 (Foundation Engine) entregó tokens de diseño (`packages/config/tokens/*.css`) y un
sistema de theming (`packages/ui/theme/`), pero ningún componente visual reutilizable. Sprint 0.4
(Application Shell) y todo desarrollo de UI posterior necesitan primitives consistentes para no
duplicar estilos ni introducir valores hardcodeados fuera de los tokens.

Decision

Se implementa `packages/ui` como conjunto de primitives visuales puros (sin lógica de negocio,
sin acceso a datos), con las siguientes decisiones de arquitectura:

- Jerarquía de composición: `Surface → Panel → Window` (cada uno deriva estilo del anterior).
  `Typography` expone variantes (`Display`, `Heading`, `Title`, `Body`, `Caption`, `Mono`)
  mapeadas 1:1 a la escala tipográfica de tokens. `Button → IconButton`. `Stack`, `Grid`,
  `Divider` son primitives de layout independientes.
- Todo estilo resuelve a un token de `packages/config/tokens/*.css` — ningún color, spacing,
  radius, shadow o duración se escribe crudo en un componente.
- Patrón de carpeta uniforme por componente: `component.tsx, types.ts, styles.ts, index.ts,
  tests/, stories.md, README.md`.
- Utilidad compartida `lib/cn.ts` (`clsx` + `tailwind-merge`, con class-groups custom para clases
  semánticas propias como `text-display-xl`) para componer/mergear className de forma segura.
- Stack de testing: Vitest + Testing Library + `vitest-axe` (accesibilidad, cero violaciones por
  componente). Sin snapshot tests.
- Accesibilidad como requisito de aceptación, no opcional: roles ARIA correctos (`role="group"`
  en `Window`, `role="separator"` en `Divider`), foco visible vía `--focus-ring`, `aria-label`
  obligatorio en `IconButton`, `aria-busy` en estados `loading`.

Consequences

- Sprint 0.4 (Application Shell) y sprints futuros de UI componen exclusivamente con estos
  primitives; no se crean estilos ad-hoc ni componentes "específicos" fuera de este set sin pasar
  primero por el Design System.
- Cambiar un token en `packages/config/tokens/` propaga consistentemente a todos los primitives,
  sin tocar componentes individuales.
- Quedan pendientes (documentados en `packages/ui/DESIGN_SYSTEM.md` → "Suggested Improvements",
  no bloquean Sprint 0.4): `Tooltip`, tokens de opacidad/alpha dedicados, tipografía fluida
  (`clamp()`), breakpoints responsive completos en `Stack`/`Grid` (hoy solo `tablet`/`laptop`),
  `Skeleton`, `VisuallyHidden` reutilizable.
- No hay build step para `packages/ui` (se consume el código fuente TS directo vía workspace); si
  en el futuro se publica el paquete fuera del monorepo, esta decisión debe revisarse en un ADR
  nuevo.
