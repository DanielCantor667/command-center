import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileModule } from '../component';

describe('ProfileModule', () => {
  it('renders its title and description', () => {
    render(<ProfileModule />);

    expect(screen.getByText('PROFILE')).toBeInTheDocument();
    expect(screen.getByText('Profile has no module yet.')).toBeInTheDocument();
  });
});
