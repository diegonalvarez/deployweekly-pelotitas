import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth';
import { LocationProvider } from '@/lib/location';
import { SubscriptionProvider } from '@/lib/subscription';
import LayoutSwitcher from '@/components/layout/LayoutSwitcher';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import InstallPrompt from '@/components/InstallPrompt';
import PWARegister from '@/components/PWARegister';
import PushRegistrar from '@/components/PushRegistrar';
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

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
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
  // iOS safe-area: viewport-fit=cover lets us read env(safe-area-inset-*).
  viewportFit: 'cover',
  themeColor: '#0A0E14',
  // Disable iOS auto-zoom on input focus (font-size >= 16px in inputs already).
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${jetbrains.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Inline theme bootstrap to avoid flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('v5-theme');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='dark'||(!t&&m);if(d)document.documentElement.classList.add('v5-dark');}catch(e){}})();`,
          }}
        />
        {/* iOS — Add to Home Screen experience */}
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pelotitas" />
        {/* Android Chrome */}
        <meta name="application-name" content="Pelotitas" />
        <meta name="theme-color" content="#0A0E14" />
        {/* Prevent phone-number autodetection in Safari */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} bg-base text-text-primary`}>
        <PWARegister />
        <AuthProvider>
          <PushRegistrar />
          <SubscriptionProvider>
            <LocationProvider>
              <EmailVerificationBanner />
              <InstallPrompt />
              <LayoutSwitcher>{children}</LayoutSwitcher>
            </LocationProvider>
          </SubscriptionProvider>
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
