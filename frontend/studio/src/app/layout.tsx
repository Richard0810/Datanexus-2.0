
import type { Metadata } from 'next';
import { PT_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { SearchProvider } from '@/context/SearchContext';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'DataNexus',
  description: 'Plataforma educativa interactiva para el desarrollo de competencias informacionales.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${ptSans.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body">
        <AuthProvider>
          <SearchProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
