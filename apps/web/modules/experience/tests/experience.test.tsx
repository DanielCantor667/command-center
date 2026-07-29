import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExperienceModule } from '../component';

describe('ExperienceModule', () => {
  it('renders the immersive Command Center journey with real domain metrics', () => {
    render(<ExperienceModule onEnter={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Engineering Knowledge Platform' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Seis mundos. Un solo sistema.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'El conocimiento no vive en tarjetas.' })).toBeInTheDocument();
    expect(screen.getAllByText('6', { selector: 'strong' }).length).toBeGreaterThan(0);
  });

  it('opens the requested workspace module from a project district', () => {
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} />);

    fireEvent.click(screen.getByRole('button', { name: /01 Command Center/i }));

    expect(onEnter).toHaveBeenCalledWith('projects', 'command-center');
  });
});
