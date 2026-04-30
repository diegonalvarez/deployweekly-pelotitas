'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import ActivateRoleBanner from '@/components/ActivateRoleBanner';

export default function PlayerDashboardPage() {
  return (
    <RoleGuard role="PLAYER">
      <PlayerDashboard />
    </RoleGuard>
  );
}

function PlayerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsTotal, setConnectionsTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Auth is handled by RoleGuard

  useEffect(() => {
    if (user) {
      api.get('/reservations?status=CONFIRMED').then(setReservations).catch(() => {});
      api.get('/matches/mine').then(setMatches).catch(() => {});
      api.get('/notifications/unread-count').then(setUnread).catch(() => {});
      api.get('/connections?status=ACCEPTED&limit=4').then(res => {
        setConnections(res.connections || []);
        setConnectionsTotal(res.total || 0);
      }).catch(() => {});
      api.get('/connections?status=PENDING&direction=incoming').then(res => {
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

  if (!user) return null; // RoleGuard handles auth

  const profile = user.playerProfile;

  const stats = [
    { value: profile?.matchesPlayed || 0, label: 'Partidos', icon: '🎾', color: 'text-brand' },
    { value: profile?.matchesWon || 0, label: 'Victorias', icon: '🏆', color: 'text-brand' },
    { value: reservations.length, label: 'Reservas', icon: '📅', color: 'text-padel' },
    { value: profile?.padelCategory || profile?.padelLevel || '-', label: 'Nivel', icon: '📊', color: 'text-warning' },
  ];

  const quickActions = [
    { label: 'Crear partido', href: '/matches', icon: '➕' },
    { label: 'Disponible ahora', href: '/available', icon: '🟢' },
    { label: 'Calendario', href: '/calendar', icon: '📆' },
    { label: 'Ranking', href: '/ranking', icon: '📈' },
    { label: 'Logros', href: '/achievements', icon: '🏅' },
    { label: 'Buscar complejos', href: '/clubs', icon: '🏟️' },
    { label: 'Buscar profesores', href: '/coaches', icon: '🎓' },
    { label: 'Buscar partidos', href: '/matches', icon: '🎾' },
    { label: 'Buscar rivales', href: '/players', icon: '👥' },
    { label: 'Ver torneos', href: '/tournaments', icon: '🏆' },
    { label: 'Mis conexiones', href: '/connections', icon: '🔗' },
    { label: 'Editar perfil', href: '/profile/edit', icon: '✏️' },
  ];

  const tournamentStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'REGISTRATION_OPEN': return 'Inscripcion abierta';
      case 'REGISTRATION_CLOSED': return 'Inscripcion cerrada';
      case 'IN_PROGRESS': return 'En curso';
      case 'COMPLETED': return 'Finalizado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const tournamentStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'badge-green';
      case 'COMPLETED': return 'badge-brand';
      case 'REGISTRATION_OPEN': return 'badge-yellow';
      case 'CANCELLED': return 'badge-red';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand flex items-center justify-center font-bold text-2xl border border-brand/20 shadow-glow-green-sm">
              {user.firstName[0]}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Hola, <span className="text-gradient">{user.firstName}</span>
              </h1>
              <p className="text-text-muted text-sm mt-0.5">Dashboard de jugador</p>
            </div>
          </div>

          {unread > 0 && (
            <Link
              href="/notifications"
              className="badge-red animate-pulse-glow flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread} nuevas
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className={`stat-value ${s.color}`}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Upcoming reservations */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Proximas reservas
              </h2>
              <Link href="/reservations" className="text-sm text-brand hover:underline font-medium">Ver todas</Link>
            </div>

            {reservations.length === 0 ? (
              <div className="card-elevated text-center py-12">
                <div className="text-4xl mb-3 opacity-20">📅</div>
                <p className="text-text-muted mb-4">No tenes reservas activas</p>
                <Link href="/clubs" className="btn-primary text-sm">Buscar canchas</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((r, i) => (
                  <div
                    key={r.id}
                    className="card-glow py-4 flex items-center justify-between animate-fade-in-up"
                    style={{ animationDelay: `${(i + 3) * 80}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-padel/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{r.court?.club?.name} - {r.court?.name}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(r.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} - {r.startTime}
                        </p>
                      </div>
                    </div>
                    <span className="badge-green">{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent matches */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mis partidos
              </h2>
              <Link href="/matches" className="text-sm text-brand hover:underline font-medium">Buscar partidos</Link>
            </div>

            {matches.length === 0 ? (
              <div className="card-elevated text-center py-12">
                <div className="text-4xl mb-3 opacity-20">🎾</div>
                <p className="text-text-muted mb-4">No participaste en partidos</p>
                <Link href="/matches" className="btn-primary text-sm">Buscar partidos</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 5).map((m, i) => (
                  <div
                    key={m.id}
                    className="card-glow py-4 flex items-center justify-between animate-fade-in-up"
                    style={{ animationDelay: `${(i + 3) * 80}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        m.sport === 'PADEL' ? 'bg-padel/10' : 'bg-brand/10'
                      }`}>
                        <span className="text-lg">{m.sport === 'PADEL' ? '🏸' : '🎾'}</span>
                      </div>
                      <div>
                        <span className={m.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                          {m.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                        </span>
                        <p className="text-xs text-text-muted mt-1">
                          {new Date(m.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} - {m.startTime}
                        </p>
                      </div>
                    </div>
                    <span className={m.status === 'COMPLETED' ? 'badge-green' : 'badge-yellow'}>
                      {m.status === 'COMPLETED' ? 'Jugado' : m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tournaments section */}
        <div className="animate-fade-in-up mb-10" style={{ animationDelay: '320ms' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mis torneos
            </h2>
            <Link href="/tournaments" className="text-sm text-brand hover:underline font-medium">Ver todos</Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="card-elevated text-center py-12">
              <div className="text-4xl mb-3 opacity-20">🏆</div>
              <p className="text-text-muted mb-4">No estas inscripto en ningun torneo</p>
              <Link href="/tournaments" className="btn-primary text-sm">Explorar torneos</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.slice(0, 6).map((t, i) => {
                const myTeam = t.teams?.find((team: any) =>
                  team.players?.some((p: any) => p.userId === user.id)
                );
                return (
                  <Link
                    key={t.id}
                    href={`/tournaments/${t.id}`}
                    className="card-interactive animate-fade-in-up"
                    style={{ animationDelay: `${(i + 5) * 80}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={t.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                          {t.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                        </span>
                        <span className={tournamentStatusBadge(t.status)}>
                          {tournamentStatusLabel(t.status)}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1 truncate">{t.name}</h3>
                    {t.club && (
                      <p className="text-xs text-text-muted truncate">{t.club.name}</p>
                    )}
                    {myTeam && (
                      <div className="mt-3 pt-3 border-t border-border-dark">
                        <p className="text-xs text-text-muted">
                          Equipo: <span className="text-brand font-medium">{myTeam.name || 'Mi equipo'}</span>
                        </p>
                        {myTeam.eliminated && (
                          <span className="badge-red text-xs mt-1 inline-block">Eliminado</span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Connections section */}
        <div className="animate-fade-in-up mb-10" style={{ animationDelay: '350ms' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Mis conexiones
              <span className="badge-neutral">{connectionsTotal}</span>
              {pendingCount > 0 && (
                <span className="badge-yellow text-xs">
                  {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <Link href="/connections" className="text-sm text-brand hover:underline font-medium">Ver todas</Link>
          </div>

          {connections.length === 0 ? (
            <div className="card-elevated text-center py-12">
              <div className="text-4xl mb-3 opacity-20">🔗</div>
              <p className="text-text-muted mb-4">No tenes conexiones activas</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/coaches" className="btn-secondary text-sm">Buscar profesores</Link>
                <Link href="/players" className="btn-secondary text-sm">Buscar jugadores</Link>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {connections.slice(0, 4).map((conn, i) => {
                const other = conn.fromUserId === user.id ? conn.toUser : conn.fromUser;
                const typeBadge = conn.type === 'PLAYER_COACH'
                  ? { label: 'Profesor', cls: 'badge-padel' }
                  : conn.type === 'PLAYER_CLUB'
                    ? { label: 'Club', cls: 'badge-brand' }
                    : { label: 'Jugador', cls: 'badge-tennis' };

                return (
                  <div
                    key={conn.id}
                    className="card-glow py-4 flex items-center gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${(i + 5) * 80}ms` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-padel/20 flex items-center justify-center font-bold text-white shrink-0 text-sm">
                      {other?.firstName?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {other?.firstName} {other?.lastName}
                      </p>
                      <span className={`${typeBadge.cls} text-xs mt-0.5`}>{typeBadge.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Acciones rapidas
          </h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map(a => (
              <Link
                key={a.label}
                href={a.href}
                className="btn-secondary group"
              >
                <span className="group-hover:scale-110 transition-transform inline-block">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        <ActivateRoleBanner currentRole="PLAYER" />
      </div>
    </div>
  );
}
