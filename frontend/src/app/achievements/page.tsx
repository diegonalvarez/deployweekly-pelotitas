'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  iconEmoji: string;
  xpReward: number;
  category: string;
}

interface UserAchievement {
  id: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
}

interface LeaderboardUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  xpPoints: number;
  _count: { achievements: number };
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [myAchievements, setMyAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'achievements' | 'leaderboard'>('achievements');

  useEffect(() => {
    const load = async () => {
      try {
        const [allAch, leaderRes] = await Promise.all([
          api.get('/achievements'),
          api.get('/achievements/leaderboard'),
        ]);
        setAchievements(allAch);
        setLeaderboard(leaderRes.users || []);

        if (user) {
          const mine = await api.get('/achievements/mine');
          setMyAchievements(mine);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const unlockedIds = new Set(myAchievements.map(ua => ua.achievementId));
  const totalXP = myAchievements.reduce((sum, ua) => sum + ua.achievement.xpReward, 0);
  const categories = Array.from(new Set(achievements.map(a => a.category)));

  const categoryLabels: Record<string, string> = {
    milestone: 'Hitos',
    tournament: 'Torneos',
    social: 'Social',
    training: 'Entrenamiento',
    general: 'General',
  };

  if (loading) {
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

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Logros
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Desbloquea logros jugando, reservando y conectando
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="stat-card px-6 py-3">
                <p className="stat-value text-brand text-xl">{totalXP} XP</p>
                <p className="stat-label">Total acumulado</p>
              </div>
              <div className="stat-card px-6 py-3">
                <p className="stat-value text-brand text-xl">{myAchievements.length}/{achievements.length}</p>
                <p className="stat-label">Desbloqueados</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setTab('achievements')}
            className={`px-5 py-2.5 rounded-pill font-semibold text-sm transition-all duration-200 ${
              tab === 'achievements'
                ? 'bg-brand text-black'
                : 'bg-surface-light text-text-secondary hover:bg-surface-hover'
            }`}
          >
            Logros
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`px-5 py-2.5 rounded-pill font-semibold text-sm transition-all duration-200 ${
              tab === 'leaderboard'
                ? 'bg-brand text-black'
                : 'bg-surface-light text-text-secondary hover:bg-surface-hover'
            }`}
          >
            Ranking XP
          </button>
        </div>

        {tab === 'achievements' && (
          <div className="space-y-10">
            {categories.map(cat => {
              const catAchievements = achievements.filter(a => a.category === cat);
              if (catAchievements.length === 0) return null;
              return (
                <div key={cat} className="animate-fade-in-up">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    {categoryLabels[cat] || cat}
                    <span className="badge-neutral text-xs">
                      {catAchievements.filter(a => unlockedIds.has(a.id)).length}/{catAchievements.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {catAchievements.map(achievement => {
                      const unlocked = unlockedIds.has(achievement.id);
                      const userAch = myAchievements.find(ua => ua.achievementId === achievement.id);
                      return (
                        <div
                          key={achievement.id}
                          className={`relative rounded-2xl p-5 text-center transition-all duration-300 border ${
                            unlocked
                              ? 'bg-brand/10 border-brand/30 shadow-glow-green-sm'
                              : 'bg-surface-light/50 border-border-dark opacity-60'
                          }`}
                        >
                          {!unlocked && (
                            <div className="absolute top-2 right-2">
                              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          )}
                          <div className={`text-3xl mb-2 ${unlocked ? '' : 'grayscale'}`}>
                            {achievement.iconEmoji}
                          </div>
                          <h3 className={`font-bold text-sm mb-1 ${unlocked ? 'text-white' : 'text-text-muted'}`}>
                            {achievement.name}
                          </h3>
                          <p className="text-text-muted text-xs mb-2 line-clamp-2">
                            {achievement.description}
                          </p>
                          <span className={`text-xs font-bold ${unlocked ? 'text-brand' : 'text-text-muted'}`}>
                            +{achievement.xpReward} XP
                          </span>
                          {unlocked && userAch && (
                            <p className="text-text-muted text-2xs mt-1">
                              {new Date(userAch.unlockedAt).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="animate-fade-in-up">
            {leaderboard.length === 0 ? (
              <div className="card-elevated text-center py-16">
                <div className="text-5xl mb-4 opacity-20">🏆</div>
                <p className="text-text-muted">No hay jugadores en el ranking todavia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, i) => {
                  const isMe = user?.id === entry.id;
                  const positionEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                  return (
                    <div
                      key={entry.id}
                      className={`card-glow py-4 flex items-center gap-4 animate-fade-in-up ${
                        isMe ? 'ring-1 ring-brand/30' : ''
                      }`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="w-8 text-center font-bold text-lg">
                        {positionEmoji || (
                          <span className="text-text-muted text-sm">{i + 1}</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-padel/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                        {entry.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${isMe ? 'text-brand' : 'text-white'}`}>
                          {entry.firstName} {entry.lastName}
                          {isMe && <span className="text-xs text-text-muted ml-2">(vos)</span>}
                        </p>
                        <p className="text-text-muted text-xs">
                          {entry._count.achievements} logros
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">{entry.xpPoints} XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="mt-10 text-center animate-fade-in-up">
            <p className="text-text-muted mb-4">Inicia sesion para ver tus logros y ganar XP</p>
            <Link href="/login" className="btn-primary">Ingresar</Link>
          </div>
        )}
      </div>
    </div>
  );
}
