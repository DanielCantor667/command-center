import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { TopBar } from '../component';
import { useWorkspaceStore } from '../../workspace-store';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('TopBar', () => {
  it('renders the brand', () => {
    render(<TopBar />);
    expect(screen.getByText('Command Center')).toBeInTheDocument();
  });

  it('shows "System Ready" when no module is selected', () => {
    render(<TopBar />);
    expect(screen.getAllByText('System Ready').length).toBeGreaterThan(0);
  });

  it('reflects the current module label', () => {
    useWorkspaceStore.setState({ currentModule: 'projects' });
    render(<TopBar />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('exposes a header landmark', () => {
    render(<TopBar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('exposes accessible names for the placeholder controls', () => {
    render(<TopBar />);
    expect(screen.getByRole('button', { name: 'Open command palette' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TopBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
