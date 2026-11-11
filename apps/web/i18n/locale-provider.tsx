'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from './config';
import type { Dictionary } from './es';

type LocaleValue = { locale: Locale; dictionary: Dictionary };
const LocaleContext = createContext<LocaleValue | null>(null);
/**
 * No dictionary is bundled here on purpose: each root layout passes only its own, so a page ships one language.
 * Tests render components without a layout; vitest.setup.ts sets Spanish as their fallback.
 */
let fallback: LocaleValue | null = null;
export const setLocaleFallback = (value: LocaleValue) => { fallback = value; };

/** Set by each root layout with its own dictionary, so a page only ships the language it shows. */
export function LocaleProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dictionary }}>{children}</LocaleContext.Provider>;
}

function useLocaleValue() {
  const value = useContext(LocaleContext) ?? fallback;
  if (!value) throw new Error('LocaleProvider missing: render inside a root layout (app/(es) or app/(en)).');
  return value;
}
export const useLocale = () => useLocaleValue().locale;
export const useDictionary = () => useLocaleValue().dictionary;
