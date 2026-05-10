'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Gamepad2,
  GraduationCap,
  Building2,
  Trophy,
  Check,
  Loader2,
  ArrowRight,
  Plus,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   RoleActivator — single source of truth for the
   "activá tu perfil" experience used in:
     · /activate page (full)
     · RoleGuard       (guard, when a dashboard requires a role)
     · ActivateRoleBanner (compact bottom-of-page nudge)
   ───────────────────────────────────────────────────────────── */

type Accent = 'brand' | 'sky' | 'clay';

type RoleEntry = {
  role: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: Accent;
  dashboard: string;
};

export const ROLES: RoleEntry[] = [
  {
    role: 'PLAYER',
    label: 'Jugador',
    desc: 'Reservá canchas, encontrá rivales, competí en torneos y construí tu historial deportivo.',
    Icon: Gamepad2,
    accent: 'brand',
    dashboard: '/dashboard/player',
  },
  {
    role: 'COACH',
    label: 'Profesor',
    desc: 'Publicá tu disponibilidad, recibí alumnos y gestioná tu agenda en múltiples complejos.',
    Icon: GraduationCap,
    accent: 'sky',
    dashboard: '/dashboard/coach',
  },
  {
    role: 'CLUB_OWNER',
    label: 'Complejo',
    desc: 'Registrá tu club, publicá canchas, recibí reservas online, organizá torneos.',
    Icon: Building2,
    accent: 'clay',
    dashboard: '/dashboard/club',
  },
  {
    role: 'TOURNAMENT_ORGANIZER',
    label: 'Organizador',
    desc: 'Producí torneos en complejos asociados. Llaves, brackets, rankings y premiación.',
    Icon: Trophy,
    accent: 'brand',
    dashboard: '/dashboard/organizer',
  },
];

export const ROLE_BY_KEY = Object.fromEntries(ROLES.map((r) => [r.role, r])) as Record<string, RoleEntry>;

type Mode =
  | 'full'    // standalone page (e.g. /activate)
  | 'guard'   // RoleGuard fallback (one role highlighted, blocked dashboard)
  | 'banner'; // bottom-of-page nudge (only inactive roles, denser layout)

type Props = {
  mode?: Mode;
  /** Role that brought the user here — gets a "Recomendado" badge. */
  highlight?: string;
  /** Override navigation target after activation (defaults to role.dashboard). */
  redirectTo?: string;
  /** If true, navigate after activation. Default: true for full/guard, false for banner. */
  redirectAfter?: boolean;
  /** If true, hide cards for already-active roles. Default for banner mode. */
  hideActive?: boolean;
  /** Optional context block above the grid (used by /activate). */
  intro?: React.ReactNode;
};

const accentClasses: Record<Accent, { ring: string; bg: string; text: string; bgSoft: string; border: string }> = {
  brand: { ring: 'ring-brand/40',  bg: 'bg-brand',  text: 'text-brand',  bgSoft: 'bg-brand/10',  border: 'border-brand/30'  },
  sky:   { ring: 'ring-sky/40',    bg: 'bg-sky',    text: 'text-sky',    bgSoft: 'bg-sky/10',    border: 'border-sky/30'    },
  clay:  { ring: 'ring-clay/40',   bg: 'bg-clay',   text: 'text-clay',   bgSoft: 'bg-clay/10',   border: 'border-clay/30'   },
};

export default function RoleActivator({
  mode = 'full',
  highlight,
  redirectTo,
  redirectAfter,
  hideActive,
  intro,
}: Props) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (!user) return null;

  const shouldRedirect = redirectAfter ?? mode !== 'banner';
  const hideAlreadyActive = hideActive ?? mode === 'banner';

  const list = hideAlreadyActive
    ? ROLES.filter((r) => !user.roles.includes(r.role))
    : ROLES;

  if (list.length === 0) return null;

  const handleActivate = async (role: string, dashboard: string) => {
    setLoading(role);
    try {
      await api.post('/auth/activate-profile', { role });
      await refreshUser();
      const info = ROLE_BY_KEY[role];
      toast.success(`Perfil de ${info?.label || role} activado`);
      if (shouldRedirect) router.push(redirectTo || dashboard);
    } catch (err: any) {
      toast.error(err.message || 'Error al activar perfil');
    } finally {
      setLoading(null);
    }
  };

  /* ── Card grid ──────────────────────────────── */
  const Grid = (
    <div className={`grid gap-3 ${
      mode === 'banner'
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2'
    }`}>
      {list.map((r) => {
        const isActive = user.roles.includes(r.role);
        const isHighlight = highlight === r.role && !isActive;
        const acc = accentClasses[r.accent];

        return (
          <div
            key={r.role}
            className={`
              relative group p-5 rounded-xl border transition-all duration-200
              ${isActive
                ? `bg-surface ${acc.border} border-opacity-50`
                : isHighlight
                  ? `bg-surface ${acc.border}`
                  : 'bg-surface border-border-dark hover:border-border-default'
              }
            `}
          >
            {/* Decorative gradient when highlighted */}
            {isHighlight && (
              <div
                className="absolute inset-0 rounded-xl opacity-40 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, var(--tw-gradient-from, transparent) 0%, transparent 60%)`,
                }}
              />
            )}

            <div className="relative flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${acc.border} ${acc.bgSoft} ${acc.text}`}>
                <r.Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-text-primary">{r.label}</p>
                  {isActive && (
                    <span className="badge-brand">
                      <Check className="w-3 h-3" strokeWidth={3} /> Activo
                    </span>
                  )}
                  {isHighlight && (
                    <span className={`badge ${acc.bgSoft} ${acc.text}`} style={{ boxShadow: 'none' }}>
                      Recomendado
                    </span>
                  )}
                </div>
                {mode !== 'banner' && (
                  <p className="text-2xs text-text-muted mt-1.5 leading-relaxed">{r.desc}</p>
                )}
              </div>
            </div>

            {mode === 'banner' && (
              <p className="text-2xs text-text-muted leading-relaxed mb-3 line-clamp-2">{r.desc}</p>
            )}

            <div className="relative">
              {isActive ? (
                <Link
                  href={r.dashboard}
                  className="btn-secondary text-xs h-8 w-full justify-center group/cta"
                >
                  Ir al panel
                  <ArrowRight className="w-3 h-3 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivate(r.role, r.dashboard)}
                  disabled={loading === r.role}
                  className={`text-xs h-8 w-full justify-center inline-flex items-center gap-2 rounded-lg font-semibold transition-all ${
                    isHighlight
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {loading === r.role
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Activando…</>
                    : <><Plus className="w-3 h-3" strokeWidth={3} /> Activar</>
                  }
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ── Layout per mode ──────────────────────────── */

  if (mode === 'banner') {
    return (
      <section className="card-elevated mt-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <p className="eyebrow text-text-muted">Otros perfiles</p>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight mt-1">
              También podés usar pelotitas como…
            </h3>
          </div>
          <Link
            href="/activate"
            className="text-2xs uppercase font-semibold text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
            style={{ letterSpacing: '0.1em' }}
          >
            Gestionar todos →
          </Link>
        </header>
        {Grid}
      </section>
    );
  }

  if (mode === 'guard') {
    return (
      <div className="bg-base">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {intro}
          {Grid}
        </div>
      </div>
    );
  }

  // full
  return (
    <div className="bg-base">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {intro}
        {Grid}
      </div>
    </div>
  );
}
