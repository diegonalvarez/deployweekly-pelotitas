'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('');
  const [city, setCity] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sport) params.set('sport', sport);
      if (city) params.set('city', city);
      const res = await api.get(`/coaches?${params}`);
      setCoaches(res.coaches || []);
      setTotal(res.total || 0);
    } catch {
      setCoaches([]);
      setTotal(0);
    }
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
            <h1 className="section-header mb-2">Profesores</h1>
            <p className="text-text-secondary text-lg">
              Encontra el profesor ideal para mejorar tu juego
              {!loading && total > 0 && (
                <span className="text-text-muted ml-2">({total} resultados)</span>
              )}
            </p>
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
              onChange={e => setSport(e.target.value)}
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
              Buscando profesores...
            </div>
          </div>
        ) : coaches.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🎓</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No se encontraron profesores</h3>
            <p className="text-text-muted mb-6">Intenta con otra ciudad o deporte</p>
            <button onClick={() => { setCity(''); setSport(''); load(); }} className="btn-secondary">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coaches.map((coach, i) => (
              <div
                key={coach.id}
                className="card-glow group animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Coach header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand/20 to-padel/20 text-white flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 transition-transform duration-300 border border-border-dark">
                    {coach.user?.firstName?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-brand transition-colors">
                      {coach.user?.firstName} {coach.user?.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {coach.sports?.map((s: string) => (
                        <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                          {s === 'PADEL' ? 'Padel' : 'Tenis'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {coach.experience && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {coach.experience} anos de experiencia
                    </div>
                  )}
                  {coach.pricePerHour && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg className="w-4 h-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-brand font-semibold">${coach.pricePerHour}</span>
                      <span className="text-text-muted">/hora</span>
                    </div>
                  )}
                </div>

                {/* Connected clubs */}
                {coach.clubLinks?.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {coach.clubLinks.slice(0, 2).map((cl: any) => cl.club?.name).filter(Boolean).join(', ')}
                    {coach.clubLinks.length > 2 && ` +${coach.clubLinks.length - 2} mas`}
                  </div>
                )}

                {/* Action */}
                <Link
                  href={`/coaches/${coach.id}`}
                  className="btn-outline w-full text-sm text-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Ver perfil
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
