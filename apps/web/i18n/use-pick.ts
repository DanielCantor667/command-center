import { useLocale } from './locale-provider';

/** Picks the page's language from an inline [Spanish, English] pair (module-level arrays, one-off labels). */
export function usePick() {
  const index = useLocale() === 'en' ? 1 : 0;
  return (pair: readonly [string, string]) => pair[index];
}
