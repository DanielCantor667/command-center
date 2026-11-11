import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { localePath, switchLocaleHref } from '../config';
import { en } from '../en';
import { es } from '../es';
import { LanguageSwitch } from '../language-switch';
import { LocaleProvider } from '../locale-provider';

describe('locale paths', () => {
  it('keeps Spanish at the root and English under /en', () => {
    expect(localePath('es')).toBe('/');
    expect(localePath('en')).toBe('/en');
    expect(localePath('es', '/creditos')).toBe('/creditos');
    expect(localePath('en', '/creditos')).toBe('/en/creditos');
  });
  it('switches language keeping the page, query and hash', () => {
    expect(switchLocaleHref('https://x.dev/?project=kliniu', 'en')).toBe('/en?project=kliniu');
    expect(switchLocaleHref('https://x.dev/en?project=kliniu&workshop=map', 'es')).toBe('/?project=kliniu&workshop=map');
    expect(switchLocaleHref('https://x.dev/en/creditos', 'es')).toBe('/creditos');
    expect(switchLocaleHref('https://x.dev/creditos#top', 'en')).toBe('/en/creditos#top');
    expect(switchLocaleHref('https://x.dev/?view=portfolio#contacto', 'en')).toBe('/en?view=portfolio#contacto');
    // "/entrada" is not the English prefix.
    expect(switchLocaleHref('https://x.dev/entrada', 'es')).toBe('/entrada');
  });
});

describe('language switch', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('links to the other language and carries the current query over on click', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, href: 'http://localhost/?project=kliniu#contacto', assign });
    render(<LanguageSwitch />);
    const link = screen.getByRole('link', { name: es.locale.switchLabel });
    expect(link).toHaveAttribute('href', '/en');
    expect(link).toHaveAttribute('hreflang', 'en');
    fireEvent.click(link);
    expect(assign).toHaveBeenCalledWith('/en?project=kliniu#contacto');
  });
  it('points back to Spanish from English and lets modified clicks open a new tab', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, href: 'http://localhost/en/creditos', assign });
    render(<LocaleProvider locale="en" dictionary={en}><LanguageSwitch path="/creditos" /></LocaleProvider>);
    const link = screen.getByRole('link', { name: en.locale.switchLabel });
    expect(link).toHaveAttribute('href', '/creditos');
    expect(link).toHaveTextContent('ES');
    fireEvent.click(link, { metaKey: true });
    expect(assign).not.toHaveBeenCalled();
  });
});
