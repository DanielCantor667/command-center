import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { StatusBar } from '../component';

describe('StatusBar', () => {
  it('renders public portfolio information', () => {
    render(<StatusBar />);

    expect(screen.getByText('Portfolio: Público')).toBeInTheDocument();
    expect(screen.getByText('Contacto: LinkedIn + GitHub')).toBeInTheDocument();
  });

  it('exposes a footer landmark', () => {
    render(<StatusBar />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatusBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
