import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Logo } from '../component';

describe('Logo', () => {
  it('renders the wordmark', () => {
    render(<Logo />);
    expect(screen.getByText('CC')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Logo />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
