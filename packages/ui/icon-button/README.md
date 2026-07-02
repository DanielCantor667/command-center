# IconButton

## Purpose

Square, icon-only button.

## Responsibilities

- Fixed square sizing (16 / 20 / 24 / 32 — all Foundation spacing tokens)
- Enforces an accessible label

## API

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `16 \| 20 \| 24 \| 32` | `24` |
| `label` | `string` (required) | — |
| `variant` | `ButtonVariant` | `'ghost'` |
| `loading` | `boolean` | `false` |

## Accessibility

`label` is required and rendered as `aria-label` — IconButton has no visible text, so this is the only accessible name.

## Usage Example

```tsx
import { IconButton } from '@command-center/ui';

<IconButton label="Close panel" onClick={onClose}>
  <CloseIcon />
</IconButton>
```

## Known Limitations

No custom (non-token) sizing, by design.

## Future Extensions

None planned — new sizes should be added to the token-aligned `IconButtonSize` union only if a real need appears.
