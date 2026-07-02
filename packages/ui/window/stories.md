# Window Stories

## Default

```tsx
<Window>
  <WindowHeader>My Window</WindowHeader>
  <WindowContent>Body content</WindowContent>
  <WindowFooter>
    <Button size="sm">Close</Button>
  </WindowFooter>
</Window>
```

## Focused vs inactive

```tsx
<Window state="focused">...</Window>
<Window state="inactive">...</Window>
```
