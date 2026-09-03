import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';


// Metadata for the application, including title, description, and keywords
export const metadata: Metadata = {
  title: 'IPL 2022 Data Platform',
  description: 'IPL 2022 cricket statistics, match results, player profiles, and analytics',
  keywords: 'IPL 2022, cricket, statistics, players, matches',
};

// RootLayout component that wraps the entire application with HTML structure and providers
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
