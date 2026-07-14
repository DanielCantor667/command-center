# ADR-005: Tailwind v4 Monorepo Integration

Status

Accepted

Context

Tras Sprint 0.6 (Module System + Dashboard Foundation), el Dashboard renderizaba sin las
utilidades de Tailwind definidas y usadas por `packages/ui` (`text-display-l`,
`bg-surface-secondary`, `grid-cols-2`, `gap-8`, `h-40`, `px-16`, etc.). Los tokens CSS
(`packages/config/tokens/*.css`) y el Theme Engine funcionaban correctamente; el problema estaba
aislado a la generación de utilidades de Tailwind.

Causa raíz: `packages/config/tailwind.css` (entry point compartido, importado desde
`apps/web/app/globals.css`) solo declaraba `@import 'tailwindcss'`, sin ninguna directiva
`@source`. Tailwind v4 reemplazó `tailwind.config.js` con detección automática de contenido
basada en heurísticas (respeta `.gitignore`, ignora binarios y `node_modules`). En un monorepo
pnpm, `packages/ui` es un paquete hermano de `packages/config` con su propio `package.json`;
`apps/web` solo lo consume vía el symlink de `node_modules/@command-center/ui`. La detección
automática de Tailwind v4 no atraviesa ese symlink ni boundaries de paquete no declarados
explícitamente, por lo que las clases usadas en `packages/ui` nunca entraban al escaneo, aunque
los archivos existieran físicamente en el repositorio.

Decision

Se declara explícitamente el paquete `ui` como fuente de contenido en el entry point compartido
de Tailwind:

```css
/* packages/config/tailwind.css */
@import 'tailwindcss';

@source '../ui';
```

Esta es la solución recomendada por la documentación oficial de Tailwind CSS v4 para monorepos
(`@source` / función `source()` — https://tailwindcss.com/docs/functions-and-directives#source y
https://tailwindcss.com/docs/detecting-classes-in-source-files), en lugar de alternativas
descartadas:

- Deshabilitar la detección automática (`source(none)`) y registrar todo manualmente: mayor
  superficie de mantenimiento, innecesario cuando solo un paquete queda fuera del escaneo.
- Mover `tailwind.css` a otra ubicación o duplicarlo en `apps/web`: rompe la fuente única de
  verdad del entry point compartido sin resolver la causa raíz.
- Volver a `tailwind.config.js` con `content: []`: iría contra la arquitectura CSS-first de
  Tailwind v4 ya adoptada en ADR-004.

`@source` es aditivo: no reemplaza la detección automática existente, solo extiende el escaneo a
rutas que la heurística no alcanza por diseño (boundaries de paquete/symlinks).

Consequences

- Cualquier paquete nuevo bajo `packages/` que exponga componentes o clases de Tailwind
  consumidos desde `apps/web` (por ejemplo, futuros `packages/charts` o `packages/icons`) debe
  agregar su propia línea `@source '../<paquete>';` en `packages/config/tailwind.css`. Si no se
  agrega, las utilidades de ese paquete no se generarán y fallarán silenciosamente en producción
  (el build no falla, solo faltan estilos).
- No se modificó ningún componente, el Dashboard, el Shell, el Design System ni el
  `WorkspaceStore` — el cambio es exclusivamente de configuración de Tailwind.
- Verificado: build, lint, typecheck y suite de tests (124/124) en verde; las 6 utilidades
  reportadas como faltantes aparecen en el CSS compilado; verificación visual confirma que el
  Dashboard usa correctamente el Design System.
