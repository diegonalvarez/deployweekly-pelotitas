'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface AvailablePlayer {
  id: string;
  firstName: string;
  lastName: string;
  city?: string;
  sport?: string;
  level?: number;
  availableUntil?: string;
  padelLevel?: number;
  tennisLevel?: number;
  padelCategory?: string;
}

export default function AvailablePage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<AvailablePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('');
  const [city, setCity] = useState('');

  // Toggle availability state
  const [isAvailable, setIsAvailable] = useState(false);
  const [showAvailForm, setShowAvailForm] = useState(false);
  const [availSport, setAvailSport] = useState<'PADEL' | 'TENNIS'>('PADEL');
  const [availDuration, setAvailDuration] = useState('1h');
  const [toggling, setToggling] = useState(false);

  const sportFilters = [
    { value: '', label: 'Todos' },
    { value: 'PADEL', label: 'Padel' },
    { value: 'TENNIS', label: 'Tenis' },
  ];

  const durationOptions = [
    { value: '30m', label: '30 min' },
    { value: '1h', label: '1 hora' },
    { value: '2h', label: '2 horas' },
    { value: 'indefinite', label: 'Hasta que desactive' },
  ];

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (city) params.set('city', city);
    api
      .get(`/users/available?${params}`)
      .then((res) => {
        setPlayers(res.players || res.available || []);
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [sport]);

  const handleToggleAvailability = async () => {
    if (!user) {
      toast.error('Inicia sesion para activar tu disponibilidad');
      return;
    }

    if (isAvailable) {
      // Turning OFF
      setToggling(true);
      try {
        await api.patch('/users/me/availability', { available: false });
        setIsAvailable(false);
        toast.success('Ya no apareces como disponible');
        load();
      } catch (err: any) {
        toast.error(err.message || 'Error al actualizar disponibilidad');
      } finally {
        setToggling(false);
      }
    } else {
      // Show form to set sport + duration before turning on
      setShowAvailForm(true);
    }
  };

  const confirmAvailability = async () => {
    setToggling(true);
    try {
      await api.patch('/users/me/availability', {
        available: true,
        sport: availSport,
        duration: availDuration,
      });
      setIsAvailable(true);
      setShowAvailForm(false);
      toast.success('Ahora apareces como disponible');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Error al activar disponibilidad');
    } finally {
      setToggling(false);
    }
  };

  const getInitials = (p: AvailablePlayer) =>
    `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="section-header">Jugadores disponibles ahora</h1>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand" />
              </span>
            </div>
            <p className="text-text-secondary text-lg">Encontra alguien para jugar ahora mismo</p>
          </div>

          {/* Availability Toggle */}
          {user && (
            <div className="card-elevated !p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Estoy disponible</p>
                <p className="text-xs text-text-muted">
                  {isAvailable ? 'Los demas pueden verte' : 'Activar para que te encuentren'}
                </p>
              </div>
              <button
                onClick={handleToggleAvailability}
                disabled={toggling}
                className="shrink-0"
              >
                <div className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${isAvailable ? 'bg-brand' : 'bg-surface-light border border-border-dark'}`}>
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-200 shadow ${isAvailable ? 'left-[22px] bg-black' : 'left-0.5 bg-text-muted'}`} />
                </div>
              </button>
            </div>
          )}
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
                className="input-search w-48"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
              />
            </div>
            <button onClick={load} className="btn-ghost">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
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
              Buscando jugadores...
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🎾</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No hay jugadores disponibles</h3>
            <p className="text-text-muted mb-6">Se el primero en activar tu disponibilidad</p>
            {user && !isAvailable && (
              <button onClick={handleToggleAvailability} className="btn-primary">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
                </span>
                Estoy disponible
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {players.map((p, i) => {
              const isCurrentUser = user?.id === p.id;
              const sportBadge = p.sport || (p.padelLevel ? 'PADEL' : p.tennisLevel ? 'TENNIS' : null);
              const level = p.level || p.padelLevel || p.tennisLevel;

              return (
                <div
                  key={p.id}
                  className={`card-glow group relative overflow-hidden animate-fade-in-up ${
                    isCurrentUser ? 'ring-1 ring-brand/30' : ''
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Pulsing available indicator */}
                  <div className="absolute top-4 right-4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand" />
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative z-10">
                    {/* Player info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 text-brand flex items-center justify-center font-bold text-xl border-2 border-brand/20 group-hover:border-brand/50 group-hover:shadow-glow-green-sm transition-all">
                        {getInitials(p)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate group-hover:text-brand transition-colors">
                          {p.firstName} {p.lastName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-brand/70 font-normal">(Vos)</span>
                          )}
                        </h3>
                        {p.city && (
                          <p className="text-sm text-text-muted flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {p.city}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sportBadge && (
                        <span className={sportBadge === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                          {sportBadge === 'PADEL' ? 'Padel' : 'Tenis'}
                        </span>
                      )}
                      {p.padelCategory && (
                        <span className="badge-padel">{p.padelCategory}</span>
                      )}
                      {level && (
                        <span className="badge-neutral">Nivel {level}</span>
                      )}
                    </div>

                    {/* Available until */}
                    {p.availableUntil && (
                      <div className="flex items-center gap-2 mb-4 bg-brand/10 border border-brand/20 rounded-xl px-3 py-2">
                        <svg className="w-4 h-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-brand font-medium">
                          Disponible hasta {p.availableUntil}
                        </span>
                      </div>
                    )}

                    {/* Action */}
                    <div className="pt-3 border-t border-border-dark">
                      {isCurrentUser ? (
                        <span className="text-sm text-text-muted">Este sos vos</span>
                      ) : (
                        <Link
                          href={`/matches?challenge=${p.id}`}
                          className="btn-primary w-full text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Invitar a jugar
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Availability Setup Modal */}
      {showAvailForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAvailForm(false)}
          />

          <div className="relative bg-surface border border-border-dark rounded-2xl w-full max-w-sm p-6 animate-scale-in shadow-xl">
            <button
              onClick={() => setShowAvailForm(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand/15 text-brand flex items-center justify-center">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand" />
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white">Activar disponibilidad</h3>
                <p className="text-xs text-text-muted">Configura tu disponibilidad</p>
              </div>
            </div>

            {/* Sport */}
            <div className="mb-4">
              <label className="label">Deporte</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAvailSport('PADEL')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    availSport === 'PADEL'
                      ? 'bg-padel/20 text-padel border border-padel/40'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  Padel
                </button>
                <button
                  onClick={() => setAvailSport('TENNIS')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    availSport === 'TENNIS'
                      ? 'bg-brand/20 text-brand border border-brand/40'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  Tenis
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="label">Disponible por</label>
              <div className="grid grid-cols-2 gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAvailDuration(opt.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      availDuration === opt.value
                        ? 'bg-brand text-black'
                        : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAvailForm(false)}
                className="btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAvailability}
                disabled={toggling}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {toggling ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
                    </span>
                    Activar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
