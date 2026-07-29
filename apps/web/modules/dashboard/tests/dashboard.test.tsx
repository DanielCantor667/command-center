import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { useWorkspaceStore } from '../../../shell/workspace-store';
import { DashboardModule } from '../component';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: 'dashboard' });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('DashboardModule', () => {
  it('renders all six widgets', () => {
    render(<DashboardModule />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Métricas verificables')).toBeInTheDocument();
    expect(screen.getByText('Foco actual')).toBeInTheDocument();
    expect(screen.getByText('Actividad reciente')).toBeInTheDocument();
    expect(screen.getByText('Navegación rápida')).toBeInTheDocument();
    expect(screen.getByText('Estado del sistema')).toBeInTheDocument();
  });

  it('navigates via the Hero CTA using the workspace store', () => {
    render(<DashboardModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver proyectos' }));
    expect(useWorkspaceStore.getState().currentModule).toBe('projects');
  });

  it('navigates via a Quick Navigation shortcut using the workspace store', () => {
    render(<DashboardModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Lab 3D' }));
    expect(useWorkspaceStore.getState().currentModule).toBe('lab');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DashboardModule />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
