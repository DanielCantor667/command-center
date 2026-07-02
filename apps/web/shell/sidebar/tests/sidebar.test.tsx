import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Sidebar } from '../component';
import { useWorkspaceStore } from '../../workspace-store';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('Sidebar', () => {
  it('renders every workspace module as a navigation item', () => {
    render(<Sidebar />);

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mission Log' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Communication' })).toBeInTheDocument();
  });

  it('renders the brand', () => {
    render(<Sidebar />);
    expect(screen.getByText('Command Center')).toBeInTheDocument();
  });

  it('marks no item active when no module is selected', () => {
    render(<Sidebar />);
    expect(screen.queryByRole('button', { current: 'page' })).not.toBeInTheDocument();
  });

  it('selecting an item updates the store and the active item', () => {
    render(<Sidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'Projects' }));

    expect(useWorkspaceStore.getState().currentModule).toBe('projects');
    expect(screen.getByRole('button', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
  });

  it('exposes a labelled aside landmark', () => {
    render(<Sidebar />);
    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toBeInTheDocument();
  });

  it('exposes a labelled nav landmark', () => {
    render(<Sidebar />);
    expect(screen.getByRole('navigation', { name: 'Application modules' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Sidebar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
