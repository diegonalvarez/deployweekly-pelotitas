'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/auth/send-verification');
      toast.success('Email de verificacion enviado! Revisa tu bandeja.');
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar email de verificacion');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-200/90">
              Verifica tu email para acceder a todas las funcionalidades
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 rounded-pill border border-yellow-500/20 transition-all disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Reenviar email de verificacion'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-500/60 hover:text-yellow-400 transition-colors p-1"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
