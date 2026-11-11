import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider, ThemeScript } from '@command-center/ui';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Locale } from '../../i18n/config';
import type { Dictionary } from '../../i18n/es';
import { LocaleProvider } from '../../i18n/locale-provider';
import '../globals.css';
import '../command-city.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

// Display face for the workshop headings (Sprint 11.1).
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const viewport: Viewport = { themeColor: '#020807', colorScheme: 'dark' };

/** The `<html>` of either language: each route group has its own root layout so `lang` is right without JavaScript. */
export function RootDocument({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} min-h-screen bg-background-primary text-text-primary antialiased`}
      >
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
