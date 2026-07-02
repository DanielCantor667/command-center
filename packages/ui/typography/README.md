# Typography

## Purpose

Every piece of text in Command Center renders through Typography (directly or via its convenience wrappers) instead of raw HTML tags.

## Responsibilities

- Maps every variant to Foundation Typography Tokens (`text-*` Tailwind namespace)
- Polymorphic element via `as`
- Color / alignment / truncation

## API

`Typography` props: `variant`, `as`, `color`, `align`, `truncate`, plus native element attributes.

Convenience primitives: `Display` (`size: 'xl' | 'l'`), `Heading` (`size: 'xl' | 'l' | 'm'`), `Title`, `Body` (`size: 'l' | 'default' | 'small'`), `Caption`, `Mono` (`size: 'default' | 'small'`).

## Accessibility

Each variant defaults to the semantically correct element (`h1`–`h4`, `p`, `span`, `code`). Use `as` only when the visual style and the semantic level genuinely differ (e.g. a card title that should be an `h3` in context).

## Usage Example

```tsx
import { Body, Heading } from '@command-center/ui';

<Heading size="m" as="h3">Card title</Heading>
<Body color="secondary">Supporting copy</Body>
```

## Known Limitations

No responsive/fluid typography — variants map to fixed token sizes.

## Future Extensions

Fluid clamp()-based sizing could be added to typography tokens without changing this component's API.
