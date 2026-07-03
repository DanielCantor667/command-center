import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectsModule } from '../component';

describe('ProjectsModule', () => {
  it('renders its title and description', () => {
    render(<ProjectsModule />);

    expect(screen.getByText('PROJECTS')).toBeInTheDocument();
    expect(screen.getByText('Projects has no module yet.')).toBeInTheDocument();
  });
});
