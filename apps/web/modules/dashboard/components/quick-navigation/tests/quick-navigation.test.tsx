import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { QuickNavigation } from '../component';

describe('QuickNavigation', () => {
  it('renders a shortcut button for every navigation target', () => {
    render(<QuickNavigation onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Proyectos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mission Log' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Capacidades' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lab 3D' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contacto' })).toBeInTheDocument();
  });

  it('calls onNavigate with the matching target id when a button is clicked', () => {
    const onNavigate = vi.fn();
    render(<QuickNavigation onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Lab 3D' }));
    expect(onNavigate).toHaveBeenCalledWith('lab');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<QuickNavigation onNavigate={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
