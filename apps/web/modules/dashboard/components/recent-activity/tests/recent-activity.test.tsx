import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { RecentActivity } from '../component';

const items = [
  { id: '1', label: 'Sprint 0.6 started' },
  { id: '2', label: 'RFC approved' },
];

describe('RecentActivity', () => {
  it('renders each activity item as a list entry', () => {
    render(<RecentActivity items={items} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Sprint 0.6 started')).toBeInTheDocument();
    expect(screen.getByText('RFC approved')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RecentActivity items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
