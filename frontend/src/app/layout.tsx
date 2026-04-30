import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import InstallPrompt from '@/components/InstallPrompt';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Pelotitas — Padel y Tenis',
  description:
    'Plataforma gratuita para clubes de padel y tenis. Reservas, torneos, profesores y mas.',
  keywords: ['padel', 'tenis', 'reservas', 'torneos', 'argentina', 'deportes'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pelotitas',
  },
  openGraph: {
    title: 'Pelotitas — Padel y Tenis',
    description: 'Tu cancha. Tu juego. Tu comunidad.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} bg-base text-text-primary`}>
        <AuthProvider>
          <Navbar />
          <EmailVerificationBanner />
          <InstallPrompt />
          <main className="min-h-screen pt-16 pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#272727',
                color: '#fff',
                border: '1px solid #282828',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#1ed760', secondary: '#000' },
              },
              error: {
                iconTheme: { primary: '#f3727f', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
