import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Hero } from '../component';

const props = {
  name: 'Jane Doe',
  role: 'Software Engineer',
  missionStatement: 'Building things.',
  status: 'In Development',
  availability: 'Available',
  onCtaClick: vi.fn(),
};

describe('Hero', () => {
  it('renders name, role, mission statement, status and availability', () => {
    render(<Hero {...props} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Building things.')).toBeInTheDocument();
    expect(screen.getByText('Status: In Development')).toBeInTheDocument();
    expect(screen.getByText('Availability: Available')).toBeInTheDocument();
  });

  it('calls onCtaClick when the CTA is clicked', () => {
    const onCtaClick = vi.fn();
    render(<Hero {...props} onCtaClick={onCtaClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'View Projects' }));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Hero {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
