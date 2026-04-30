'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CoachDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Booking form state
  const [bookDate, setBookDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookSport, setBookSport] = useState('');
  const [bookType, setBookType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  const [bookNotes, setBookNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/coaches/${id}`)
      .then(setCoach)
      .catch(() => setCoach(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Check connection when user and coach are loaded
  useEffect(() => {
    if (user && coach) {
      setCheckingConnection(true);
      api.get(`/connections/check/${coach.userId}?type=PLAYER_COACH&entityId=${coach.id}`)
        .then(res => setConnected(res.connected))
        .catch(() => setConnected(false))
        .finally(() => setCheckingConnection(false));

      // Default sport selection
      if (coach.sports?.length > 0 && !bookSport) {
        setBookSport(coach.sports[0]);
      }
    }
  }, [user, coach]);

  const handleConnect = async () => {
    if (!user) {
      toast.error('Inicia sesion para conectarte');
      return;
    }
    setConnecting(true);
    try {
      await api.post('/connections', {
        toUserId: coach.userId,
        type: 'PLAYER_COACH',
        coachId: coach.id,
      });
      setConnected(true);
      toast.success('Solicitud de conexion enviada');
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar');
    }
    setConnecting(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Inicia sesion para reservar');
      return;
    }
    if (!bookDate || !startTime || !endTime || !bookSport) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/coaches/bookings', {
        coachId: coach.id,
        date: bookDate,
        startTime,
        endTime,
        sport: bookSport,
        clubId: coach.clubLinks?.[0]?.clubId || undefined,
        notes: bookNotes || undefined,
        type: bookType,
      });
      toast.success('Clase reservada con exito!');
      setBookDate('');
      setStartTime('');
      setEndTime('');
      setBookNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Error al reservar clase');
    }
    setSubmitting(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const dayLabels: Record<number, string> = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miercoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sabado',
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando profesor...
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4 opacity-20">🎓</div>
        <h2 className="text-xl font-bold text-text-secondary mb-2">Profesor no encontrado</h2>
        <Link href="/coaches" className="btn-secondary mt-4">Volver a profesores</Link>
      </div>
    );
  }

  const requiresConnection = coach.requireConnection;
  const canBook = connected || !requiresConnection;

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10">
        {/* Hero section */}
        <div className="bg-surface border-b border-border-dark">
          <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
            <div className="animate-fade-in-up">
              {/* Breadcrumb */}
              <Link href="/coaches" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Profesores
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand/20 to-padel/20 text-white flex items-center justify-center font-bold text-3xl border border-border-dark shadow-glow-green-sm shrink-0">
                    {coach.user?.firstName?.[0] || '?'}
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      {coach.user?.firstName} {coach.user?.lastName}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {coach.sports?.map((s: string) => (
                        <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                          {s === 'PADEL' ? 'Padel' : 'Tenis'}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      {coach.experience && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {coach.experience} anos exp.
                        </span>
                      )}
                      {coach.pricePerHour && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-brand font-semibold">${coach.pricePerHour}/hora</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection button */}
                {user && !checkingConnection && !connected && (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="btn-primary shrink-0"
                  >
                    {connecting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Conectar
                      </>
                    )}
                  </button>
                )}
                {user && connected && (
                  <span className="badge-green flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Conectado
                  </span>
                )}
              </div>

              {coach.bio && (
                <p className="text-text-secondary mt-5 max-w-2xl leading-relaxed">{coach.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Certifications */}
              {coach.certifications && (
                <section className="animate-fade-in-up">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Certificaciones
                  </h2>
                  <span className="badge-brand">{coach.certifications}</span>
                </section>
              )}

              {/* Connected clubs */}
              {coach.clubLinks?.length > 0 && (
                <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Complejos donde ensena
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {coach.clubLinks.map((link: any) => (
                      <Link
                        key={link.id}
                        href={`/clubs/${link.clubId}`}
                        className="card-interactive group py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-padel/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            🏟️
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm group-hover:text-brand transition-colors">
                              {link.club?.name}
                            </p>
                            {link.club?.locations?.[0] && (
                              <p className="text-xs text-text-muted">
                                {link.club.locations[0].city}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Availability */}
              {coach.availabilities?.length > 0 && (
                <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Disponibilidad
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {coach.availabilities.map((av: any, i: number) => (
                      <div key={i} className="card py-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white text-sm">
                            {dayLabels[av.dayOfWeek as number] || `Dia ${av.dayOfWeek}`}
                          </span>
                          <span className="text-sm text-brand font-medium">
                            {av.startTime} - {av.endTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right column - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                {!user ? (
                  <div className="card-elevated text-center py-10">
                    <div className="text-4xl mb-3 opacity-20">🔒</div>
                    <p className="text-text-muted mb-4">Inicia sesion para reservar una clase</p>
                    <Link href="/login" className="btn-primary text-sm">Iniciar sesion</Link>
                  </div>
                ) : requiresConnection && !connected ? (
                  <div className="card-elevated text-center py-10">
                    <div className="text-4xl mb-3 opacity-30">🔗</div>
                    <p className="text-text-secondary font-semibold mb-2">Conexion requerida</p>
                    <p className="text-text-muted text-sm mb-5">
                      Debes conectarte con este profesor primero
                    </p>
                    <button
                      onClick={handleConnect}
                      disabled={connecting}
                      className="btn-primary text-sm"
                    >
                      {connecting ? 'Conectando...' : 'Conectar'}
                    </button>
                  </div>
                ) : (
                  <div className="card-elevated">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                      <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Reservar clase
                    </h3>

                    <form onSubmit={handleBooking} className="space-y-4">
                      {/* Date */}
                      <div>
                        <label className="label">Fecha</label>
                        <input
                          type="date"
                          className="input w-full"
                          value={bookDate}
                          min={todayStr}
                          onChange={e => setBookDate(e.target.value)}
                          required
                        />
                      </div>

                      {/* Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Inicio</label>
                          <input
                            type="time"
                            className="input w-full"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="label">Fin</label>
                          <input
                            type="time"
                            className="input w-full"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Sport pills */}
                      <div>
                        <label className="label">Deporte</label>
                        <div className="flex gap-2">
                          {(coach.sports || []).map((s: string) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setBookSport(s)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                bookSport === s
                                  ? s === 'PADEL'
                                    ? 'bg-padel text-white shadow-lg shadow-padel/20'
                                    : 'bg-brand text-black shadow-lg shadow-brand/20'
                                  : 'bg-surface-light text-text-secondary hover:bg-surface-light/80 border border-border-dark'
                              }`}
                            >
                              {s === 'PADEL' ? 'Padel' : 'Tenis'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Type selector */}
                      <div>
                        <label className="label">Tipo de clase</label>
                        <div className="flex gap-2">
                          {[
                            { value: 'INDIVIDUAL' as const, label: 'Individual', icon: '👤' },
                            { value: 'GROUP' as const, label: 'Grupal', icon: '👥' },
                          ].map(t => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setBookType(t.value)}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                bookType === t.value
                                  ? 'bg-brand/15 text-brand border border-brand/30'
                                  : 'bg-surface-light text-text-secondary hover:bg-surface-light/80 border border-border-dark'
                              }`}
                            >
                              <span>{t.icon}</span>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="label">Notas (opcional)</label>
                        <textarea
                          className="input w-full resize-none"
                          rows={3}
                          placeholder="Algo que quieras comentar..."
                          value={bookNotes}
                          onChange={e => setBookNotes(e.target.value)}
                        />
                      </div>

                      {/* Price display */}
                      {coach.pricePerHour && (
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-light border border-border-dark">
                          <span className="text-sm text-text-secondary">Precio por hora</span>
                          <span className="text-lg font-bold text-brand">${coach.pricePerHour}</span>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full justify-center"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Reservando...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmar reserva
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
