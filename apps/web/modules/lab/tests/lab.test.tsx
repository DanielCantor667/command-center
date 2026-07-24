import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LabModule } from '../component';

describe('LabModule', () => {
  it('renders the office scene controls', () => {
    render(<LabModule />);

    expect(screen.getByText('3D OFFICE LAB')).toBeInTheDocument();
    expect(screen.getByLabelText('Personas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generar escena' })).toBeInTheDocument();
  });
});
