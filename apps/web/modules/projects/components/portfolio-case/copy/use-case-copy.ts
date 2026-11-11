import { useMemo } from 'react';
import { useLocale } from '../../../../../i18n/locale-provider';

/** A case study's texts as [Spanish, English] pairs: the tuple makes a missing translation a type error. */
export type CaseCopy = Record<string, readonly [es: string, en: string]>;

/** The case texts in the page's language. */
export function useCaseCopy<T extends CaseCopy>(copy: T): { [K in keyof T]: string } {
  const index = useLocale() === 'en' ? 1 : 0;
  return useMemo(() => Object.fromEntries(Object.entries(copy).map(([key, pair]) => [key, pair[index]])) as { [K in keyof T]: string }, [copy, index]);
}


export { usePick } from '../../../../../i18n/use-pick';
