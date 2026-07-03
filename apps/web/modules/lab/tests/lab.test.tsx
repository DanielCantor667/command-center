import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LabModule } from '../component';

describe('LabModule', () => {
  it('renders its title and description', () => {
    render(<LabModule />);

    expect(screen.getByText('LAB')).toBeInTheDocument();
    expect(screen.getByText('Lab has no module yet.')).toBeInTheDocument();
  });
});
