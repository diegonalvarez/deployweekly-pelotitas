'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [sport, setSport] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (sport) params.set('sport', sport);
      const res = await api.get(`/clubs?${params}`);
      setClubs(res.clubs || []);
    } catch { setClubs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 animate-fade-in-up">
          <div>
            <h1 className="section-header mb-2">Complejos</h1>
            <p className="text-text-secondary text-lg">Encontra donde jugar cerca tuyo</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder="Ciudad..."
                className="input-search w-44"
                value={city}
                onChange={e => setCity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
            </div>

            <select
              className="input w-40 appearance-none cursor-pointer"
              value={sport}
              onChange={e => { setSport(e.target.value); }}
            >
              <option value="">Todos los deportes</option>
              <option value="PADEL">Padel</option>
              <option value="TENNIS">Tenis</option>
            </select>

            <button onClick={load} className="btn-primary">
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
              Buscando complejos...
            </div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🏟️</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No se encontraron complejos</h3>
            <p className="text-text-muted mb-6">Intenta con otra ciudad o deporte</p>
            <button onClick={() => { setCity(''); setSport(''); load(); }} className="btn-secondary">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map((club, i) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="card-interactive group animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Club header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    🏟️
                  </div>
                  <div className="flex gap-1.5">
                    {club.sports?.map((s: string) => (
                      <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                        {s === 'PADEL' ? 'Padel' : 'Tenis'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Club info */}
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand transition-colors">
                  {club.name}
                </h3>
                {club.locations?.[0] && (
                  <p className="text-sm text-text-muted mb-4 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {club.locations[0].address}, {club.locations[0].city}
                  </p>
                )}

                {/* Stats */}
                <div className="flex gap-4 pt-3 border-t border-border-dark">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                    {club._count?.courts || 0} canchas
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {club._count?.tournaments || 0} torneos
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
