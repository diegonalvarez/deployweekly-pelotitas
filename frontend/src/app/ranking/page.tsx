'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface RankedPlayer {
  id: string;
  firstName: string;
  lastName: string;
  city?: string;
  padelCategory?: string;
  tennisCategory?: string;
  points: number;
  matchesWon: number;
  matchesLost: number;
  sport?: string;
}

export default function RankingPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const sportFilters = [
    { value: '', label: 'Todos' },
    { value: 'PADEL', label: 'Padel' },
    { value: 'TENNIS', label: 'Tenis' },
  ];

  const load = (p: number = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (city) params.set('city', city);
    params.set('page', String(p));
    api
      .get(`/users/ranking?${params}`)
      .then((res) => {
        setPlayers(res.players || res.ranking || []);
        setTotalPages(res.totalPages || 1);
        setPage(p);
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [sport]);

  const handleCitySearch = () => {
    load(1);
  };

  const podiumColors = [
    { bg: 'from-brand/20 to-brand/5', border: 'border-brand/40', text: 'text-brand', glow: 'shadow-[0_0_30px_rgba(30,215,96,0.15)]', label: '1ro' },
    { bg: 'from-padel/20 to-padel/5', border: 'border-padel/40', text: 'text-padel', glow: 'shadow-[0_0_30px_rgba(83,157,245,0.15)]', label: '2do' },
    { bg: 'from-warning/20 to-warning/5', border: 'border-warning/40', text: 'text-warning', glow: 'shadow-[0_0_30px_rgba(255,164,43,0.15)]', label: '3ro' },
  ];

  const getInitials = (p: RankedPlayer) =>
    `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="section-header mb-2">Ranking</h1>
          <p className="text-text-secondary text-lg">Los mejores jugadores de la comunidad</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2">
            {sportFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setSport(f.value)}
                className={`px-5 py-2 rounded-pill text-sm font-semibold transition-all duration-200 ${
                  sport === f.value
                    ? 'bg-brand text-black shadow-glow-green-sm'
                    : 'bg-surface-light text-text-secondary hover:text-white hover:bg-surface-hover'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                placeholder="Filtrar por ciudad..."
                className="input-search w-52"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              />
            </div>
            <button onClick={handleCitySearch} className="btn-ghost">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando ranking...
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🏆</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No hay datos de ranking</h3>
            <p className="text-text-muted mb-6">Aun no hay suficientes partidos jugados</p>
            <button
              onClick={() => { setCity(''); setSport(''); load(1); }}
              className="btn-secondary"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            {page === 1 && players.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                {players.slice(0, 3).map((p, idx) => {
                  const style = podiumColors[idx];
                  return (
                    <div
                      key={p.id}
                      className={`relative bg-gradient-to-br ${style.bg} border ${style.border} rounded-2xl p-6 text-center ${style.glow} transition-all duration-300 hover:scale-[1.02]`}
                    >
                      {/* Position badge */}
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface border-2 ${style.border} flex items-center justify-center text-sm font-bold ${style.text}`}>
                        {idx + 1}
                      </div>

                      <div className={`w-16 h-16 rounded-full bg-surface/50 ${style.text} flex items-center justify-center font-bold text-2xl mx-auto mt-2 mb-3 border-2 ${style.border}`}>
                        {getInitials(p)}
                      </div>

                      <h3 className="font-bold text-white text-lg mb-0.5">
                        {p.firstName} {p.lastName}
                      </h3>
                      {p.city && (
                        <p className="text-xs text-text-muted mb-3">{p.city}</p>
                      )}

                      <div className={`text-3xl font-black ${style.text} mb-1`}>
                        {p.points?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-text-muted uppercase tracking-wider">puntos</p>

                      <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-white/5">
                        <div className="text-center">
                          <p className="text-sm font-bold text-brand">{p.matchesWon || 0}</p>
                          <p className="text-2xs text-text-muted">Ganados</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-negative">{p.matchesLost || 0}</p>
                          <p className="text-2xs text-text-muted">Perdidos</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ranking Table */}
            <div className="card-elevated overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-dark">
                      <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-semibold w-16">#</th>
                      <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-semibold">Jugador</th>
                      <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-semibold hidden sm:table-cell">Ciudad</th>
                      <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-semibold hidden md:table-cell">Categoria</th>
                      <th className="text-right px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-semibold">Puntos</th>
                      <th className="text-right px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-semibold hidden sm:table-cell">G/P</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, idx) => {
                      const position = (page - 1) * 20 + idx + 1;
                      const isCurrentUser = user?.id === p.id;
                      const isTop3 = position <= 3 && page === 1;

                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-border-dark/50 transition-colors ${
                            isCurrentUser
                              ? 'bg-brand/10 hover:bg-brand/15'
                              : 'hover:bg-surface-light/50'
                          }`}
                        >
                          {/* Position */}
                          <td className="px-4 py-3.5">
                            {isTop3 ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${podiumColors[position - 1].text} bg-gradient-to-br ${podiumColors[position - 1].bg} border ${podiumColors[position - 1].border}`}>
                                {position}
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-text-muted">{position}</span>
                            )}
                          </td>

                          {/* Player */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                isCurrentUser
                                  ? 'bg-brand/20 text-brand border border-brand/30'
                                  : 'bg-surface-light text-text-secondary'
                              }`}>
                                {getInitials(p)}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-brand' : 'text-white'}`}>
                                  {p.firstName} {p.lastName}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-2xs text-brand/70 font-normal">(Vos)</span>
                                  )}
                                </p>
                                <p className="text-xs text-text-muted sm:hidden">{p.city || '-'}</p>
                              </div>
                            </div>
                          </td>

                          {/* City */}
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className="text-sm text-text-secondary">{p.city || '-'}</span>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <div className="flex gap-1.5">
                              {p.padelCategory && (
                                <span className="badge-padel text-2xs">{p.padelCategory}</span>
                              )}
                              {p.tennisCategory && (
                                <span className="badge-tennis text-2xs">{p.tennisCategory}</span>
                              )}
                              {!p.padelCategory && !p.tennisCategory && (
                                <span className="text-sm text-text-muted">-</span>
                              )}
                            </div>
                          </td>

                          {/* Points */}
                          <td className="px-4 py-3.5 text-right">
                            <span className={`text-sm font-bold ${isTop3 ? podiumColors[position - 1].text : 'text-white'}`}>
                              {p.points?.toLocaleString() || 0}
                            </span>
                          </td>

                          {/* W/L */}
                          <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                            <span className="text-sm">
                              <span className="text-brand font-semibold">{p.matchesWon || 0}</span>
                              <span className="text-text-muted mx-0.5">/</span>
                              <span className="text-negative font-semibold">{p.matchesLost || 0}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                <button
                  onClick={() => load(page - 1)}
                  disabled={page <= 1}
                  className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === 'string' ? (
                        <span key={`dots-${idx}`} className="px-2 text-text-muted">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => load(item)}
                          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                            page === item
                              ? 'bg-brand text-black'
                              : 'text-text-secondary hover:text-white hover:bg-surface-light'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => load(page + 1)}
                  disabled={page >= totalPages}
                  className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
