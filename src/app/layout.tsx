import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter, IBM_Plex_Mono } from 'next/font/google';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/toast';
import '@/styles/globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Thesis',
    template: '%s · Thesis',
  },
  description: 'An instrument of intellectual discipline applied to money.',
  applicationName: 'Thesis',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Matches the sidebar -- the one dark surface in the product.
  themeColor: '#0F1419',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
