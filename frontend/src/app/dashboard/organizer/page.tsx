'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import ActivateRoleBanner from '@/components/ActivateRoleBanner';

export default function OrganizerDashboardPage() {
  return <RoleGuard role="TOURNAMENT_ORGANIZER"><OrganizerDashboard /></RoleGuard>;
}

function OrganizerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tournamentCount, setTournamentCount] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/tournaments/my-count').then(setTournamentCount).catch(() => {});
      api.get('/connections?type=ORGANIZER_CLUB').then(setConnections).catch(() => {});
      setTournamentsLoading(true);
      api.get(`/tournaments?createdById=${user.id}`).then((res: any) => {
        const list = Array.isArray(res) ? res : res.tournaments || [];
        setMyTournaments(list);
      }).catch(() => {
        setMyTournaments([]);
      }).finally(() => setTournamentsLoading(false));
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  const organizer = user.organizerProfile;
  const activeConnections = connections.filter(c => c.status === 'ACCEPTED');
  const pendingConnections = connections.filter(c => c.status === 'PENDING');

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
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center text-2xl border border-warning/20">
                🏆
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Panel de organizador</h1>
                <p className="text-text-muted text-sm">Gestiona tus torneos y conexiones con complejos</p>
              </div>
            </div>
            <Link href="/tournaments/create" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear torneo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              value: tournamentCount?.used || 0,
              label: 'Torneos creados',
              icon: '🏆',
              color: 'text-brand',
            },
            {
              value: tournamentCount?.remaining || 0,
              label: 'Torneos restantes',
              icon: '🎟️',
              color: 'text-warning',
            },
            {
              value: activeConnections.length,
              label: 'Complejos conectados',
              icon: '🏟️',
              color: 'text-padel',
            },
            {
              value: organizer?.referralCount || 0,
              label: 'Referidos',
              icon: '👥',
              color: 'text-brand',
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl mb-2 block">{s.icon}</span>
              <p className={`stat-value ${s.color}`}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tournament quota */}
        {tournamentCount && (
          <div className="card-elevated mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Cuota de torneos gratuitos</p>
                <p className="text-text-muted text-sm mt-1">
                  Referencia mas usuarios para ganar torneos extra
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-2xl font-bold text-brand">{tournamentCount.used}</span>
                  <span className="text-text-muted"> / {tournamentCount.limit}</span>
                </div>
                <div className="w-28 h-2.5 bg-surface-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((tournamentCount.used / tournamentCount.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            {organizer?.referralCode && (
              <div className="mt-4 pt-4 border-t border-border-dark">
                <p className="text-sm text-text-muted">
                  Tu codigo de referido: <span className="text-brand font-mono font-bold">{organizer.referralCode}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Tournaments section */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🏆 Mis torneos
              {myTournaments.length > 0 && (
                <span className="badge-neutral">{myTournaments.length}</span>
              )}
            </h2>
            <Link href="/tournaments" className="text-sm text-brand hover:underline font-medium">Ver todos</Link>
          </div>

          {tournamentsLoading ? (
            <div className="card-elevated text-center py-12">
              <div className="flex items-center justify-center gap-3 text-text-muted">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando torneos...
              </div>
            </div>
          ) : myTournaments.length === 0 ? (
            <div className="card-elevated text-center py-12">
              <div className="text-4xl mb-3 opacity-20">🏆</div>
              <p className="text-text-muted mb-4">No creaste torneos todavia</p>
              <Link href="/tournaments/create" className="btn-primary text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Crear mi primer torneo
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myTournaments.map((t, i) => (
                <div
                  key={t.id}
                  className="card-elevated animate-fade-in-up"
                  style={{ animationDelay: `${(i + 3) * 80}ms` }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-xl shrink-0">
                        🏆
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{t.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={t.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                            {t.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                          </span>
                          <span className={tournamentStatusBadge(t.status)}>
                            {tournamentStatusLabel(t.status)}
                          </span>
                          {t.teams && (
                            <span className="badge-neutral">
                              {t.teams.length || t._count?.teams || 0} equipos
                            </span>
                          )}
                        </div>
                        {t.club && (
                          <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {t.club.name}
                          </p>
                        )}
                        {(t.startDate || t.endDate) && (
                          <p className="text-xs text-text-muted mt-1 tabular">
                            {t.startDate && formatDate(t.startDate)}
                            {t.startDate && t.endDate && ' → '}
                            {t.endDate && formatDate(t.endDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/tournaments/${t.id}/manage`}
                      className="btn-secondary text-sm shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Gestionar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Connected clubs */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🏟️ Complejos conectados
            </h2>
            {activeConnections.length === 0 ? (
              <div className="card-elevated text-center py-12">
                <div className="text-4xl mb-3 opacity-20">🔗</div>
                <p className="text-text-muted mb-4">No estas conectado a ningun complejo</p>
                <Link href="/clubs" className="btn-primary text-sm">Buscar complejos</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeConnections.map(c => (
                  <div key={c.id} className="card-glow py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-lg">🏟️</div>
                        <div>
                          <p className="font-semibold text-white">{c.toUser?.firstName} {c.toUser?.lastName}</p>
                          <p className="text-xs text-text-muted">Complejo conectado</p>
                        </div>
                      </div>
                      <span className="badge-green">Activo</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending connections */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              ⏳ Solicitudes pendientes
            </h2>
            {pendingConnections.length === 0 ? (
              <div className="card-elevated text-center py-12">
                <div className="text-4xl mb-3 opacity-20">✅</div>
                <p className="text-text-muted">No hay solicitudes pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingConnections.map(c => (
                  <div key={c.id} className="card-glow py-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{c.toUser?.firstName} {c.toUser?.lastName}</p>
                      <span className="badge-yellow">Pendiente</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buscar complejos CTA */}
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <div className="card-glow border border-padel/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-padel/10 flex items-center justify-center text-2xl shrink-0">
                  🏟️
                </div>
                <div>
                  <p className="font-bold text-white">Conectate con complejos</p>
                  <p className="text-sm text-text-muted">Para crear torneos necesitas estar conectado con un complejo</p>
                </div>
              </div>
              <Link href="/clubs" className="btn-secondary shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar complejos
              </Link>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-lg font-bold text-white mb-4">Acciones rapidas</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/tournaments/create" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear torneo
            </Link>
            <Link href="/clubs" className="btn-secondary">Buscar complejos</Link>
            <Link href="/tournaments" className="btn-secondary">Ver torneos</Link>
            <Link href="/profile/edit" className="btn-secondary">Editar perfil</Link>
          </div>
        </div>

        <ActivateRoleBanner currentRole="TOURNAMENT_ORGANIZER" />
      </div>
    </div>
  );
}
