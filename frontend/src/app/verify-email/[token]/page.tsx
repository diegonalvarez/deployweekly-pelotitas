'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-brand/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-padel/5 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/[0.02] rounded-full blur-3xl animate-pulse-glow" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-3xl font-bold text-gradient mb-3">
              pelotitas
            </Link>
          </div>

          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-surface-light flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-brand" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm">Verificando tu email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-brand/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Email verificado!</h1>
              <p className="text-text-muted text-sm">Tu cuenta fue verificada exitosamente.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/dashboard/player" className="btn-primary px-6 py-2.5">
                  Ir al dashboard
                </Link>
                <Link href="/activate" className="btn-outline px-6 py-2.5">
                  Activar perfiles
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-negative/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-negative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Error de verificacion</h1>
              <p className="text-text-muted text-sm">
                Token invalido o expirado. Intenta solicitar un nuevo email de verificacion.
              </p>
              <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
                Ir al login
              </Link>
            </div>
          )}
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
