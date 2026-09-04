import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/shared/ScrollToTop';
import { SpotifyWidget } from '@/components/shared/SpotifyWidget';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

export const viewport: import('next').Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Notes by Allieza',
    template: '%s | Notes by Allieza',
  },
  description:
    'A personal academic blog by Allieza covering cybersecurity, information assurance, software development, and programming tutorials.',
  keywords: ['cybersecurity', 'information assurance', 'software development', 'programming', 'blog'],
  authors: [{ name: 'Allieza' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Notes by Allieza',
  },
};

import { getProfile } from '@/lib/queries/profiles';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const showSpotify = profile?.show_spotify !== false;

  return (
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable}`}
      >
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          {showSpotify && <SpotifyWidget />}
        </ThemeProvider>
      </body>
    </html>
  );
}
