import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Stack } from '../component';

describe('Stack', () => {
  it('renders vertically with md gap by default', () => {
    render(<Stack data-testid="stack">content</Stack>);
    const el = screen.getByTestId('stack');
    expect(el).toHaveClass('flex-col');
    expect(el).toHaveClass('gap-16');
  });

  it('renders horizontally when requested', () => {
    render(
      <Stack data-testid="stack" direction="horizontal">
        content
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveClass('flex-row');
  });

  it('applies align, justify and wrap classNames', () => {
    render(
      <Stack data-testid="stack" align="center" justify="between" wrap>
        content
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    expect(el).toHaveClass('items-center');
    expect(el).toHaveClass('justify-between');
    expect(el).toHaveClass('flex-wrap');
  });

  it('applies a responsive gap object', () => {
    render(
      <Stack data-testid="stack" gap={{ base: 'sm', tablet: 'lg' }}>
        content
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    expect(el).toHaveClass('gap-8');
    expect(el).toHaveClass('tablet:gap-24');
  });

  it('applies a responsive gap object with a single breakpoint key', () => {
    render(
      <Stack data-testid="stack" gap={{ tablet: 'lg' }}>
        content
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    expect(el.className).toContain('tablet:gap-24');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Stack>content</Stack>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
