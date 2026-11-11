import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider, ThemeScript } from '@command-center/ui';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import './command-city.css';

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://command-center-web-woad.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Daniel Cantor — Portafolio de ingeniería',
    template: '%s · Command Center',
  },
  description:
    'Daniel Cantor, Full-Stack Developer en Bogotá. Recorre su taller 3D o lee directo los casos de Kliniu, L’ORIGINE, 4U Studio Academy y Drokex: decisiones, tecnologías y trayectoria.',
  keywords: ['Daniel Cantor', 'Full-Stack Developer', 'portafolio', 'Bogotá', 'TypeScript', 'Next.js', 'React', 'Three.js'],
  authors: [{ name: 'Daniel Cantor', url: 'https://github.com/DanielCantor667' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'es_CO', url: '/', siteName: 'El taller de Daniel',
    title: 'Daniel Cantor — Portafolio de ingeniería',
    description: 'Un taller 3D para recorrer cuatro sitios publicados, sus casos y las decisiones detrás de cada uno.',
    images: [{ url: '/og/workshop-v1.jpg', width: 1200, height: 630, alt: 'El taller 3D de Daniel Cantor: brazos robóticos, escritorio y la pared con sus proyectos' }],
  },
  twitter: {
    card: 'summary_large_image', title: 'Daniel Cantor — Portafolio de ingeniería',
    description: 'Un taller 3D para recorrer cuatro sitios publicados, sus casos y las decisiones detrás de cada uno.',
    images: ['/og/workshop-v1.jpg'],
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
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} min-h-screen bg-background-primary text-text-primary antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
