import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CreditsPage from './page';

describe('Créditos de modelos', () => {
  it('atribuye los 13 modelos, sus fuentes, licencia y cambios', () => {
    render(<CreditsPage />);
    const section = screen.getByRole('region', { name: 'Modelos con atribución' });
    const entries = within(section).getAllByRole('listitem');
    expect(entries).toHaveLength(13);
    for (const entry of entries) {
      const source = within(entry).getByRole('link', { name: /en Sketchfab$/ });
      expect(source).toHaveAttribute('href', expect.stringMatching(/^https:\/\/sketchfab\.com\/3d-models\//));
      expect(source).toHaveAccessibleName(/^Ver modelo /);
      expect(within(entry).getByText(/^Por /)).toBeInTheDocument();
    }
    expect(within(section).getByRole('link', { name: /Creative Commons Attribution 4\.0/ }))
      .toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    expect(within(section).getByText(/se reescalaron.*se redujeron sus polígonos/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Animated Robot' })).toHaveAttribute('href', 'https://quaternius.itch.io/lowpoly-robot');
    expect(screen.getAllByRole('link', { name: /Volver al taller/ })[0]).toHaveAttribute('href', '/');
  });
});
