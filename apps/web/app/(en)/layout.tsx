import type { ReactNode } from 'react';
import { ContentProvider } from '../../data/content/content';
import { ENGLISH_CONTENT } from '../../data/content/en';
import { en } from '../../i18n/en';
import { siteMetadata } from '../_root/metadata';
import { RootDocument } from '../_root/root-document';

export { viewport } from '../_root/root-document';
export const metadata = siteMetadata('en', en);

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="en" dictionary={en}><ContentProvider overlay={ENGLISH_CONTENT}>{children}</ContentProvider></RootDocument>;
}
