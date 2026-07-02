import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Brand } from '../component';

describe('Brand', () => {
  it('renders the application name', () => {
    render(<Brand />);
    expect(screen.getByText('Command Center')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Brand />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
