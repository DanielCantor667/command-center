# Divider

## Purpose

Simple visual separator between content regions.

## Responsibilities

- Horizontal or vertical line using `--divider` and `--border-thin` tokens only

## API

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |

## Accessibility

Renders with `role="separator"` and `aria-orientation`.

## Usage Example

```tsx
import { Divider } from '@command-center/ui';

<Divider orientation="vertical" />
```

## Known Limitations

A vertical Divider needs an ancestor with a defined height (e.g. inside a flex row) to be visible — it has no intrinsic height.

## Future Extensions

None planned.
