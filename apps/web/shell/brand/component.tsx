import { APP_NAME } from '@command-center/config';
import { Stack, Typography } from '@command-center/ui';
import { Logo } from '../logo';
import type { BrandProps } from './types';

export function Brand({ className, ...rest }: BrandProps) {
  return (
    <Stack direction="horizontal" gap="sm" align="center" className={className} {...rest}>
      <Logo />
      <Typography as="span" variant="title" color="primary">
        {APP_NAME}
      </Typography>
    </Stack>
  );
}
