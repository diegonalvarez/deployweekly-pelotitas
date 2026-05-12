'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

/** Only allow same-origin paths in the ?next= param to avoid open-redirect. */
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}
import { COUNTRIES, STATES_BY_COUNTRY, useLocation, isValidE164 } from '@/lib/location';
import PhoneInput from '@/components/PhoneInput';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Plane,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const setManualLocation = useLocation().setManual;
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams?.get('next') ?? null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',

    // Home (origin)
    homeCountry: 'Argentina',
    homeState: '',
    homeCity: '',

    // Current (where the user is right now — optional, defaults to home)
    travelling: false,
    currentCountry: '',
    currentState: '',
    currentCity: '',
  });
  const [loading, setLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const homeStates = STATES_BY_COUNTRY[form.homeCountry] || null;
  const currentStates = form.currentCountry ? STATES_BY_COUNTRY[form.currentCountry] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone format if provided.
    if (form.phone && !isValidE164(form.phone)) {
      toast.error('Revisá el número de celular');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      };

      // Send location only if user opted in
      if (locationOpen) {
        if (form.homeCountry) payload.homeCountry = form.homeCountry;
        if (form.homeState)   payload.homeState   = form.homeState;
        if (form.homeCity)    payload.homeCity    = form.homeCity;

        if (form.travelling && form.currentCountry) {
          payload.currentCountry = form.currentCountry;
          if (form.currentState) payload.currentState = form.currentState;
          if (form.currentCity)  payload.currentCity  = form.currentCity;
        }
      }

      await register(payload);

      // Seed the LocationContext so the new user already has an active filter.
      const effectiveCountry = form.travelling ? form.currentCountry : form.homeCountry;
      const effectiveState   = form.travelling ? form.currentState   : form.homeState;
      const effectiveCity    = form.travelling ? form.currentCity    : form.homeCity;
      if (locationOpen && effectiveCountry) {
        setManualLocation({
          country: effectiveCountry,
          state: effectiveState || undefined,
          city: effectiveCity || undefined,
        });
      }

      // If the caller wanted to go somewhere specific (eg /clubs/X?court=Y),
      // jump there directly so the user doesn't lose context. Profile
      // activation can happen later from any RoleGuard.
      if (next) {
        toast.success('Cuenta creada. Vamos a tu reserva.');
        router.push(next);
      } else {
        toast.success('Cuenta creada. Ahora activá tu perfil.');
        router.push('/activate');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-court-grid opacity-40 pointer-events-none" />
      <div
        className="absolute top-10 right-[10%] w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,255,63,0.4) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-10 left-[10%] w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(107,169,255,0.4) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass p-7 sm:p-9">
          {/* Header */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-0 group text-lg font-bold tracking-tight">
              <span className="text-text-primary">pelot</span>
              <span className="text-text-primary relative">
                <span className="relative">
                  i
                  <span
                    className="absolute -top-[0.1em] left-1/2 -translate-x-1/2 brand-dot"
                    style={{ width: '0.22em', height: '0.22em' }}
                    aria-hidden="true"
                  />
                </span>
              </span>
              <span className="text-text-primary">tas</span>
            </Link>
            <p className="eyebrow text-text-muted mt-3">Crear cuenta</p>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
              Empezá a jugar
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Registrate gratis. Sin tarjeta, sin compromiso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  placeholder="Pérez"
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
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Celular</label>
              <PhoneInput
                value={form.phone}
                onChange={(e164) => setForm({ ...form, phone: e164 })}
                defaultCountryName={form.homeCountry}
                placeholder="11 5555 1234"
                autoComplete="tel"
              />
              <p className="text-2xs text-text-muted mt-1.5">
                Lo guardamos en formato internacional. Te puede contactar tu club o profesor.
              </p>
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>

            {/* ── Location (collapsible, optional) ─────────────────── */}
            <div className="border border-border-dark rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-light/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span className="text-sm font-medium text-text-primary">
                    Tu ubicación
                  </span>
                  <span className="text-2xs text-text-muted">opcional</span>
                </div>
                {locationOpen
                  ? <ChevronUp className="w-4 h-4 text-text-muted" />
                  : <ChevronDown className="w-4 h-4 text-text-muted" />
                }
              </button>

              {locationOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border-dark animate-fade-in">
                  <p className="text-2xs text-text-muted leading-relaxed">
                    Ayudanos a mostrarte clubes, torneos y rivales cerca tuyo.
                  </p>

                  {/* Home location */}
                  <div className="space-y-3">
                    <p className="text-2xs uppercase font-semibold text-text-secondary tracking-widest" style={{ letterSpacing: '0.1em' }}>
                      ¿De dónde sos?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">País</label>
                        <select
                          className="input"
                          value={form.homeCountry}
                          onChange={(e) => setForm({ ...form, homeCountry: e.target.value, homeState: '' })}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">{homeStates ? 'Provincia' : 'Estado'}</label>
                        {homeStates ? (
                          <select
                            className="input"
                            value={form.homeState}
                            onChange={(e) => setForm({ ...form, homeState: e.target.value })}
                          >
                            <option value="">Cualquiera</option>
                            {homeStates.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="input"
                            value={form.homeState}
                            onChange={(e) => setForm({ ...form, homeState: e.target.value })}
                            placeholder="Estado"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="label">Ciudad</label>
                      <input
                        type="text"
                        className="input"
                        value={form.homeCity}
                        onChange={(e) => setForm({ ...form, homeCity: e.target.value })}
                        placeholder="Ej. Capital Federal"
                      />
                    </div>
                  </div>

                  {/* Travelling toggle */}
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      travelling: !form.travelling,
                      currentCountry: !form.travelling ? '' : form.currentCountry,
                    })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      form.travelling
                        ? 'bg-clay/8 border-clay/30 text-text-primary'
                        : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      form.travelling ? 'bg-clay text-white' : 'bg-surface text-text-muted'
                    }`}>
                      <Plane className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        Estoy en otro lugar ahora
                      </p>
                      <p className="text-2xs text-text-muted mt-0.5">
                        Estás de viaje, vacaciones, mudanza temporal…
                      </p>
                    </div>
                    <div className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${
                      form.travelling ? 'bg-clay' : 'bg-border-default'
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        form.travelling ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </button>

                  {/* Current location (only if travelling) */}
                  {form.travelling && (
                    <div className="space-y-3 pl-3 border-l-2 border-clay/30 animate-fade-in">
                      <p className="text-2xs uppercase font-semibold text-clay tracking-widest" style={{ letterSpacing: '0.1em' }}>
                        ¿Dónde estás ahora?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">País</label>
                          <select
                            className="input"
                            value={form.currentCountry}
                            onChange={(e) => setForm({ ...form, currentCountry: e.target.value, currentState: '' })}
                            required={form.travelling}
                          >
                            <option value="">Seleccionar…</option>
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label">{currentStates ? 'Provincia' : 'Estado'}</label>
                          {currentStates ? (
                            <select
                              className="input"
                              value={form.currentState}
                              onChange={(e) => setForm({ ...form, currentState: e.target.value })}
                            >
                              <option value="">Cualquiera</option>
                              {currentStates.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="input"
                              value={form.currentState}
                              onChange={(e) => setForm({ ...form, currentState: e.target.value })}
                              placeholder="Estado"
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="label">Ciudad</label>
                        <input
                          type="text"
                          className="input"
                          value={form.currentCity}
                          onChange={(e) => setForm({ ...form, currentCity: e.target.value })}
                          placeholder="Ej. Ciudad de México"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-2xs text-text-muted leading-relaxed">
              Al registrarte aceptás los{' '}
              <span className="text-text-secondary underline">términos y condiciones</span>, incluyendo
              compartir tu número de teléfono con complejos y profesores para facilitar la comunicación.
            </p>

            <button
              type="submit"
              className="btn-primary w-full h-11 text-sm group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando cuenta…
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-text-muted text-center mt-7">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-brand font-semibold hover:text-brand-dark transition-colors">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
