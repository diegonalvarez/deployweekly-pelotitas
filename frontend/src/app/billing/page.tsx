'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { useSubscription } from '@/lib/subscription';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import {
  Sparkles,
  Check,
  Loader2,
  ArrowRight,
  Settings,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div>}>
      <BillingPageInner />
    </Suspense>
  );
}

function BillingPageInner() {
  const { user, loading: authLoading } = useAuth();
  const sub = useSubscription();
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status');

  const [busy, setBusy] = useState<'checkout' | 'portal' | null>(null);

  // Bounce non-logged-in users to login.
  useEffect(() => {
    if (!authLoading && !user) router.push('/login?next=/billing');
  }, [authLoading, user, router]);

  // After Stripe checkout, /billing?status=success — refresh sub.
  useEffect(() => {
    if (status === 'success') {
      toast.success('Pago confirmado');
      sub.refresh();
      // Clean URL.
      router.replace('/billing');
    } else if (status === 'cancelled') {
      toast('Checkout cancelado');
      router.replace('/billing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleCheckout = async () => {
    setBusy('checkout');
    try {
      const res = await api.post<{ url: string }>('/billing/checkout', {
        successPath: '/billing?status=success',
        cancelPath:  '/billing?status=cancelled',
      });
      if (res.url) window.location.href = res.url;
      else toast.error('No se pudo abrir el checkout');
    } catch (err: any) {
      toast.error(err.message || 'Error iniciando checkout');
    } finally {
      setBusy(null);
    }
  };

  const handlePortal = async () => {
    setBusy('portal');
    try {
      const res = await api.post<{ url: string }>('/billing/portal', {});
      if (res.url) window.location.href = res.url;
      else toast.error('No se pudo abrir el portal');
    } catch (err: any) {
      toast.error(err.message || 'Error abriendo el portal');
    } finally {
      setBusy(null);
    }
  };

  if (authLoading || sub.loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
      </div>
    );
  }
  if (!user) return null;

  const features = [
    { t: 'Stats avanzados', d: 'Win-rate por torneo, racha activa, head-to-head completo' },
    { t: 'Historial ilimitado', d: 'Free guarda los últimos 50 partidos; Pro guarda todos' },
    { t: 'Insignia Pro', d: 'Tu nombre lleva una marca discreta en perfil y rankings' },
    { t: 'URL propia', d: 'pelotitas.app/p/diegonalvarez — compartible y memorable' },
    { t: 'Match cards sin marca', d: 'Compartibles a Insta/WhatsApp sin watermark "anotalo en…"' },
    { t: 'Controles de privacidad', d: 'Ocultá historial, ELO, ciudad — lo que quieras' },
    { t: 'Filtros de búsqueda guardados', d: 'Vuelve cuando hay reservas que matchean' },
    { t: 'Soporte prioritario', d: 'Pregunta y te contestamos en 24h' },
  ];

  return (
    <div className="bg-base">
      {/* Header */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <p className="eyebrow text-text-muted">Cuenta</p>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
            Suscripción
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Stripe-not-configured warning */}
        {!sub.configured && (
          <div className="card-elevated border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">Stripe no configurado</p>
                <p className="text-2xs text-text-secondary mt-1 leading-relaxed">
                  El servidor no tiene{' '}
                  <code className="text-text-primary font-mono">STRIPE_SECRET_KEY</code>{' '}
                  ni{' '}
                  <code className="text-text-primary font-mono">STRIPE_PRICE_ID</code>{' '}
                  configurados. La suscripción no se puede activar todavía.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active subscription card */}
        {sub.isActive ? (
          <div className="card-elevated relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-brand">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Activa
                </span>
                <span className="text-2xs text-text-muted uppercase tracking-widest" style={{ letterSpacing: '0.12em' }}>
                  Plan {sub.plan || 'pro'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight-2 mb-1">
                pelotitas Pro
              </h2>
              <p className="text-sm text-text-secondary">
                Tenés acceso a todas las funciones premium.
                {sub.currentPeriodEnd && (
                  <>
                    {' '}
                    {sub.cancelAtPeriodEnd ? 'Termina' : 'Próximo pago'} el{' '}
                    <span className="text-text-primary font-medium tabular">
                      {formatDate(sub.currentPeriodEnd)}
                    </span>.
                  </>
                )}
              </p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border-dark">
                <button
                  onClick={handlePortal}
                  disabled={busy === 'portal'}
                  className="btn-secondary text-sm group"
                >
                  {busy === 'portal'
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Abriendo…</>
                    : <><Settings className="w-3.5 h-3.5" /> Gestionar suscripción <ExternalLink className="w-3 h-3 opacity-60" /></>}
                </button>
                <span className="text-2xs text-text-muted">
                  Cambiar método de pago, descargar facturas, cancelar.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Upgrade card */
          <div className="card-elevated relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
            <div
              className="absolute bottom-0 left-0 w-full h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,255,63,0.3) 50%, transparent 100%)' }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="text-2xs font-semibold uppercase tracking-widest text-brand" style={{ letterSpacing: '0.15em' }}>
                  Plan Pro
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-primary tracking-tight-2 mb-2">
                Pro Player.
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-lg">
                Para jugadores que entrenan, juegan torneos, y quieren llevar su juego como pro.
                Stats serios, historial ilimitado y tu propia URL.
              </p>

              <ul className="space-y-3 mt-6">
                {features.map((f) => (
                  <li key={f.t} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-brand/15 text-brand flex items-center justify-center border border-brand/20 shrink-0 mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-display font-semibold text-text-primary">{f.t}</p>
                      <p className="text-2xs text-text-secondary leading-relaxed">{f.d}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-7 pt-6 border-t border-border-dark">
                <button
                  onClick={handleCheckout}
                  disabled={busy === 'checkout' || !sub.configured}
                  className="btn-primary text-sm h-11 px-6 group"
                >
                  {busy === 'checkout'
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Abriendo Stripe…</>
                    : <>Suscribirme ahora <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" /></>}
                </button>
                <span className="text-2xs text-text-muted">
                  Pagás con tarjeta vía Stripe · Cancelás cuando quieras
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status card (always shown, debug-friendly) */}
        <div className="card">
          <p className="eyebrow text-text-muted mb-3">Estado</p>
          <dl className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-xs">
            <DT label="Estado">
              <span className={
                sub.isActive ? 'text-brand'
                  : sub.status === 'PAST_DUE' ? 'text-warning'
                  : sub.status === 'CANCELED' ? 'text-negative'
                  : 'text-text-muted'
              }>
                {humanStatus(sub.status)}
              </span>
            </DT>
            <DT label="Plan">{sub.plan || '—'}</DT>
            <DT label="Próximo cobro">
              <span className="tabular">{formatDate(sub.currentPeriodEnd)}</span>
            </DT>
            <DT label="Cancelar al final">
              {sub.cancelAtPeriodEnd ? 'Sí' : 'No'}
            </DT>
          </dl>
        </div>

        <p className="text-2xs text-text-muted text-center pt-4">
          ¿Dudas?{' '}
          <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

function DT({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-border-dark pb-2">
      <dt className="text-2xs uppercase font-semibold text-text-muted tracking-widest" style={{ letterSpacing: '0.1em', minWidth: '110px' }}>
        {label}
      </dt>
      <dd className="text-text-primary font-medium">{children}</dd>
    </div>
  );
}

function humanStatus(s: string): string {
  switch (s) {
    case 'ACTIVE':             return 'Activa';
    case 'TRIALING':           return 'En prueba';
    case 'PAST_DUE':           return 'Pago vencido';
    case 'CANCELED':           return 'Cancelada';
    case 'INCOMPLETE':         return 'Incompleta';
    case 'INCOMPLETE_EXPIRED': return 'Expirada';
    case 'UNPAID':             return 'Sin pagar';
    case 'INACTIVE':           return 'Inactiva';
    default:                   return s;
  }
}
