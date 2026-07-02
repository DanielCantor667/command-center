import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Grid } from '../component';

describe('Grid', () => {
  it('renders a single-column grid with md gap by default', () => {
    render(<Grid data-testid="grid">content</Grid>);
    const el = screen.getByTestId('grid');
    expect(el).toHaveClass('grid-cols-1');
    expect(el).toHaveClass('gap-16');
  });

  it('applies a fixed column count', () => {
    render(
      <Grid data-testid="grid" columns={3}>
        content
      </Grid>,
    );
    expect(screen.getByTestId('grid')).toHaveClass('grid-cols-3');
  });

  it('applies responsive columns', () => {
    render(
      <Grid data-testid="grid" columns={{ base: 1, tablet: 2, laptop: 4 }}>
        content
      </Grid>,
    );
    const el = screen.getByTestId('grid');
    expect(el).toHaveClass('grid-cols-1');
    expect(el).toHaveClass('tablet:grid-cols-2');
    expect(el).toHaveClass('laptop:grid-cols-4');
  });

  it('applies a single responsive breakpoint without stray whitespace', () => {
    render(
      <Grid data-testid="grid" columns={{ tablet: 2 }}>
        content
      </Grid>,
    );
    const el = screen.getByTestId('grid');
    expect(el).toHaveClass('tablet:grid-cols-2');
    expect(el.className).not.toMatch(/\s{2,}/);
    expect(el.className.trim()).toBe(el.className);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Grid>content</Grid>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
