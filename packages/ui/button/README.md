# Button

## Purpose

Standard clickable action control.

## Responsibilities

- Variant / size / loading / disabled states, all token-driven

## API

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `loading` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

Plus all native `<button>` attributes.

## Accessibility

- Defaults `type="button"` to avoid accidental form submits.
- `loading` sets `aria-busy="true"`, disables the button, and hides an `aria-hidden` spinner — the label text stays in the DOM (visually hidden via `text-transparent`) so assistive tech still announces it if `aria-busy` is not yet supported.
- Visible `focus-visible` ring via `--focus-ring`.

## Usage Example

```tsx
import { Button } from '@command-center/ui';

<Button variant="danger" onClick={handleDelete}>Delete</Button>
```

## Known Limitations

No icon slots yet (explicitly out of scope for this sprint).

## Future Extensions

Icon slots (leading/trailing) once IconButton usage patterns stabilize.
