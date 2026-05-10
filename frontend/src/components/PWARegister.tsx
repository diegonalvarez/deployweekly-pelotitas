'use client';

import { useEffect } from 'react';
import { hideSplash, isNativeApp, styleStatusBarDark } from '@/lib/native';

/* Registers the SW for web AND initialises native chrome on Capacitor.
   Quietly no-ops in dev / unsupported browsers. */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Native side: style status bar + hide splash once the app shell loaded.
    if (isNativeApp()) {
      styleStatusBarDark();
      // Small delay to let the first paint happen before dismissing the splash.
      const t = setTimeout(() => { hideSplash(); }, 500);
      return () => clearTimeout(t);
    }

    // Web side: register service worker (production only — dev SW conflicts with HMR).
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {/* silent */});
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
  }, []);

  return null;
}
