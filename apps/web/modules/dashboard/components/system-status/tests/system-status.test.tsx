import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { SystemStatus } from '../component';

const items = [
  { label: 'Theme', value: 'System' },
  { label: 'Build', value: 'Passing' },
];

describe('SystemStatus', () => {
  it('renders each status indicator', () => {
    render(<SystemStatus items={items} />);

    expect(screen.getByText('Theme: System')).toBeInTheDocument();
    expect(screen.getByText('Build: Passing')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SystemStatus items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
