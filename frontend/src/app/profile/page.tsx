'use client';

import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TimelineActivity {
  id: string;
  type: 'MATCH' | 'RESERVATION' | 'TOURNAMENT' | 'CLASS';
  description: string;
  date: string;
}

const ACTIVITY_ICONS: Record<string, string> = {
  MATCH: '🎾',
  RESERVATION: '📅',
  TOURNAMENT: '🏆',
  CLASS: '🎓',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState<TimelineActivity[]>([]);
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineHasMore, setTimelineHasMore] = useState(false);
  const [timelinePrivate, setTimelinePrivate] = useState(false);

  const loadTimeline = (page: number) => {
    if (!user) return;
    setTimelineLoading(true);
    api
      .get(`/users/${user.id}/timeline?page=${page}`)
      .then((res) => {
        const activities = res.activities || res.timeline || [];
        if (page === 1) {
          setTimeline(activities);
        } else {
          setTimeline((prev) => [...prev, ...activities]);
        }
        setTimelinePage(page);
        setTimelineHasMore(activities.length >= 10);
        setTimelinePrivate(false);
      })
      .catch((err) => {
        if (page === 1) {
          setTimeline([]);
          // If 403 or empty, the user may have their history private
          if (err.message?.includes('403') || err.message?.includes('privado')) {
            setTimelinePrivate(true);
          }
        }
      })
      .finally(() => setTimelineLoading(false));
  };

  useEffect(() => {
    if (user) loadTimeline(1);
  }, [user?.id]);

  if (!user) {
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

  const profile = user.playerProfile;

  const roleLabels: Record<string, string> = {
    PLAYER: 'Jugador',
    COACH: 'Profesor',
    CLUB_OWNER: 'Complejo',
    TOURNAMENT_ORGANIZER: 'Organizador',
    ADMIN: 'Admin',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mi perfil</h1>
          <Link href="/profile/edit" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
        </div>

        {/* Profile card */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand flex items-center justify-center text-3xl font-bold border border-brand/20 shadow-glow-green-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-text-muted text-sm mt-0.5">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.roles.map(r => (
                  <span key={r} className="badge-brand">{roleLabels[r] || r}</span>
                ))}
                {user.roles.length === 0 && (
                  <Link href="/activate" className="badge-yellow hover:brightness-110 transition-all">
                    Activar perfil
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sports profile */}
        {profile && (
          <div className="card-elevated animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Perfil deportivo
            </h3>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-surface-light rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Partidos</p>
                <p className="text-2xl font-bold text-white">{profile.matchesPlayed || 0}</p>
              </div>
              <div className="bg-surface-light rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Ganados</p>
                <p className="text-2xl font-bold text-brand">{profile.matchesWon || 0}</p>
              </div>
              <div className="bg-surface-light rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Perdidos</p>
                <p className="text-2xl font-bold text-negative">{profile.matchesLost || 0}</p>
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Ciudad</p>
                <p className="text-sm text-text-secondary">{profile.city || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Mano habil</p>
                <p className="text-sm text-text-secondary">
                  {profile.hand === 'RIGHT' ? 'Derecha' :
                   profile.hand === 'LEFT' ? 'Izquierda' :
                   profile.hand === 'AMBIDEXTROUS' ? 'Ambidiestro' : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Nivel Padel</p>
                <p className="text-sm text-text-secondary">
                  {profile.padelLevel ? (
                    <span className="text-padel font-semibold">{profile.padelLevel}</span>
                  ) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Nivel Tenis</p>
                <p className="text-sm text-text-secondary">
                  {profile.tennisLevel ? (
                    <span className="text-brand font-semibold">{profile.tennisLevel}</span>
                  ) : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Bio</p>
                <p className="text-sm text-text-secondary leading-relaxed">{profile.bio || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="card-elevated mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Timeline
          </h3>

          {timelinePrivate ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-20">🔒</div>
              <p className="text-text-muted">Este jugador tiene su historial privado</p>
            </div>
          ) : timelineLoading && timeline.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-text-muted">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando actividad...
              </div>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-20">📋</div>
              <p className="text-text-muted">Aun no hay actividad reciente</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {timeline.map((activity, idx) => (
                  <div
                    key={activity.id || idx}
                    className="flex items-start gap-4 py-3 px-3 -mx-3 rounded-xl hover:bg-surface-light/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                      {ACTIVITY_ICONS[activity.type] || '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {activity.description}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(activity.date).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {timelineHasMore && (
                <div className="mt-4 pt-4 border-t border-border-dark text-center">
                  <button
                    onClick={() => loadTimeline(timelinePage + 1)}
                    disabled={timelineLoading}
                    className="btn-ghost text-sm disabled:opacity-50"
                  >
                    {timelineLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Cargando...
                      </span>
                    ) : (
                      'Ver mas'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
