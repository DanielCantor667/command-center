import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileModule } from '../component';

describe('ProfileModule', () => {
  it('renders the engineer profile and derived evidence', () => {
    render(<ProfileModule />);

    expect(screen.getByRole('heading', { name: 'Daniel Cantor' })).toBeInTheDocument();
    expect(screen.getByText('Huella verificable')).toBeInTheDocument();
  });
});
