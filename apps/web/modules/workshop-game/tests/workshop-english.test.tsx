import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { en } from '../../../i18n/en';
import { LocaleProvider } from '../../../i18n/locale-provider';
import { WorkshopGame } from '../component';

vi.mock('../renderer-support', () => ({ supportsWorldRenderer: () => true }));
vi.mock('../world-scene', () => ({ resetWorkshopResource: vi.fn() }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));

/** Frequent Spanish words that never appear in the English interface (project names and "Bogotá" are proper nouns). */
const SPANISH = /\b(el|la|los|las|del|para|con|una|ver|volver|leer|caso|taller|proyectos|entrar|recorre|mapa|créditos|tecnologías|trayectoria|contacto)\b/i;

describe('workshop in English', () => {
  it('shows the landing and the map without Spanish interface text', () => {
    render(<LocaleProvider locale="en" dictionary={en}><WorkshopGame onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} /></LocaleProvider>);
    expect(screen.getByRole('heading', { name: en.workshop.name })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: en.workshop.credits })).toHaveAttribute('href', '/en/creditos');
    expect(document.body.textContent).not.toMatch(SPANISH);
    fireEvent.click(screen.getByRole('button', { name: en.workshop.header.map }));
    const dialog = screen.getByRole('dialog', { name: en.workshop.reader.titles.map });
    // The map lists the case studies by name; their summaries are content (phase I.3), not interface.
    expect(dialog.textContent).not.toMatch(SPANISH);
  });
});
