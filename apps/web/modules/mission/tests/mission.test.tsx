import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MissionModule } from '../component';

describe('MissionModule', () => {
  it('renders its title and description', () => {
    render(<MissionModule />);

    expect(screen.getByText('MISSION LOG')).toBeInTheDocument();
    expect(screen.getByText('Mission Log has no module yet.')).toBeInTheDocument();
  });
});
