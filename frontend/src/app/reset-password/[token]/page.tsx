'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('Contrasena cambiada exitosamente!');
    } catch (err: any) {
      setError('Token invalido o expirado');
      toast.error('Token invalido o expirado');
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
            <h1 className="text-xl font-bold text-white mb-1">Nueva contrasena</h1>
            <p className="text-text-muted text-sm">Ingresa tu nueva contrasena</p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-brand/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                Contrasena cambiada! Ya podes ingresar.
              </p>
              <Link
                href="/login"
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
              >
                Ir al login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nueva contrasena</label>
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 caracteres"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="label">Confirmar contrasena</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Repeti tu contrasena"
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <p className="text-sm text-negative bg-negative/10 border border-negative/20 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}

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
                      Cambiando...
                    </span>
                  ) : 'Cambiar contrasena'}
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
