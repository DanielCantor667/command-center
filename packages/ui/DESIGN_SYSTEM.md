# Command Center Design System — Sprint 0.3 Deliverables

## Folder Tree

```
packages/ui/
  lib/
    cn.ts
    tests/cn.test.ts
  surface/    (component.tsx, types.ts, styles.ts, index.ts, tests/, stories.md, README.md)
  panel/      (same shape)
  window/     (same shape)
  typography/ (same shape)
  divider/    (same shape)
  stack/      (same shape)
  grid/       (same shape)
  button/     (same shape)
  icon-button/(same shape)
  theme/      (theme-context.tsx, theme-provider.tsx, theme-script.tsx — Sprint 0.2)
  index.ts
```

## Component Hierarchy

```
Surface
 └─ Panel
     └─ Window (Header / Content / Footer)

Typography
 └─ Display / Heading / Title / Body / Caption / Mono

Button
 └─ IconButton

Stack, Grid, Divider — independent layout primitives
```

## Public API

See each component's own README.md for its full prop table. The complete surface is re-exported from `packages/ui/index.ts`.

## Composition Examples

```tsx
import { Body, Button, Panel, Stack, Title, Window, WindowContent, WindowFooter, WindowHeader } from '@command-center/ui';

function ExampleWindow() {
  return (
    <Window state="focused">
      <WindowHeader>
        <Title>Example</Title>
      </WindowHeader>
      <WindowContent>
        <Stack gap="md">
          <Panel padding="md">
            <Body>Composed entirely from design-system primitives.</Body>
          </Panel>
        </Stack>
      </WindowContent>
      <WindowFooter>
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </WindowFooter>
    </Window>
  );
}
```

## Accessibility Report

- All interactive primitives (`Surface[interactive]`, `Button`, `IconButton`) expose a visible `focus-visible` ring via `--focus-ring` and are reachable by keyboard (native `<button>`, or `tabIndex={0}` for interactive `Surface`).
- `Divider` uses `role="separator"` + `aria-orientation`.
- `Window` uses `role="group"`.
- `IconButton` requires a `label` prop, enforced at the type level, rendered as `aria-label`.
- `Button`/`IconButton` `loading` state sets `aria-busy` and disables the control.
- `prefers-reduced-motion: reduce` is handled globally in `packages/config/global.css`; no component adds its own animation beyond the `Button` loading spinner, which respects the same global rule.
- Every component's test suite includes a `vitest-axe` check with zero violations.

## Suggested Improvements (not implemented this sprint)

- Add a `Tooltip`/accessible-name pattern shared between `IconButton` and future icon-bearing controls.
- Add fluid (`clamp()`-based) typography tokens for better cross-breakpoint scaling.
- Extend `Stack`/`Grid` responsive props to cover all five semantic breakpoints, not just `tablet`/`laptop`.
- Add a `Skeleton` primitive once loading states appear in real screens.
- Consider a `VisuallyHidden` primitive for screen-reader-only text, reusable beyond `Button`'s loading label.
- Add dedicated opacity/hover-alpha tokens — `opacity-50`/`opacity-80` (disabled/inactive states) and `/90` hover alpha modifiers (Button) are currently raw Tailwind values, not tokens.
