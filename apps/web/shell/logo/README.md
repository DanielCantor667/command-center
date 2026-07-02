# Logo

## Purpose

Application mark, used inside `Brand` (and anywhere else the wordmark alone is needed).

## Responsibilities

- Render a fixed 32×32 mark built from `Surface` + `Typography`.
- Purely decorative — marked `aria-hidden` since it never appears without an adjacent text label
  (`Brand` pairs it with the application name).

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes, merged via the design system's class-merge rules. |
| ...rest | `ComponentPropsWithoutRef<'div'>` (minus `children`) | — | Forwarded to the underlying `Surface`. |

## Accessibility

`aria-hidden="true"` — the mark is decorative; always pair with visible text (see `Brand`).

## Usage Example

```tsx
import { Logo } from '@/shell/logo';

<Logo />
```

## Known Limitations

- Fixed size (32×32), no size variants.

## Future Extensions

- Size variants if the mark is ever needed at another scale (e.g. favicon preview, splash
  screen).
