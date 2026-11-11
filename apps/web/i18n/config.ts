/** specs/i18n-english.md: Spanish lives at `/`, English under `/en`. No language detection, a link switches. */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://command-center-web-woad.vercel.app';

/** `/creditos` in Spanish, `/en/creditos` in English; `/` and `/en` for the home page. */
export function localePath(locale: Locale, path = '/') {
  const clean = path === '/' ? '' : path;
  return locale === DEFAULT_LOCALE ? clean || '/' : `/en${clean}`;
}

/** The same page in the other language, keeping query and hash (`/?project=kliniu` <-> `/en?project=kliniu`). */
export function switchLocaleHref(href: string, to: Locale) {
  const url = new URL(href, SITE_URL);
  const path = url.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return `${localePath(to, path)}${url.search}${url.hash}`;
}
