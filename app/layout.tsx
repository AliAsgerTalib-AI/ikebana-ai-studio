import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Ikebana AI Studio',
  description:
    'Mobile-first Ikebana botanical composition studio, tactile stem walkthrough workbench, and Japanese flower arrangement critique engine.',
  openGraph: {
    title: 'Ikebana AI Studio',
    description:
      'Mobile-first Ikebana botanical composition studio, tactile stem walkthrough workbench, and Japanese flower arrangement critique engine.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-[#F8F7F4] text-[#1A1B19] antialiased selection:bg-[#d0e9d3]">
        {children}
      </body>
    </html>
  );
}
