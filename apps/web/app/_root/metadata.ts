import type { Metadata } from 'next';
import { localePath, SITE_URL, type Locale } from '../../i18n/config';
import type { Dictionary } from '../../i18n/es';

/** Both languages of a page, for `hreflang`; Spanish is the default (`x-default`). */
export const languageAlternates = (path = '/') => ({
  languages: { es: localePath('es', path), en: localePath('en', path), 'x-default': localePath('es', path) },
});

/** Site-wide metadata in one language (specs/i18n-english.md). Pages override title, description and canonical. */
export function siteMetadata(locale: Locale, { meta }: Dictionary): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: meta.title, template: '%s · Command Center' },
    description: meta.description,
    keywords: ['Daniel Cantor', 'Full-Stack Developer', locale === 'es' ? 'portafolio' : 'portfolio', 'Bogotá', 'TypeScript', 'Next.js', 'React', 'Three.js'],
    authors: [{ name: 'Daniel Cantor', url: 'https://github.com/DanielCantor667' }],
    alternates: { canonical: localePath(locale), ...languageAlternates() },
    openGraph: {
      type: 'website', locale: meta.ogLocale, alternateLocale: locale === 'es' ? 'en_US' : 'es_CO', url: localePath(locale), siteName: meta.siteName,
      title: meta.title,
      description: meta.shareDescription,
      images: [{ url: '/og/workshop-v1.jpg', width: 1200, height: 630, alt: meta.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image', title: meta.title,
      description: meta.shareDescription,
      images: ['/og/workshop-v1.jpg'],
    },
    robots: { index: true, follow: true },
  };
}
