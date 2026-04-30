'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (status) params.set('status', status);
    api.get(`/tournaments?${params}`).then(res => {
      setTournaments(res.tournaments || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const sportFilters = [
    { value: '', label: 'Todos' },
    { value: 'PADEL', label: 'Padel' },
    { value: 'TENNIS', label: 'Tenis' },
  ];

  const statusFilters = [
    { value: '', label: 'Todos' },
    { value: 'REGISTRATION', label: 'Inscripcion' },
    { value: 'IN_PROGRESS', label: 'En curso' },
    { value: 'FINISHED', label: 'Finalizado' },
  ];

  const statusBadgeClass = (s: string) => {
    switch (s) {
      case 'REGISTRATION': return 'badge-yellow';
      case 'GROUP_STAGE':
      case 'IN_PROGRESS':
      case 'BRACKET_STAGE': return 'badge-green';
      case 'FINISHED': return 'badge-neutral';
      default: return 'badge-yellow';
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'REGISTRATION': return 'Inscripcion';
      case 'GROUP_STAGE': return 'Fase de grupos';
      case 'BRACKET_STAGE': return 'Llave';
      case 'IN_PROGRESS': return 'En curso';
      case 'FINISHED': return 'Finalizado';
      default: return s;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="section-header mb-2">Torneos</h1>
          <p className="text-text-secondary text-lg">Participa y segui torneos de padel y tenis</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Sport pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wider mr-1">Deporte</span>
            {sportFilters.map(f => (
              <button
                key={f.value}
                onClick={() => { setSport(f.value); }}
                className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-all duration-200 ${
                  sport === f.value
                    ? 'bg-brand text-black shadow-glow-green-sm'
                    : 'bg-surface-light text-text-secondary hover:text-white hover:bg-surface-hover'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wider mr-1">Estado</span>
            {statusFilters.map(f => (
              <button
                key={f.value}
                onClick={() => { setStatus(f.value); }}
                className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-all duration-200 ${
                  status === f.value
                    ? 'bg-brand text-black shadow-glow-green-sm'
                    : 'bg-surface-light text-text-secondary hover:text-white hover:bg-surface-hover'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button onClick={load} className="btn-ghost">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando torneos...
            </div>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🏆</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No hay torneos activos</h3>
            <p className="text-text-muted">Los torneos aparecen aca cuando los organizadores los publican</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t, i) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
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
                </div>

                {/* Tournament info */}
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand transition-colors">
                  {t.name}
                </h3>
                {t.club?.name && (
                  <p className="text-sm text-text-muted mb-4 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {t.club.name}
                  </p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-5 pt-3 border-t border-border-dark text-sm">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t._count?.teams || 0} equipos
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    {t._count?.groups || 0} zonas
                  </div>
                </div>

                {t.startDate && (
                  <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Inicio: {new Date(t.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
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
