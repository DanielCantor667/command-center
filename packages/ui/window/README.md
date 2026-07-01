# Window

## Purpose

Structural chrome for a window-like surface: header, content, footer.

## Responsibilities

- Composes Header / Content / Footer sections
- Reflects `default | focused | inactive` state via border color/opacity tokens only

## API

| Component | Props |
| --- | --- |
| `Window` | `state?: 'default' \| 'focused' \| 'inactive'` + all `Panel`-forwarded div props |
| `WindowHeader` / `WindowContent` / `WindowFooter` | standard div props |

## Accessibility

`Window` renders with `role="group"`. No drag, resize, or animation — none of these are in scope for this sprint.

## Usage Example

```tsx
import { Window, WindowContent, WindowFooter, WindowHeader } from '@command-center/ui';

<Window state="focused">
  <WindowHeader>Title</WindowHeader>
  <WindowContent>Body</WindowContent>
  <WindowFooter>Footer</WindowFooter>
</Window>
```

## Known Limitations

No dragging, resizing, or animated state transitions (out of scope for this sprint).

## Future Extensions

Windows Manager (drag/resize/z-order) is an explicit non-goal of this sprint and will be a future business-layer concern built on top of this primitive.
