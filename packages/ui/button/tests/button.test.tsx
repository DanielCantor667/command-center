import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../component';

describe('Button', () => {
  it('renders as a native button with type="button" by default', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toHaveAttribute('type', 'button');
  });

  it('applies the primary variant className by default', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('applies size classNames', () => {
    render(<Button size="lg">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-48');
  });

  it('disables the button and blocks clicks while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Click
      </Button>,
    );
    const el = screen.getByRole('button');
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects an explicit disabled prop', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
