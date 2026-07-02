import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { StatusBar } from '../component';

describe('StatusBar', () => {
  it('renders version, theme and branch information', () => {
    render(<StatusBar />);

    expect(screen.getByText('Version: v0.1.0-dev')).toBeInTheDocument();
    expect(screen.getByText('Theme: System')).toBeInTheDocument();
    expect(screen.getByText('Branch: main')).toBeInTheDocument();
  });

  it('renders connection, build and FPS information', () => {
    render(<StatusBar />);

    expect(screen.getByText('Connection: Online')).toBeInTheDocument();
    expect(screen.getByText('Build: Passing')).toBeInTheDocument();
    expect(screen.getByText('FPS: 60')).toBeInTheDocument();
  });

  it('exposes a footer landmark', () => {
    render(<StatusBar />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatusBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
