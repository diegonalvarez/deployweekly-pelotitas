import type { CapacitorConfig } from '@capacitor/cli';

/* ─────────────────────────────────────────────────────────────
   Capacitor — wraps the Next.js web app into native iOS/Android.
   Strategy: "live mode" — the native shell loads the deployed
   web URL. Single codebase: web and mobile see the same SSR app.

   For local dev against a phone/emulator, set CAP_DEV_URL to your
   machine's LAN IP (e.g. http://192.168.x.x:3098).
   ───────────────────────────────────────────────────────────── */

const config: CapacitorConfig = {
  appId: 'app.pelotitas',
  appName: 'Pelotitas',
  webDir: 'public',
  server: {
    url: process.env.CAP_DEV_URL || 'https://app.pelotitas.com',
    cleartext: process.env.NODE_ENV !== 'production',
    allowNavigation: ['*.pelotitas.com', 'localhost', '*.localhost', '*.local', '192.168.*.*', '10.*.*.*'],
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0A0E14',
    // iOS-specific scroll bounce
    scrollEnabled: true,
  },
  android: {
    backgroundColor: '#0A0E14',
    allowMixedContent: false,
    // Capacitor 8: keep WebView shell native
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0A0E14',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#D4FF3F',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0E14',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
