import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { QuickStats } from '../component';

const stats = [
  { label: 'Projects', value: '12' },
  { label: 'Articles', value: '4' },
];

describe('QuickStats', () => {
  it('renders each stat label and value', () => {
    render(<QuickStats stats={stats} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<QuickStats stats={stats} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
