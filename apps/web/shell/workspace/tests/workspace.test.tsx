import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Workspace } from '../component';
import { useWorkspaceStore } from '../../workspace-store';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('Workspace', () => {
  it('renders the initial placeholder when no module is selected', () => {
    render(<Workspace />);

    expect(screen.getByText('COMMAND CENTER')).toBeInTheDocument();
    expect(screen.getByText('System Ready')).toBeInTheDocument();
    expect(screen.getByText('Waiting for Modules...')).toBeInTheDocument();
  });

  it('renders the module matching the selected id', () => {
    useWorkspaceStore.setState({ currentModule: 'lab' });
    render(<Workspace />);

    expect(screen.getByText('3D Office Studio')).toBeInTheDocument();
  });

  it('switches to a different module when currentModule changes', () => {
    useWorkspaceStore.setState({ currentModule: 'profile' });
    render(<Workspace />);

    expect(screen.getByRole('heading', { name: 'Daniel Cantor' })).toBeInTheDocument();
  });

  it('exposes a labelled main landmark', () => {
    render(<Workspace />);
    expect(screen.getByRole('main', { name: 'Workspace' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Workspace />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with a module active', async () => {
    useWorkspaceStore.setState({ currentModule: 'lab' });
    const { container } = render(<Workspace />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
