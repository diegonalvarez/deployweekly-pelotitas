'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      // Always show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-brand/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-padel/5 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/[0.02] rounded-full blur-3xl animate-pulse-glow" />

      {/* Floating sport icons */}
      <div className="absolute top-[15%] right-[20%] text-4xl opacity-[0.04] animate-float-delayed select-none">🎾</div>
      <div className="absolute bottom-[20%] left-[12%] text-5xl opacity-[0.04] animate-float-slow select-none">🏸</div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-3xl font-bold text-gradient mb-3">
              pelotitas
            </Link>
            <h1 className="text-xl font-bold text-white mb-1">Recuperar contrasena</h1>
            <p className="text-text-muted text-sm">
              Ingresa tu email y te enviaremos un link para resetear tu contrasena
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-brand/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                Si el email existe, te enviamos un link. Revisa tu bandeja.
              </p>
              <Link
                href="/login"
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : 'Enviar link de recuperacion'}
                </button>
              </form>

              <p className="text-sm text-text-muted text-center mt-8">
                <Link href="/login" className="text-brand font-semibold hover:underline transition-colors">
                  Volver al login
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
