import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Command Center',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
