import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { AppShell } from '../component';
import { useWorkspaceStore } from '../../workspace-store';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('AppShell', () => {
  it('mounts TopBar, Sidebar, Workspace and StatusBar together', () => {
    render(<AppShell />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('selecting a Sidebar item updates TopBar and Workspace without remounting the shell landmarks', () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('button', { name: 'Capabilities' }));

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('CAPABILITIES')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AppShell />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
