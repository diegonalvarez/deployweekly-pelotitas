import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth';
import LayoutSwitcher from '@/components/layout/LayoutSwitcher';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import InstallPrompt from '@/components/InstallPrompt';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'pelotitas — el sistema operativo de tu juego',
  description:
    'Plataforma para padel y tenis. Reservas instantáneas, torneos, profesores, ranking y más — todo en un solo lugar.',
  keywords: ['padel', 'tenis', 'reservas', 'torneos', 'argentina', 'deportes'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pelotitas',
  },
  openGraph: {
    title: 'pelotitas — el sistema operativo de tu juego',
    description: 'Reservá, competí y mejorá. Todo en un solo lugar.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0E14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${jetbrains.variable}`}>
      <body className={`${inter.className} bg-base text-text-primary`}>
        <AuthProvider>
          <EmailVerificationBanner />
          <InstallPrompt />
          <LayoutSwitcher>{children}</LayoutSwitcher>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F273A',
                color: '#F4F6FB',
                border: '1px solid #2A3142',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
              },
              success: {
                iconTheme: { primary: '#D4FF3F', secondary: '#0A0E14' },
              },
              error: {
                iconTheme: { primary: '#FF5470', secondary: '#F4F6FB' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
