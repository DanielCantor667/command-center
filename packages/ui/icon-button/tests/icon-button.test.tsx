import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { IconButton } from '../component';
import type { IconButtonProps } from '../types';

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

  it('does not allow a caller-supplied aria-label to override the required label', () => {
    // TypeScript's JSX checker does not apply excess-property checks to hyphenated
    // attribute names (the same reason `data-*` passes through untyped), so
    // `aria-label` can still reach this component as a JSX attribute even though
    // it's omitted from IconButtonProps (see types.ts, and the object-literal
    // check below). `label` must remain the accessible name regardless — this
    // is the runtime guarantee `component.tsx` enforces by stripping it from `rest`.
    render(
      <IconButton
        label="Close"
        {...({ 'aria-label': 'Something else' } as Record<string, string>)}
      >
        ×
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Something else' })).not.toBeInTheDocument();
  });

  it('rejects aria-label in IconButtonProps object literals at the type level', () => {
    // @ts-expect-error aria-label is intentionally omitted from IconButtonProps
    // so `label` remains the single documented accessible name.
    const props: IconButtonProps = { label: 'Close', 'aria-label': 'Something else' };
    render(<IconButton {...props}>×</IconButton>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
