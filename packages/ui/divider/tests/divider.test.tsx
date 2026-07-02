import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Divider } from '../component';

describe('Divider', () => {
  it('renders a horizontal separator by default', () => {
    render(<Divider data-testid="divider" />);
    const el = screen.getByTestId('divider');
    expect(el).toHaveAttribute('role', 'separator');
    expect(el).toHaveAttribute('aria-orientation', 'horizontal');
    expect(el).toHaveClass('w-full');
  });

  it('renders a vertical separator when requested', () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    const el = screen.getByTestId('divider');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
    expect(el).toHaveClass('h-full');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Divider />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
