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

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState('');

  // Create match modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createSport, setCreateSport] = useState<'PADEL' | 'TENNIS'>('PADEL');
  const [createDate, setCreateDate] = useState('');
  const [createTime, setCreateTime] = useState('');
  const [createCity, setCreateCity] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createMaxPlayers, setCreateMaxPlayers] = useState<2 | 4>(4);
  const [createIsPublic, setCreateIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    api.get(`/matches?${params}`).then(res => setMatches(res.matches || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleJoin = async (matchId: string) => {
    if (!user) { toast.error('Inicia sesion'); return; }
    try {
      await api.post(`/matches/${matchId}/join`);
      toast.success('Te uniste al partido!');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const openCreateModal = () => {
    if (!user) {
      toast.error('Inicia sesion para crear un partido');
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCreateDate(tomorrow.toISOString().split('T')[0]);
    setCreateTime('18:00');
    setCreateCity('');
    setCreateDescription('');
    setCreateSport('PADEL');
    setCreateMaxPlayers(4);
    setCreateIsPublic(true);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createDate || !createTime) {
      toast.error('Fecha y hora son requeridas');
      return;
    }
    setCreating(true);
    try {
      await api.post('/matches', {
        sport: createSport,
        date: createDate,
        startTime: createTime,
        city: createCity || undefined,
        description: createDescription || undefined,
        maxPlayers: createMaxPlayers,
        isPublic: createIsPublic,
      });
      toast.success('Partido creado!');
      setCreateOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear partido');
    } finally {
      setCreating(false);
    }
  };

  const sportFilters = [
    { value: '', label: 'Todos' },
    { value: 'PADEL', label: 'Padel' },
    { value: 'TENNIS', label: 'Tenis' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="section-header mb-2">Partidos abiertos</h1>
          <p className="text-text-secondary text-lg">Unite a un partido o crea el tuyo</p>
        </div>

        {/* Sport filter pills */}
        <div className="flex items-center gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {sportFilters.map(f => (
            <button
              key={f.value}
              onClick={() => { setSport(f.value); }}
              className={`px-5 py-2 rounded-pill text-sm font-semibold transition-all duration-200 ${
                sport === f.value
                  ? 'bg-brand text-black shadow-glow-green-sm'
                  : 'bg-surface-light text-text-secondary hover:text-white hover:bg-surface-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button onClick={load} className="btn-ghost ml-2">
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
              Cargando partidos...
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🎾</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No hay partidos abiertos</h3>
            <p className="text-text-muted mb-6">Se el primero en crear uno</p>
            <button onClick={openCreateModal} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear partido
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((m, i) => (
              <div
                key={m.id}
                className="card-glow group animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span className={m.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                      {m.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                    </span>
                    <span className={
                      m.status === 'OPEN' ? 'badge-green' :
                      m.status === 'FULL' ? 'badge-yellow' :
                      m.status === 'COMPLETED' ? 'badge-neutral' : 'badge-yellow'
                    }>
                      {m.status === 'OPEN' ? 'Abierto' : m.status === 'FULL' ? 'Completo' : m.status}
                    </span>
                  </div>
                  <span className="text-sm text-text-muted font-mono">
                    {m._count?.participants || m.participants?.length || 0}/{m.maxPlayers}
                  </span>
                </div>

                {/* Date and location */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(m.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} - {m.startTime}
                  </div>
                  {m.city && (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {m.city}
                    </div>
                  )}
                </div>

                {m.description && (
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">{m.description}</p>
                )}

                {/* Player avatars */}
                <div className="flex items-center mb-4">
                  <div className="flex -space-x-2">
                    {m.participants?.slice(0, 6).map((p: any, idx: number) => (
                      <div
                        key={p.id}
                        className="w-9 h-9 rounded-full bg-brand/15 text-brand flex items-center justify-center text-xs font-bold border-2 border-surface ring-0 hover:ring-2 hover:ring-brand/30 transition-all"
                        style={{ zIndex: 10 - idx }}
                        title={p.user.firstName}
                      >
                        {p.user.firstName[0]}
                      </div>
                    ))}
                  </div>
                  {(m.participants?.length || 0) > 6 && (
                    <span className="ml-2 text-xs text-text-muted">+{m.participants.length - 6}</span>
                  )}
                </div>

                {/* Join button */}
                {m.status === 'OPEN' && user && (
                  <button
                    onClick={() => handleJoin(m.id)}
                    className="btn-primary w-full text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Unirme
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Floating create button */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-8 right-8 btn-primary w-14 h-14 rounded-full p-0 shadow-glow-green animate-bounce-soft z-40 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Create Match Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setCreateOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-surface border border-border-dark rounded-2xl w-full max-w-md p-6 animate-scale-in shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Crear partido</h3>
            <p className="text-text-muted text-sm mb-6">Completa los detalles para tu partido</p>

            {/* Sport selector */}
            <div className="mb-4">
              <label className="label">Deporte</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCreateSport('PADEL')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    createSport === 'PADEL'
                      ? 'bg-padel/20 text-padel border border-padel/40'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  Padel
                </button>
                <button
                  onClick={() => setCreateSport('TENNIS')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    createSport === 'TENNIS'
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
                  onClick={() => setCreateMaxPlayers(2)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    createMaxPlayers === 2
                      ? 'bg-brand text-black'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  1 vs 1 (2)
                </button>
                <button
                  onClick={() => setCreateMaxPlayers(4)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    createMaxPlayers === 4
                      ? 'bg-brand text-black'
                      : 'bg-surface-light text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  2 vs 2 (4)
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="label">Fecha</label>
              <input
                type="date"
                className="input w-full"
                value={createDate}
                min={todayStr}
                onChange={e => setCreateDate(e.target.value)}
              />
            </div>

            {/* Time */}
            <div className="mb-4">
              <label className="label">Hora de inicio</label>
              <input
                type="time"
                className="input w-full"
                value={createTime}
                onChange={e => setCreateTime(e.target.value)}
              />
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="label">Ciudad (opcional)</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Buenos Aires"
                value={createCity}
                onChange={e => setCreateCity(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="label">Descripcion (opcional)</label>
              <textarea
                className="textarea w-full"
                rows={2}
                placeholder="Nivel intermedio, cancha cubierta..."
                value={createDescription}
                onChange={e => setCreateDescription(e.target.value)}
              />
            </div>

            {/* Public toggle */}
            <div className="mb-6">
              <button
                onClick={() => setCreateIsPublic(!createIsPublic)}
                className="flex items-center gap-3 w-full text-left"
              >
                <div className={`relative w-11 h-6 rounded-full transition-colors ${createIsPublic ? 'bg-brand' : 'bg-surface-light border border-border-dark'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow ${createIsPublic ? 'left-[22px] bg-black' : 'left-0.5 bg-text-muted'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Partido publico</p>
                  <p className="text-xs text-text-muted">
                    {createIsPublic ? 'Cualquiera puede unirse' : 'Solo por invitacion'}
                  </p>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setCreateOpen(false)}
                className="btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createDate || !createTime}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {creating ? <SmallSpinner /> : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Crear partido
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
