'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import ActivateRoleBanner from '@/components/ActivateRoleBanner';
import {
  Trophy,
  CalendarCheck,
  Swords,
  TrendingUp,
  Activity,
  Link2,
  ChevronRight,
  Plus,
  Zap,
  Award,
  Users,
  GraduationCap,
  Building2,
  Target,
  Bell,
  ArrowUpRight,
} from 'lucide-react';

export default function PlayerDashboardPage() {
  return (
    <RoleGuard role="PLAYER">
      <PlayerDashboard />
    </RoleGuard>
  );
}

function PlayerDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsTotal, setConnectionsTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/reservations?status=CONFIRMED').then(setReservations).catch(() => {});
      api.get('/matches/mine').then(setMatches).catch(() => {});
      api.get('/notifications/unread-count').then(setUnread).catch(() => {});
      api.get('/connections?status=ACCEPTED&limit=4').then((res) => {
        setConnections(res.connections || []);
        setConnectionsTotal(res.total || 0);
      }).catch(() => {});
      api.get('/connections?status=PENDING&direction=incoming').then((res) => {
        setPendingCount(res.total || 0);
      }).catch(() => {});
      api.get('/tournaments').then((res: any) => {
        const list = Array.isArray(res) ? res : res.tournaments || [];
        const mine = list.filter((t: any) =>
          t.teams?.some((team: any) =>
            team.players?.some((p: any) => p.userId === user.id)
          )
        );
        setTournaments(mine);
      }).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const profile = user.playerProfile;
  const matchesPlayed = profile?.matchesPlayed || 0;
  const matchesWon = profile?.matchesWon || 0;
  const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;

  const kpis = [
    {
      label: 'Partidos',
      value: matchesPlayed,
      icon: <Swords className="w-3.5 h-3.5" />,
      hint: matchesWon > 0 ? `${matchesWon} ganados` : 'Sin partidos aún',
      trend: matchesPlayed > 0 ? 'up' : 'flat',
    },
    {
      label: 'Win rate',
      value: matchesPlayed > 0 ? `${winRate}%` : '—',
      icon: <Target className="w-3.5 h-3.5" />,
      hint: matchesPlayed > 0 ? `${matchesWon}/${matchesPlayed}` : 'Jugá un partido',
      trend: winRate >= 50 ? 'up' : winRate > 0 ? 'down' : 'flat',
    },
    {
      label: 'Reservas activas',
      value: reservations.length,
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      hint: reservations.length > 0 ? 'Ver calendario' : 'Reservá una cancha',
      trend: 'flat',
    },
    {
      label: 'Nivel',
      value: profile?.padelCategory || profile?.padelLevel || '—',
      icon: <Award className="w-3.5 h-3.5" />,
      hint: profile?.padelCategory ? 'Padel' : 'Sin categoría',
      trend: 'flat',
    },
  ];

  const tournamentStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':        return { cls: 'badge-green',   label: 'En curso' };
      case 'COMPLETED':          return { cls: 'badge-neutral', label: 'Finalizado' };
      case 'REGISTRATION_OPEN':  return { cls: 'badge-yellow',  label: 'Inscripciones' };
      case 'REGISTRATION_CLOSED':return { cls: 'badge-neutral', label: 'Cerrado' };
      case 'CANCELLED':          return { cls: 'badge-red',     label: 'Cancelado' };
      case 'DRAFT':              return { cls: 'badge-neutral', label: 'Borrador' };
      default:                   return { cls: 'badge-neutral', label: status };
    }
  };

  return (
    <div className="bg-base">
      {/* ── Page header ─────────────────────── */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <p className="eyebrow text-text-muted">Dashboard</p>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
                Hola, <span className="text-brand">{user.firstName}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unread > 0 && (
              <Link href="/notifications" className="btn-secondary text-xs h-9 hidden sm:inline-flex">
                <Bell className="w-3.5 h-3.5" />
                {unread} nuevas
              </Link>
            )}
            <Link href="/matches" className="btn-primary text-sm h-9">
              <Plus className="w-3.5 h-3.5" />
              Crear partido
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ── KPIs ─────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              className="kpi-tile animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="kpi-label">{k.label}</p>
                <span className="text-text-muted">{k.icon}</span>
              </div>
              <p className="kpi-value">{k.value}</p>
              <p className="text-2xs text-text-muted mt-1.5 flex items-center gap-1">
                {k.trend === 'up' && <TrendingUp className="w-3 h-3 text-brand" />}
                {k.hint}
              </p>
            </div>
          ))}
        </div>

        {/* ── Two-column layout ─────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── LEFT 2/3 ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Próximas reservas */}
            <SectionCard
              title="Próximas reservas"
              icon={<CalendarCheck className="w-4 h-4 text-sky" />}
              action={{ label: 'Ver todas', href: '/reservations' }}
            >
              {reservations.length === 0 ? (
                <EmptyState
                  message="No tenés reservas activas"
                  cta={{ label: 'Buscar canchas', href: '/clubs' }}
                  icon={<CalendarCheck className="w-5 h-5" />}
                />
              ) : (
                <div className="divide-y divide-border-dark">
                  {reservations.slice(0, 4).map((r) => (
                    <div key={r.id} className="py-3 flex items-center gap-3 group hover:bg-surface-light/30 -mx-2 px-2 rounded-lg transition-colors">
                      <div className="w-9 h-9 rounded-md bg-sky/10 border border-sky/20 flex items-center justify-center shrink-0">
                        <CalendarCheck className="w-4 h-4 text-sky" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {r.court?.club?.name} · {r.court?.name}
                        </p>
                        <p className="text-2xs text-text-muted mt-0.5 tabular">
                          {new Date(r.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {' · '}
                          {r.startTime}
                        </p>
                      </div>
                      <span className="badge-green">Confirmada</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Mis partidos */}
            <SectionCard
              title="Mis partidos"
              icon={<Swords className="w-4 h-4 text-brand" />}
              action={{ label: 'Buscar partidos', href: '/matches' }}
            >
              {matches.length === 0 ? (
                <EmptyState
                  message="Aún no jugaste partidos"
                  cta={{ label: 'Buscar partidos', href: '/matches' }}
                  icon={<Swords className="w-5 h-5" />}
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {matches.slice(0, 4).map((m) => {
                    const isPadel = m.sport === 'PADEL';
                    return (
                      <div
                        key={m.id}
                        className="border border-border-dark rounded-lg p-3 hover:border-border-default transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={isPadel ? 'badge-padel' : 'badge-tennis'}>
                            {isPadel ? 'Padel' : 'Tenis'}
                          </span>
                          <span className={m.status === 'COMPLETED' ? 'badge-neutral' : 'badge-yellow'}>
                            {m.status === 'COMPLETED' ? 'Jugado' : m.status}
                          </span>
                        </div>
                        <p className="text-2xs text-text-muted tabular">
                          {new Date(m.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {' · '}
                          {m.startTime}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Mis torneos */}
            <SectionCard
              title="Mis torneos"
              icon={<Trophy className="w-4 h-4 text-clay" />}
              action={{ label: 'Ver todos', href: '/tournaments' }}
            >
              {tournaments.length === 0 ? (
                <EmptyState
                  message="No estás inscripto en torneos"
                  cta={{ label: 'Explorar torneos', href: '/tournaments' }}
                  icon={<Trophy className="w-5 h-5" />}
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {tournaments.slice(0, 4).map((t) => {
                    const myTeam = t.teams?.find((team: any) =>
                      team.players?.some((p: any) => p.userId === user.id)
                    );
                    const status = tournamentStatusBadge(t.status);
                    const isPadel = t.sport === 'PADEL';
                    return (
                      <Link
                        key={t.id}
                        href={`/tournaments/${t.id}`}
                        className="border border-border-dark rounded-lg p-3.5 hover:border-border-default hover:bg-surface-light/40 transition-all group block"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                          <span className={isPadel ? 'badge-padel' : 'badge-tennis'}>
                            {isPadel ? 'Padel' : 'Tenis'}
                          </span>
                          <span className={status.cls}>{status.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                          {t.name}
                        </p>
                        {t.club && (
                          <p className="text-2xs text-text-muted truncate mt-0.5">{t.club.name}</p>
                        )}
                        {myTeam && (
                          <div className="mt-2.5 pt-2.5 border-t border-border-dark flex items-center justify-between gap-2">
                            <span className="text-2xs text-text-muted truncate">
                              Equipo: <span className="text-text-secondary font-medium">{myTeam.name || 'Mi equipo'}</span>
                            </span>
                            {myTeam.eliminated && (
                              <span className="badge-red text-2xs">Eliminado</span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── RIGHT 1/3 ─── */}
          <div className="space-y-5">
            {/* Player card (ELO/level) */}
            <div className="card-elevated relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-brand/10 blur-2xl pointer-events-none" />
              <p className="eyebrow text-text-muted mb-4">Tu perfil</p>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/30 to-brand/5 text-brand-ink font-bold text-lg flex items-center justify-center border border-brand/30">
                  {user.firstName?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-2xs text-text-muted">
                    {user.identityStatus === 'VERIFIED' ? '✓ Verificado' : 'Sin verificar'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xs text-text-muted uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>Padel</p>
                  <p className="text-2xl font-bold text-text-primary tabular tracking-tight-2 mt-0.5">
                    {profile?.padelCategory || profile?.padelLevel || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-text-muted uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>Tenis</p>
                  <p className="text-2xl font-bold text-text-primary tabular tracking-tight-2 mt-0.5">
                    {profile?.tennisCategory || profile?.tennisLevel || '—'}
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border-dark">
                <Link
                  href="/profile/edit"
                  className="text-2xs uppercase font-semibold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1"
                  style={{ letterSpacing: '0.12em' }}
                >
                  Editar perfil
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Connections */}
            <SectionCard
              title="Conexiones"
              icon={<Link2 className="w-4 h-4 text-text-secondary" />}
              extra={
                <span className="text-2xs text-text-muted tabular">
                  {connectionsTotal}
                  {pendingCount > 0 && (
                    <span className="ml-2 text-warning">
                      +{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              }
              action={{ label: 'Ver todas', href: '/connections' }}
            >
              {connections.length === 0 ? (
                <EmptyState
                  message="Sin conexiones"
                  icon={<Link2 className="w-5 h-5" />}
                  cta={{ label: 'Buscar gente', href: '/players' }}
                />
              ) : (
                <div className="space-y-2">
                  {connections.slice(0, 4).map((conn) => {
                    const other = conn.fromUserId === user.id ? conn.toUser : conn.fromUser;
                    const typeBadge =
                      conn.type === 'PLAYER_COACH' ? { label: 'Profesor', cls: 'badge-padel' } :
                      conn.type === 'PLAYER_CLUB' ? { label: 'Club', cls: 'badge-tennis' } :
                                                     { label: 'Jugador', cls: 'badge-brand' };
                    return (
                      <div key={conn.id} className="flex items-center gap-3 py-1.5">
                        <div className="w-8 h-8 rounded-md bg-surface-light text-text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                          {other?.firstName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {other?.firstName} {other?.lastName}
                          </p>
                          <span className={`${typeBadge.cls} text-2xs mt-0.5`}>{typeBadge.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Quick actions */}
            <div className="card-elevated">
              <p className="eyebrow text-text-muted mb-4">Atajos</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Disponible',   href: '/available',   icon: <Activity className="w-3.5 h-3.5" />, accent: 'brand' },
                  { label: 'Calendario',   href: '/calendar',    icon: <CalendarCheck className="w-3.5 h-3.5" />, accent: 'sky' },
                  { label: 'Ranking',      href: '/ranking',     icon: <TrendingUp className="w-3.5 h-3.5" />, accent: 'clay' },
                  { label: 'Logros',       href: '/achievements',icon: <Award className="w-3.5 h-3.5" />, accent: 'brand' },
                  { label: 'Profesores',   href: '/coaches',     icon: <GraduationCap className="w-3.5 h-3.5" />, accent: 'sky' },
                  { label: 'Complejos',    href: '/clubs',       icon: <Building2 className="w-3.5 h-3.5" />, accent: 'clay' },
                ].map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className={`flex items-center gap-2 p-2.5 rounded-md border border-border-dark hover:border-border-default hover:bg-surface-light/50 transition-all group`}
                  >
                    <span className={`shrink-0 ${
                      a.accent === 'brand' ? 'text-brand' :
                      a.accent === 'sky'   ? 'text-sky'   :
                      'text-clay'
                    }`}>
                      {a.icon}
                    </span>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary truncate">
                      {a.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ActivateRoleBanner currentRole="PLAYER" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Local primitives
   ───────────────────────────────────────────────────────────── */
function SectionCard({
  title,
  icon,
  action,
  extra,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: { label: string; href: string };
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card-elevated">
      <header className="flex items-center justify-between gap-3 mb-4 -mx-1">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
          {extra}
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-2xs font-semibold uppercase text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1 shrink-0"
            style={{ letterSpacing: '0.1em' }}
          >
            {action.label}
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function EmptyState({
  message,
  icon,
  cta,
}: {
  message: string;
  icon?: React.ReactNode;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="text-center py-8">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-surface-light text-text-muted mx-auto mb-3 flex items-center justify-center">
          {icon}
        </div>
      )}
      <p className="text-sm text-text-muted mb-4">{message}</p>
      {cta && (
        <Link href={cta.href} className="btn-secondary text-xs h-8">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
