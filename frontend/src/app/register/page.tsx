'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      });
      toast.success('Cuenta creada! Ahora activa tu perfil.');
      router.push('/activate');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute top-10 right-[10%] w-80 h-80 bg-brand/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-[10%] w-96 h-96 bg-padel/5 rounded-full blur-3xl animate-float-slow" />

      {/* Floating icons */}
      <div className="absolute top-[10%] left-[15%] text-5xl opacity-[0.04] animate-float-delayed select-none">🎾</div>
      <div className="absolute bottom-[15%] right-[12%] text-4xl opacity-[0.04] animate-float select-none">🏟️</div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-3xl font-bold text-gradient mb-3">
              pelotitas
            </Link>
            <h1 className="text-xl font-bold text-white mb-1">Crear cuenta</h1>
            <p className="text-text-muted text-sm">Registrate gratis y empeza a jugar</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-surface-light text-text-secondary py-3 rounded-pill font-medium text-sm mb-6 hover:bg-surface-hover transition-all border border-border-dark hover:border-border-default group"
            disabled
          >
            <svg className="w-5 h-5 opacity-60 group-hover:opacity-80 transition-opacity" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Registrarse con Google</span>
            <span className="text-2xs text-text-muted ml-1">(pronto)</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border-dark" />
            <span className="text-xs text-text-muted uppercase tracking-widest font-medium">o</span>
            <div className="flex-1 h-px bg-border-dark" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                  placeholder="Juan"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  type="text"
                  className="input"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                  placeholder="Perez"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Telefono</label>
              <input
                type="tel"
                className="input"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+54 11 5555 1234"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="label">Contrasena</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                placeholder="Min. 6 caracteres"
                autoComplete="new-password"
              />
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Al registrarte aceptas los{' '}
              <span className="text-text-secondary">terminos y condiciones</span>, incluyendo
              compartir tu numero de telefono con complejos y profesores para facilitar la comunicacion.
            </p>

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
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-text-muted text-center mt-8">
            Ya tenes cuenta?{' '}
            <Link href="/login" className="text-brand font-semibold hover:underline transition-colors">
              Ingresa
            </Link>
          </p>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
