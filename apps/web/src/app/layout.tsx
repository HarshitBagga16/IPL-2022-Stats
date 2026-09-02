import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'IPL 2022 Data Platform',
  description: 'IPL 2022 cricket statistics, match results, player profiles, and analytics',
  keywords: 'IPL 2022, cricket, statistics, players, matches',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-950">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
