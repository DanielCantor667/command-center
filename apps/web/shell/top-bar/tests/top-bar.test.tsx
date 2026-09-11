import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ThemeProvider } from '@command-center/ui';
import { TopBar } from '../component';
import { useWorkspaceStore } from '../../workspace-store';

function renderTopBar() {
  return render(<ThemeProvider><TopBar /></ThemeProvider>);
}

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('TopBar', () => {
  it('renders the brand', () => {
    renderTopBar();
    expect(screen.getByText('Command Center / Taller digital')).toBeInTheDocument();
  });

  it('shows the portfolio label when no module is selected', () => {
    renderTopBar();
    expect(screen.getByText('Laboratorio')).toBeInTheDocument();
  });

  it('reflects the current module label', () => {
    useWorkspaceStore.setState({ currentModule: 'projects' });
    renderTopBar();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
  });

  it('exposes a header landmark', () => {
    renderTopBar();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('returns to the city from the shared header', () => {
    const back = vi.fn();
    render(<TopBar onReturnToCity={back} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(back).toHaveBeenCalledOnce();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderTopBar();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
