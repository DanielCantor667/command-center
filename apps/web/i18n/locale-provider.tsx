'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type Locale } from './config';
import { es, type Dictionary } from './es';

const LocaleContext = createContext<{ locale: Locale; dictionary: Dictionary }>({ locale: DEFAULT_LOCALE, dictionary: es });

/** Set by each root layout with its own dictionary, so a page only ships the language it shows. */
export function LocaleProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dictionary }}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext).locale;
export const useDictionary = () => useContext(LocaleContext).dictionary;
