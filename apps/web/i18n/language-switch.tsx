'use client';

import type { MouseEvent } from 'react';
import { localePath, switchLocaleHref } from './config';
import { useDictionary, useLocale } from './locale-provider';
import styles from './language-switch.module.css';

/**
 * ES / EN link. A real `<a>` (works without JavaScript, opens in a new tab); on click it carries the current query and
 * hash over (`?project=kliniu`, `#contacto`), which the static href cannot know. `path` is the page in both languages.
 */
export function LanguageSwitch({ className, path = '/' }: { className?: string; path?: string }) {
  const locale = useLocale();
  const { locale: text } = useDictionary();
  const to = locale === 'es' ? 'en' : 'es';
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.location.assign(switchLocaleHref(window.location.href, to));
  };
  return <a className={className ? `${styles.switch} ${className}` : styles.switch} href={localePath(to, path)} hrefLang={to} lang={to} aria-label={text.switchLabel} onClick={follow}>{text.switchTo}</a>;
}
