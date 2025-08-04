import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';

import { config } from '@/config/wagmi';
import { Web3Provider } from '@/components/providers/web3-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import './globals.css';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Etherlink-X | Cross-Chain DeFi Hub & Bridge',
  description: 'Seamlessly bridge, swap, and earn across multiple L2s with Etherlink-X',
  keywords: [
    'ethereum', 'bridge', 'l2', 'layer 2', 'defi', 'etherlink', 'arbitrum', 'optimism', 
    'base', 'polygon', 'cross-chain', 'swap', 'yield', 'liquidity'
  ],
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://etherlink-x.vercel.app',
    title: 'Etherlink-X | Cross-Chain DeFi Hub & Bridge',
    description: 'Seamlessly bridge, swap, and earn across multiple L2s with Etherlink-X',
    siteName: 'Etherlink-X',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Etherlink-X - Cross-Chain DeFi Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Etherlink-X | Cross-Chain DeFi Hub & Bridge',
    description: 'Seamlessly bridge, swap, and earn across multiple L2s with Etherlink-X',
    images: ['/og-image.jpg'],
    creator: '@etherlinkx',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'));

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.variable,
        'bg-gradient-to-b from-background to-muted/20',
        'text-foreground/90',
        'flex flex-col min-h-screen'
      )}>
        <Web3Provider initialState={initialState}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="flex flex-col flex-1">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
