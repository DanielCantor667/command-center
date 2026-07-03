import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CapabilitiesModule } from '../component';

describe('CapabilitiesModule', () => {
  it('renders its title and description', () => {
    render(<CapabilitiesModule />);

    expect(screen.getByText('CAPABILITIES')).toBeInTheDocument();
    expect(screen.getByText('Capabilities has no module yet.')).toBeInTheDocument();
  });
});
