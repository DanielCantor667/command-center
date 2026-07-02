import { Surface, Typography } from '@command-center/ui';
import { LOGO_BASE_STYLE } from './styles';
import type { LogoProps } from './types';

export function Logo({ className, ...rest }: LogoProps) {
  return (
    <Surface
      variant="outlined"
      radius="md"
      padding="none"
      aria-hidden="true"
      className={[LOGO_BASE_STYLE, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Typography as="span" variant="mono-small" color="accent">
        CC
      </Typography>
    </Surface>
  );
}
