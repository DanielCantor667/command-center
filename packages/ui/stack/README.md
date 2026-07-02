# Stack

## Purpose

Flexbox layout primitive for one-dimensional arrangement of children.

## Responsibilities

- Direction, gap, alignment, justification, wrapping
- Responsive gap via `{ base, tablet, laptop }` mapped to the project's semantic breakpoints

## API

| Prop | Type | Default |
| --- | --- | --- |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `gap` | `StackGap \| { base?, tablet?, laptop? }` | `'md'` |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | — |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | — |
| `wrap` | `boolean` | `false` |

## Accessibility

Purely presentational (`div`); no ARIA role needed — semantics come from children.

## Usage Example

```tsx
import { Stack } from '@command-center/ui';

<Stack direction="horizontal" gap="sm" align="center">
  <Icon />
  <span>Label</span>
</Stack>
```

## Known Limitations

Responsive gap only supports `tablet`/`laptop` breakpoints (not `mobile`/`desktop`/`ultrawide`) — this matches the two breakpoints most layout components need; extend `STACK_RESPONSIVE_BREAKPOINTS` if more are needed.

## Future Extensions

Responsive `direction` and `align`/`justify` if a real layout needs them.
