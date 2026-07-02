import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { IconButton } from '../component';

describe('IconButton', () => {
  it('requires and renders an accessible label', () => {
    render(<IconButton label="Close">×</IconButton>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('applies the requested square size and overrides Button defaults', () => {
    render(
      <IconButton label="Close" size={32}>
        ×
      </IconButton>,
    );
    const el = screen.getByRole('button', { name: 'Close' });
    expect(el).toHaveClass('h-32');
    expect(el).toHaveClass('w-32');
    expect(el).not.toHaveClass('h-40');
  });

  it('defaults to the ghost variant', () => {
    render(<IconButton label="Close">×</IconButton>);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('bg-transparent');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<IconButton label="Close">×</IconButton>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
