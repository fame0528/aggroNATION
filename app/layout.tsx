import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CategoryProvider } from '@/contexts/category-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'aggroNATION Dashboard',
  description: 'Comprehensive AI intelligence platform for aggroNATION',
  generator: 'aggroNATION',
};

/**
 * Root layout for aggroNATION dashboard app.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased w-full min-h-screen bg-gray-900 text-white`}>
        <CategoryProvider>{children}</CategoryProvider>
      </body>
    </html>
  );
}
