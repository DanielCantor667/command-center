# AppContainer

## Purpose

Root sizing container for the Application Shell: pins the shell to the viewport height and clips
overflow so `TopBar`/`Sidebar`/`StatusBar` never scroll with the page.

## Responsibilities

- Full viewport height (`h-screen`), full width, column flex layout.
- Clip overflow (`overflow-hidden`) so only `Workspace`/`Sidebar` scroll internally.

Does not handle safe-area insets directly — those are already applied globally on `<body>` in
`packages/config/global.css`.

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes. |
| `children` | `ReactNode` | — | Shell content (`TopBar`, the Sidebar/Workspace row, `StatusBar`). |
| ...rest | `ComponentPropsWithoutRef<'div'>` | — | Forwarded to the root `div`. |

## Accessibility

No landmark role of its own — it is a layout container. Landmarks come from its children
(`<header>` in `TopBar`, `<aside>` in `Sidebar`, `<main>` in `Workspace`, `<footer>` in
`StatusBar`).

## Usage Example

```tsx
import { AppContainer } from '@/shell/app-container';

<AppContainer>
  {/* TopBar, Sidebar + Workspace row, StatusBar */}
</AppContainer>
```

## Known Limitations

- Assumes it is mounted once at the root of the page; not designed to be nested.

## Future Extensions

- None planned — this is permanent shell chrome.
