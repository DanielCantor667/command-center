import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CapabilitiesModule } from '../component';

describe('CapabilitiesModule', () => {
  it('renders the module title as a heading', () => {
    render(<CapabilitiesModule />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Capabilities' }),
    ).toBeInTheDocument();
  });

  it('renders all section headings', () => {
    render(<CapabilitiesModule />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Capability Groups' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Technology Profile' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Architecture Experience' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Learning Profile' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Statistics' }),
    ).toBeInTheDocument();
  });

  it('renders capability cards with evidence data', () => {
    render(<CapabilitiesModule />);
    expect(screen.getByText('Monorepo Architecture')).toBeInTheDocument();
    expect(screen.getByText('Software Architecture')).toBeInTheDocument();
    expect(screen.getByText('Frontend Development')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack Development')).toBeInTheDocument();
    expect(screen.getByText('Technical Leadership')).toBeInTheDocument();
  });

  it('renders technology experiences', () => {
    render(<CapabilitiesModule />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Turborepo')).toBeInTheDocument();
  });

  it('renders architecture pattern headings', () => {
    render(<CapabilitiesModule />);
    expect(
      screen.getByRole('heading', { name: 'monorepo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'module-system' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'design-system' }),
    ).toBeInTheDocument();
  });

  it('renders statistics panel with derived metrics', () => {
    render(<CapabilitiesModule />);
    expect(screen.getAllByText('Projects').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Technologies').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Architecture Patterns').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Engineering Decisions').length).toBeGreaterThan(0);
  });

  it('renders overview with capability count', () => {
    render(<CapabilitiesModule />);
    const labels = screen.getAllByText('Capabilities');
    const statLabel = labels.find(
      (el) => el.tagName === 'P',
    );
    expect(statLabel).toBeInTheDocument();
  });
});
