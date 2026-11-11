import type { MetadataRoute } from 'next';
import { localePath, SITE_URL } from '../i18n/config';

/** Every page in both languages, each pointing at its translation (specs/i18n-english.md). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [{ path: '/', changeFrequency: 'weekly', priority: 1 }, { path: '/creditos', changeFrequency: 'monthly', priority: 0.3 }] as const;
  return pages.flatMap(({ path, changeFrequency, priority }) => (['es', 'en'] as const).map(locale => ({
    url: `${SITE_URL}${localePath(locale, path)}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages: { es: `${SITE_URL}${localePath('es', path)}`, en: `${SITE_URL}${localePath('en', path)}` } },
  })));
}
