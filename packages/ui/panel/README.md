# Panel

## Purpose

Semantic wrapper around Surface with sensible spacing defaults for content sections.

## Responsibilities

- Applies Panel's default Surface configuration (`subtle` / `md` padding / `lg` radius / `low` elevation / bordered)
- Adds no styling of its own beyond configuring Surface

## API

Same props as `Surface`, restricted to `padding: 'none' | 'sm' | 'md' | 'lg'`. See [Surface](../surface/README.md).

## Accessibility

Inherits Surface's accessibility behavior. Panel does not add a `role`.

## Usage Example

```tsx
import { Panel } from '@command-center/ui';

<Panel padding="lg">Section content</Panel>
```

## Known Limitations

Same as Surface.

## Future Extensions

None planned — Panel is intentionally a thin configuration layer.
