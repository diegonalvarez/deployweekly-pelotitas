'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pelotitas-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Check if already running as PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isiOS);

    // Listen for the install prompt event (Android / Chrome / Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show banner after 3 seconds
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      localStorage.setItem(DISMISSED_KEY, '1');
    }, 300);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      dismiss();
    }
  }, [deferredPrompt, dismiss]);

  // Nothing to show
  if (isStandalone) return null;
  if (!visible) return null;
  if (!isIOS && !deferredPrompt) return null;

  return (
    <div
      className={`
        fixed top-[68px] left-3 right-3 z-40
        md:left-auto md:right-4 md:max-w-sm
        transition-all duration-300
        ${closing ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}
      `}
    >
      <div
        className="rounded-2xl border border-border-dark p-4"
        style={{
          background: 'rgba(24, 24, 24, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px',
        }}
      >
        {/* Green accent line */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isIOS ? (
              <>
                <p className="text-sm font-semibold text-white leading-snug">
                  Agrega Pelotitas a tu inicio
                </p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Toca{' '}
                  <svg className="inline w-3.5 h-3.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {' '}Compartir y luego &ldquo;Agregar a inicio&rdquo;
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-white leading-snug">
                  Instala Pelotitas en tu telefono
                </p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Para una mejor experiencia
                </p>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand text-black rounded-pill text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110"
                >
                  Instalar
                </button>
              )}
              <button
                onClick={dismiss}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-light text-text-muted hover:text-text-secondary transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
