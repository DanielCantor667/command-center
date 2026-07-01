# Surface

## Purpose

Root visual primitive. Every other visible component (Panel, Window, Cards, ...) derives from Surface.

## Responsibilities

- Background, border, radius, elevation (via Foundation Tokens only)
- Hover / focus / disabled states
- Polymorphic rendering via `asChild`

## API

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `'default' \| 'subtle' \| 'outlined' \| 'interactive' \| 'transparent'` | `'default'` |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'none'` |
| `radius` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'none'` |
| `elevation` | `'none' \| 'low' \| 'medium' \| 'high'` | `'none'` |
| `border` | `boolean` | `false` |
| `interactive` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |

## Accessibility

- `disabled` sets `aria-disabled="true"` and removes pointer/keyboard interaction.
- `interactive` (and not `disabled`/`asChild`) sets `tabIndex={0}` and a visible `focus-visible` ring using `--focus-ring`.
- Surface never assigns a `role` — callers pick the correct semantic element or ARIA role for their use case.

## Usage Example

```tsx
import { Surface } from '@command-center/ui';

<Surface variant="outlined" padding="md" radius="md">
  Hello
</Surface>
```

## Known Limitations

- `asChild` forwards a `ref` typed as `HTMLDivElement` even though the rendered element may differ (Radix Slot convention).
- Surface has no built-in `role`; interactive non-button use cases must add their own `role`/`aria-*`.

## Future Extensions

- Optional `as` prop for non-`asChild` polymorphism once a concrete need appears.
