# Brand

## Purpose

Application identity: `Logo` + application name, used in `Sidebar` and `TopBar`.

## Responsibilities

- Compose `Logo` and the app name (from `@command-center/config`'s `APP_NAME`) using `Stack`.
- Nothing else — no links, no click behavior.

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes. |
| ...rest | `ComponentPropsWithoutRef<'div'>` (minus `children`) | — | Forwarded to the underlying `Stack`. |

## Accessibility

The application name renders as visible text (`Typography`, `title` variant); `Logo` stays
`aria-hidden` so screen readers announce the name once, not the mark plus the name.

## Usage Example

```tsx
import { Brand } from '@/shell/brand';

<Brand />
```

## Known Limitations

- Not a link — does not navigate anywhere (no routing in this sprint).

## Future Extensions

- Wrap in a link back to the default module once routing exists.
