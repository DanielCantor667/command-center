# Grid

## Purpose

CSS Grid layout primitive for two-dimensional arrangement of children.

## Responsibilities

- Column count (fixed or responsive), gap

## API

| Prop | Type | Default |
| --- | --- | --- |
| `columns` | `1 \| 2 \| 3 \| 4 \| 6 \| 12 \| { base?, tablet?, laptop? }` | `1` |
| `gap` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` |

## Accessibility

Purely presentational (`div`); no ARIA role needed.

## Usage Example

```tsx
import { Grid } from '@command-center/ui';

<Grid columns={{ base: 1, tablet: 2 }} gap="md">
  <Panel>Item</Panel>
  <Panel>Item</Panel>
</Grid>
```

## Known Limitations

No responsive gap (only Stack has it) and no auto-fit/auto-fill column modes.

## Future Extensions

`auto-fit`/`auto-fill` column modes if a real use case needs them.
