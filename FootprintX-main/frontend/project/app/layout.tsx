import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navbar } from '@/components/navbar';
import { FloatingChatbot } from '@/components/FloatingChatbot';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: 'FootprintX - Track Your Carbon Footprint',
  description: 'Next-generation carbon footprint tracking platform with digital and physical emission tracking',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FootprintX',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'FootprintX',
    title: 'FootprintX - Track Your Carbon Footprint',
    description: 'Next-generation carbon footprint tracking platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main>{children}</main>
            <FloatingChatbot />
          </div>
        </Providers>
      </body>
    </html>
  );
}