import type { Metadata } from 'next';
import { en } from '../../../../i18n/en';
import { languageAlternates } from '../../../_root/metadata';

import { Credits } from '../../../_root/credits';
export const metadata: Metadata = {
  title: en.meta.creditsTitle,
  description: en.meta.creditsDescription,
  alternates: { canonical: '/en/creditos', ...languageAlternates('/creditos') },
};

// I.1: same copy as Spanish until I.2 translates it; links already stay under /en.
export default function EnglishCreditsPage() {
  return <Credits locale="en" />;
}
