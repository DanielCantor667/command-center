import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CurrentFocus } from '../component';

describe('CurrentFocus', () => {
  it('renders the project title and status as text', () => {
    render(<CurrentFocus title="Command Center OS" status="In Development" />);

    expect(screen.getByText('Construyendo: Command Center OS')).toBeInTheDocument();
    expect(screen.getByText('Estado: In Development')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CurrentFocus title="Command Center OS" status="In Development" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
