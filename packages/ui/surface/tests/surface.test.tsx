import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Surface } from '../component';

describe('Surface', () => {
  it('renders children inside a div by default', () => {
    render(<Surface>content</Surface>);
    expect(screen.getByText('content').tagName).toBe('DIV');
  });

  it('applies the default variant className', () => {
    render(<Surface data-testid="surface">content</Surface>);
    expect(screen.getByTestId('surface')).toHaveClass('bg-surface-primary');
  });

  it('applies the outlined variant className', () => {
    render(
      <Surface data-testid="surface" variant="outlined">
        content
      </Surface>,
    );
    expect(screen.getByTestId('surface')).toHaveClass('border');
  });

  it('applies padding, radius and elevation classNames', () => {
    render(
      <Surface data-testid="surface" padding="lg" radius="xl" elevation="high">
        content
      </Surface>,
    );
    const el = screen.getByTestId('surface');
    expect(el).toHaveClass('p-24');
    expect(el).toHaveClass('rounded-xl');
    expect(el).toHaveClass('shadow-high');
  });

  it('marks disabled surfaces with aria-disabled and blocks pointer events', () => {
    render(
      <Surface data-testid="surface" disabled>
        content
      </Surface>,
    );
    const el = screen.getByTestId('surface');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(el).toHaveClass('pointer-events-none');
  });

  it('makes interactive surfaces keyboard-focusable', () => {
    render(
      <Surface data-testid="surface" interactive>
        content
      </Surface>,
    );
    expect(screen.getByTestId('surface')).toHaveAttribute('tabIndex', '0');
  });

  it('does not add tabIndex when interactive and disabled', () => {
    render(
      <Surface data-testid="surface" interactive disabled>
        content
      </Surface>,
    );
    expect(screen.getByTestId('surface')).not.toHaveAttribute('tabIndex');
  });

  it('renders as the child element when asChild is set', () => {
    render(
      <Surface asChild>
        <a href="/test">link</a>
      </Surface>,
    );
    expect(screen.getByRole('link', { name: 'link' }).tagName).toBe('A');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Surface interactive>content</Surface>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
