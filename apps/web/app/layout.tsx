import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider, ThemeScript } from '@command-center/ui';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './command-city.css';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://command-center-web-woad.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Command Center — Engineering Knowledge Platform',
    template: '%s · Command Center',
  },
  description:
    'Engineering Knowledge Platform: proyectos, decisiones, tecnologías y evidencia conectados en una ciudad digital explorable.',
  keywords: ['software engineering', 'knowledge graph', 'architecture', 'TypeScript', 'Next.js', 'portfolio'],
  authors: [{ name: 'Daniel Cantor' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'es_CO', url: '/', siteName: 'Command Center',
    title: 'Command Center — Engineering Knowledge Platform',
    description: 'Proyectos, decisiones, tecnologías y evidencia conectados en una ciudad digital explorable.',
    images: [{ url: '/experience/command-city-hero.png', width: 1536, height: 1024, alt: 'Command Center, ciudad de conocimiento de ingeniería' }],
  },
  twitter: {
    card: 'summary_large_image', title: 'Command Center — Engineering Knowledge Platform',
    description: 'Una ciudad digital explorable para proyectos, decisiones y evidencia de ingeniería.',
    images: ['/experience/command-city-hero.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#020807', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background-primary text-text-primary antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
