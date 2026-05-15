'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import toast from 'react-hot-toast';

/* ─── Types ────────────────────────────────────────────────── */

interface Club {
  id: string;
  name: string;
  sports: string[];
}

interface Tournament {
  id: string;
  name: string;
  sport: 'PADEL' | 'TENNIS';
  status: string;
  startDate?: string;
  endDate?: string;
  registrationEnd?: string;
  maxTeams?: number;
  description?: string;
  _count?: { teams: number; groups: number };
  teams?: any[];
  groups?: any[];
}

/* ─── Helpers ──────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const statusBadgeClass = (s: string) => {
  switch (s) {
    case 'DRAFT': return 'badge-neutral';
    case 'REGISTRATION': return 'badge-yellow';
    case 'GROUP_STAGE': return 'badge-green';
    case 'ELIMINATION': return 'badge-padel';
    case 'COMPLETED': return 'badge-brand';
    case 'CANCELLED': return 'badge-red';
    default: return 'badge-neutral';
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'DRAFT': return 'Borrador';
    case 'REGISTRATION': return 'Inscripcion';
    case 'GROUP_STAGE': return 'Fase de grupos';
    case 'ELIMINATION': return 'Llave';
    case 'COMPLETED': return 'Finalizado';
    case 'CANCELLED': return 'Cancelado';
    default: return s;
  }
};

/* ═════════════════════════════════════════════════════════════
   MAIN PAGE
   ═════════════════════════════════════════════════════════════ */

export default function ClubTournamentsPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const [clubData, tournamentsData] = await Promise.all([
        api.get<Club>(`/clubs/${clubId}`),
        api.get<any>(`/tournaments?clubId=${clubId}`),
      ]);
      setClub(clubData);
      setTournaments(tournamentsData.tournaments || tournamentsData || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (user && clubId) fetchData();
  }, [user, clubId, fetchData]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Back link */}
        <Link
          href={`/dashboard/club/${clubId}`}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al panel del club
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Torneos
            </h1>
            {club && (
              <p className="text-text-muted text-sm mt-1">{club.name}</p>
            )}
          </div>
          <Link href={`/tournaments/create?clubId=${clubId}`} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear torneo
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <div className="stat-card px-5 py-3">
            <p className="stat-value">{tournaments.length}</p>
            <p className="stat-label">Total torneos</p>
          </div>
          <div className="stat-card px-5 py-3">
            <p className="stat-value">{tournaments.filter(t => ['GROUP_STAGE', 'ELIMINATION', 'REGISTRATION'].includes(t.status)).length}</p>
            <p className="stat-label">Activos</p>
          </div>
          <div className="stat-card px-5 py-3">
            <p className="stat-value">{tournaments.filter(t => t.status === 'COMPLETED').length}</p>
            <p className="stat-label">Finalizados</p>
          </div>
        </div>

        {/* Tournaments list */}
        {tournaments.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No tenes torneos</h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Crea tu primer torneo para empezar a organizar competencias en tu club.
            </p>
            <Link href={`/tournaments/create?clubId=${clubId}`} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear mi primer torneo
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t, i) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}/manage`}
                className="card-interactive group animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Top badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <span className={t.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                      {t.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                    </span>
                    <span className={statusBadgeClass(t.status)}>
                      {statusLabel(t.status)}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Tournament info */}
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand transition-colors">
                  {t.name}
                </h3>
                {t.description && (
                  <p className="text-sm text-text-muted mb-3 line-clamp-2">{t.description}</p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-5 pt-3 border-t border-border-dark text-sm">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t._count?.teams || t.teams?.length || 0} equipos
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    {t._count?.groups || t.groups?.length || 0} zonas
                  </div>
                </div>

                {t.startDate && (
                  <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Inicio: {formatDate(t.startDate)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
