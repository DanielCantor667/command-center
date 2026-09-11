import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ThemeProvider } from '@command-center/ui';
import { AppShell } from '../component';
import { useWorkspaceStore } from '../../workspace-store';

function renderAppShell() {
  return render(<ThemeProvider><AppShell /></ThemeProvider>);
}

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('AppShell', () => {
  it('mounts TopBar, Sidebar, Workspace and StatusBar together', () => {
    renderAppShell();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('selecting a Sidebar item updates TopBar and Workspace without remounting the shell landmarks', () => {
    renderAppShell();

    fireEvent.click(screen.getByRole('button', { name: 'Capacidades' }));

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Capacidades' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderAppShell();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
