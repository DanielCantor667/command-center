import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { SidebarItem } from '../component';

describe('SidebarItem', () => {
  it('renders the label', () => {
    render(<SidebarItem label="Dashboard" />);
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('marks the active item with aria-current', () => {
    render(<SidebarItem label="Dashboard" active />);
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when inactive', () => {
    render(<SidebarItem label="Dashboard" />);
    expect(screen.getByRole('button', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<SidebarItem label="Dashboard" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SidebarItem label="Dashboard" active />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
