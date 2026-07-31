import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { MainLayout } from '@/components/layout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Alfa Postventa 90 — Autogestión guiada, validada y trazable',
  description:
    'Prototipo de autogestión postventa digital para Seguros Alfa. Experiencia guiada de actualización de datos de contacto con validación en tiempo real, trazabilidad completa y medición de impacto.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
