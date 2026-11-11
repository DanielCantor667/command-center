import type { ReactNode } from 'react';
import { es } from '../../i18n/es';
import { siteMetadata } from '../_root/metadata';
import { RootDocument } from '../_root/root-document';

export { viewport } from '../_root/root-document';
export const metadata = siteMetadata('es', es);

export default function SpanishLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="es" dictionary={es}>{children}</RootDocument>;
}
