import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import '@/shared/styles/globals.scss';
import { Providers } from './providers';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Porto Seco · Averbação de documentos',
    template: '%s · Porto Seco',
  },
  description: 'Módulo de averbação e consulta de documentos de importação (DTA, DI e DUIMP).',
};

export const viewport: Viewport = {
  themeColor: '#0c2138',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
