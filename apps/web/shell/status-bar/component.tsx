import { Stack, Surface, Typography } from '@command-center/ui';
import type { StatusBarProps } from './types';

const STATUS_ITEMS = [
  { label: 'Portfolio', value: 'Público' },
  { label: 'Sistema', value: 'Documentado' },
  { label: 'Evidencia', value: 'Trazable' },
  { label: 'Base', value: 'Bogotá, Colombia' },
  { label: 'Contacto', value: 'LinkedIn + GitHub' },
] as const;

export function StatusBar({ className, ...rest }: StatusBarProps) {
  const [leading, trailing] = [STATUS_ITEMS.slice(0, 3), STATUS_ITEMS.slice(3)];

  return (
    <Surface
      asChild
      variant="subtle"
      border
      padding="sm"
      className={[
        'command-statusbar flex h-[var(--layout-statusbar-height)] w-full shrink-0 items-center justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <footer {...rest}>
        <Stack direction="horizontal" gap="md" align="center">
          {leading.map((item) => (
            <Typography key={item.label} as="span" variant="caption" color="muted">
              {item.label}: {item.value}
            </Typography>
          ))}
        </Stack>
        <Stack direction="horizontal" gap="md" align="center">
          {trailing.map((item) => (
            <Typography key={item.label} as="span" variant="caption" color="muted">
              {item.label}: {item.value}
            </Typography>
          ))}
        </Stack>
      </footer>
    </Surface>
  );
}
