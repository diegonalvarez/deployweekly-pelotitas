'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

function SmallSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [sport, setSport] = useState('');

  // Challenge modal state
  const [challengeModal, setChallengeModal] = useState<{ open: boolean; player: any | null }>({ open: false, player: null });
  const [challengeSport, setChallengeSport] = useState<'PADEL' | 'TENNIS'>('PADEL');
  const [challengeDate, setChallengeDate] = useState('');
  const [challengeTime, setChallengeTime] = useState('');
  const [challengeMessage, setChallengeMessage] = useState('');
  const [challengeMaxPlayers, setChallengeMaxPlayers] = useState<2 | 4>(2);
  const [challengeSubmitting, setChallengeSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (sport) params.set('sport', sport);
    api.get(`/users/search?${params}`).then(res => setPlayers(res.players || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openChallenge = (player: any) => {
    if (!user) {
      toast.error('Inicia sesion para desafiar');
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setChallengeDate(tomorrow.toISOString().split('T')[0]);
    setChallengeTime('18:00');
    setChallengeMessage('');
    setChallengeSport('PADEL');
    setChallengeMaxPlayers(2);
    setChallengeModal({ open: true, player });
  };

  const handleChallenge = async () => {
    if (!challengeModal.player) return;
    setChallengeSubmitting(true);
    const p = challengeModal.player;
    try {
      const description = challengeMessage
        ? `Desafio de ${user!.firstName} a ${p.firstName}: ${challengeMessage}`
        : `Desafio de ${user!.firstName} a ${p.firstName}`;

      await api.post('/matches', {
        sport: challengeSport,
        date: challengeDate || undefined,
        startTime: challengeTime || undefined,
        description,
        maxPlayers: challengeMaxPlayers,
        isPublic: false,
      });
      toast.success(`Desafio enviado a ${p.firstName}!`);
      setChallengeModal({ open: false, player: null });
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el desafio');
    } finally {
      setChallengeSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 animate-fade-in-up">
          <div>
            <h1 className="section-header mb-2">Jugadores</h1>
            <p className="text-text-secondary text-lg">Busca rivales por nivel, ciudad y deporte</p>
          </div>

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
              <option value="">Todos</option>
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
              Buscando jugadores...
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🎾</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No se encontraron jugadores</h3>
            <p className="text-text-muted mb-6">Intenta con otra ciudad o deporte</p>
            <button onClick={() => { setCity(''); setSport(''); load(); }} className="btn-secondary">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {players.map((p, i) => (
              <div
                key={p.id}
                className="card-glow group relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Hover "challenge" overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Player info */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 text-brand flex items-center justify-center font-bold text-xl border-2 border-brand/20 group-hover:border-brand/50 group-hover:shadow-glow-green-sm transition-all">
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-brand transition-colors">
                        {p.firstName} {p.lastName}
                      </h3>
                      {p.playerProfile?.city && (
                        <p className="text-sm text-text-muted flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {p.playerProfile.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.playerProfile?.padelCategory && (
                      <span className="badge-padel">{p.playerProfile.padelCategory}</span>
                    )}
                    {p.playerProfile?.sports?.map((s: string) => (
                      <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                        {s === 'PADEL' ? 'Padel' : 'Tenis'}
                      </span>
                    ))}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {p.playerProfile?.padelLevel && (
                      <div className="bg-surface-light/50 rounded-xl px-3 py-2">
                        <p className="text-xs text-text-muted uppercase tracking-wider">Padel</p>
                        <p className="text-lg font-bold text-padel">{p.playerProfile.padelLevel}</p>
                      </div>
                    )}
                    {p.playerProfile?.tennisLevel && (
                      <div className="bg-surface-light/50 rounded-xl px-3 py-2">
                        <p className="text-xs text-text-muted uppercase tracking-wider">Tenis</p>
                        <p className="text-lg font-bold text-brand">{p.playerProfile.tennisLevel}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-dark">
                    <div className="flex gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-text-secondary">{p.playerProfile?.matchesPlayed || 0}</span> PJ
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-brand">{p.playerProfile?.matchesWon || 0}</span> G
                      </span>
                    </div>

                    {/* Challenge button */}
                    <button
                      onClick={() => openChallenge(p)}
                      className="btn-primary text-xs py-1.5 px-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                    >
                      Desafiar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenge Modal */}
      {challengeModal.open && challengeModal.player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setChallengeModal({ open: false, player: null })}
          />

          {/* Modal */}
          <div className="relative bg-surface border border-border-dark rounded-2xl w-full max-w-sm p-6 animate-scale-in shadow-xl">
            {/* Close */}
            <button
              onClick={() => setChallengeModal({ open: false, player: null })}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand/15 text-brand flex items-center justify-center font-bold text-sm">
                {challengeModal.player.firstName?.[0]}{challengeModal.player.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-white">Desafiar a {challengeModal.player.firstName}</h3>
                <p className="text-xs text-text-muted">Crea un partido privado</p>
              </div>
            </div>

            {/* Sport selector */}
            <div className="mb-4">
              <label className="label">Deporte</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setChallengeSport('PADEL')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    challengeSport === 'PADEL'
                      ? 'bg-padel/20 text-padel border border-padel/40'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  Padel
                </button>
                <button
                  onClick={() => setChallengeSport('TENNIS')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    challengeSport === 'TENNIS'
                      ? 'bg-brand/20 text-brand border border-brand/40'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  Tenis
                </button>
              </div>
            </div>

            {/* Max players */}
            <div className="mb-4">
              <label className="label">Jugadores</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setChallengeMaxPlayers(2)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    challengeMaxPlayers === 2
                      ? 'bg-brand text-black'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  1 vs 1
                </button>
                <button
                  onClick={() => setChallengeMaxPlayers(4)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    challengeMaxPlayers === 4
                      ? 'bg-brand text-black'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  2 vs 2
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="label">Fecha (opcional)</label>
              <input
                type="date"
                className="input w-full"
                value={challengeDate}
                min={todayStr}
                onChange={e => setChallengeDate(e.target.value)}
              />
            </div>

            {/* Time */}
            <div className="mb-4">
              <label className="label">Hora (opcional)</label>
              <input
                type="time"
                className="input w-full"
                value={challengeTime}
                onChange={e => setChallengeTime(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="label">Mensaje (opcional)</label>
              <textarea
                className="textarea w-full"
                rows={2}
                placeholder="Nos vemos en la cancha!"
                value={challengeMessage}
                onChange={e => setChallengeMessage(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setChallengeModal({ open: false, player: null })}
                className="btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleChallenge}
                disabled={challengeSubmitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {challengeSubmitting ? <SmallSpinner /> : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Enviar desafio
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
