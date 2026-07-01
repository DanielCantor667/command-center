# Surface Stories

## Default

```tsx
<Surface padding="md">Default surface</Surface>
```

## Outlined, elevated

```tsx
<Surface variant="outlined" padding="lg" radius="lg" elevation="medium">
  Outlined surface
</Surface>
```

## Interactive

```tsx
<Surface interactive padding="md" radius="md" onClick={() => console.log('clicked')}>
  Click me
</Surface>
```

## asChild (renders as an anchor)

```tsx
<Surface asChild interactive padding="md" radius="md">
  <a href="/projects">Go to projects</a>
</Surface>
```
