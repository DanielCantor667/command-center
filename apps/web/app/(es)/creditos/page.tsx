import type { Metadata } from 'next';
import { es } from '../../../i18n/es';
import { Credits } from '../../_root/credits';
import { languageAlternates } from '../../_root/metadata';

export const metadata: Metadata = {
  title: es.meta.creditsTitle,
  description: es.meta.creditsDescription,
  alternates: { canonical: '/creditos', ...languageAlternates('/creditos') },
};

export default function CreditsPage() {
  return <Credits locale="es" />;
}
