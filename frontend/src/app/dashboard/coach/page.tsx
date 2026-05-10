'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import Link from 'next/link';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/RoleGuard';
import ActivateRoleBanner from '@/components/ActivateRoleBanner';

export default function CoachDashboardPage() {
  return <RoleGuard role="COACH"><CoachDashboard /></RoleGuard>;
}

const DAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sabado',
};

function CoachDashboard() {
  const { user, refreshUser } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [coachDetail, setCoachDetail] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // UI state
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showAvailForm, setShowAvailForm] = useState(false);
  const [availForm, setAvailForm] = useState({ dayOfWeek: '1', clubId: '', startTime: '', endTime: '' });
  const [addingAvail, setAddingAvail] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ playerId: string; playerName: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({ comment: '', isWarning: false });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [togglingAutoAccept, setTogglingAutoAccept] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const coachProfile = user?.coachProfile;
  const coachId = coachProfile?.id;

  const loadAll = useCallback(async () => {
    if (!user || !coachId) return;
    setLoadingData(true);
    try {
      const [bookingsRes, detailRes, connectionsRes] = await Promise.all([
        api.get('/coaches/bookings/mine?role=coach').catch(() => []),
        api.get(`/coaches/${coachId}`).catch(() => null),
        api.get('/connections?type=PLAYER_COACH&direction=received').catch(() => []),
      ]);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      setCoachDetail(detailRes);
      setConnections(Array.isArray(connectionsRes) ? connectionsRes : []);
    } catch {
      // silent
    }
    setLoadingData(false);
  }, [user, coachId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!user) return null;

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const acceptedConnections = connections.filter((c: any) => c.status === 'ACCEPTED');
  const activeClubs = coachProfile?.clubLinks?.filter((l: any) => l.status === 'ACTIVE') || [];

  const stats = [
    { value: pendingBookings.length, label: 'Clases pendientes', icon: '📋', color: 'text-yellow-400' },
    { value: bookings.length, label: 'Total clases', icon: '📊', color: 'text-padel' },
    { value: activeClubs.length, label: 'Complejos activos', icon: '🏟️', color: 'text-brand' },
    { value: acceptedConnections.length, label: 'Jugadores conectados', icon: '👥', color: 'text-padel' },
  ];

  // --- Handlers ---

  const handleApprove = async (bookingId: string) => {
    setApprovingId(bookingId);
    try {
      await api.patch(`/coaches/bookings/${bookingId}/approve`);
      toast.success('Clase aprobada');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b));
    } catch (err: any) {
      toast.error(err.message || 'Error al aprobar');
    }
    setApprovingId(null);
  };

  const handleReject = async (bookingId: string) => {
    setRejectingId(bookingId);
    try {
      await api.delete(`/coaches/bookings/${bookingId}`);
      toast.success('Clase rechazada');
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err: any) {
      toast.error(err.message || 'Error al rechazar');
    }
    setRejectingId(null);
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availForm.startTime || !availForm.endTime) {
      toast.error('Completa horario de inicio y fin');
      return;
    }
    setAddingAvail(true);
    try {
      await api.post('/coaches/availability', {
        dayOfWeek: parseInt(availForm.dayOfWeek),
        startTime: availForm.startTime,
        endTime: availForm.endTime,
        clubId: availForm.clubId || undefined,
      });
      toast.success('Horario agregado');
      setShowAvailForm(false);
      setAvailForm({ dayOfWeek: '1', clubId: '', startTime: '', endTime: '' });
      // Reload coach detail for updated availabilities
      const detail = await api.get(`/coaches/${coachId}`).catch(() => null);
      if (detail) setCoachDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar horario');
    }
    setAddingAvail(false);
  };

  const handleToggleAutoAccept = async (playerId: string, currentEnabled: boolean) => {
    setTogglingAutoAccept(playerId);
    try {
      await api.post(`/coaches/auto-accept/${playerId}`, { enabled: !currentEnabled });
      toast.success(!currentEnabled ? 'Auto-aceptar activado' : 'Auto-aceptar desactivado');
      // Refresh connections to reflect change
      const conn = await api.get('/connections?type=PLAYER_COACH&direction=received').catch(() => []);
      setConnections(Array.isArray(conn) ? conn : []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar auto-aceptar');
    }
    setTogglingAutoAccept(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal || !reviewForm.comment.trim()) {
      toast.error('Escribe un comentario');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/coaches/reviews', {
        studentId: reviewModal.playerId,
        comment: reviewForm.comment,
        isWarning: reviewForm.isWarning,
      });
      toast.success('Resena enviada');
      setReviewModal(null);
      setReviewForm({ comment: '', isWarning: false });
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar resena');
    }
    setSubmittingReview(false);
  };

  const handleSettingsToggle = async (field: 'requireConnection' | 'autoAcceptAll', currentValue: boolean) => {
    setSavingSettings(true);
    try {
      await api.patch('/coaches/me', { [field]: !currentValue });
      await refreshUser();
      toast.success('Configuracion actualizada');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    }
    setSavingSettings(false);
  };

  const availabilities = coachDetail?.availabilities || [];

  // Group availabilities by day
  const availByDay: Record<number, any[]> = {};
  availabilities.forEach((av: any) => {
    if (!availByDay[av.dayOfWeek]) availByDay[av.dayOfWeek] = [];
    availByDay[av.dayOfWeek].push(av);
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-padel/20 to-padel/5 text-padel flex items-center justify-center font-bold text-2xl border border-padel/20">
              {user.firstName[0]}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-text-muted text-sm mt-0.5">Panel de profesor</p>
            </div>
          </div>
          <Link href="/profile/edit" className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar perfil
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className={`stat-value ${s.color}`}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loadingData && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-text-muted">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando datos...
            </div>
          </div>
        )}

        {!loadingData && (
          <div className="space-y-10">
            {/* ====== PROXIMAS CLASES ====== */}
            <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Proximas clases
              </h2>

              {confirmedBookings.length === 0 ? (
                <div className="card-elevated text-center py-14">
                  <div className="text-5xl mb-4 opacity-20">📅</div>
                  <h3 className="text-lg font-bold text-text-secondary mb-1">Sin clases agendadas</h3>
                  <p className="text-text-muted text-sm">Las clases confirmadas apareceran aca</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {confirmedBookings.map((b, i) => (
                    <div
                      key={b.id}
                      className="card-glow animate-fade-in-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-bold text-lg">
                            {b.student?.firstName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {b.student?.firstName} {b.student?.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm text-text-secondary">
                                <span className="tabular">{formatDate(b.date)}</span> · {b.startTime} a {b.endTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                          <span className={b.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                            {b.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                          </span>
                          <span className="badge-brand">
                            {b.type === 'GROUP' ? 'Grupal' : 'Individual'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ====== SOLICITUDES PENDIENTES ====== */}
            <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Solicitudes pendientes
                {pendingBookings.length > 0 && (
                  <span className="badge-yellow ml-2">{pendingBookings.length}</span>
                )}
              </h2>

              {pendingBookings.length === 0 ? (
                <div className="card-elevated text-center py-14">
                  <div className="text-5xl mb-4 opacity-20">📋</div>
                  <h3 className="text-lg font-bold text-text-secondary mb-1">Sin solicitudes</h3>
                  <p className="text-text-muted text-sm">No tenes solicitudes de clases pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((b, i) => (
                    <div
                      key={b.id}
                      className="card-elevated animate-fade-in-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold text-lg">
                            {b.student?.firstName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {b.student?.firstName} {b.student?.lastName}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-sm text-text-secondary flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="tabular">{formatDate(b.date)}</span>
                              </span>
                              <span className="text-sm text-text-secondary">{b.startTime} - {b.endTime}</span>
                              <span className={b.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                                {b.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={approvingId === b.id}
                            className="btn-primary text-sm"
                          >
                            {approvingId === b.id ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(b.id)}
                            disabled={rejectingId === b.id}
                            className="btn-danger text-sm"
                          >
                            {rejectingId === b.id ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ====== MI DISPONIBILIDAD ====== */}
            <section className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Mi disponibilidad
                </h2>
                <button
                  onClick={() => setShowAvailForm(!showAvailForm)}
                  className="btn-secondary text-sm"
                >
                  {showAvailForm ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agregar horario
                    </>
                  )}
                </button>
              </div>

              {/* Add availability form */}
              {showAvailForm && (
                <form onSubmit={handleAddAvailability} className="card-elevated mb-6 animate-fade-in-up">
                  <h3 className="text-base font-bold text-white mb-4">Nuevo horario</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="label">Dia</label>
                      <select
                        className="input appearance-none cursor-pointer w-full"
                        value={availForm.dayOfWeek}
                        onChange={e => setAvailForm({ ...availForm, dayOfWeek: e.target.value })}
                      >
                        {Object.entries(DAY_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Club (opcional)</label>
                      <select
                        className="input appearance-none cursor-pointer w-full"
                        value={availForm.clubId}
                        onChange={e => setAvailForm({ ...availForm, clubId: e.target.value })}
                      >
                        <option value="">General</option>
                        {activeClubs.map((cl: any) => (
                          <option key={cl.clubId} value={cl.clubId}>
                            {cl.club?.name || cl.clubId}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Inicio</label>
                      <input
                        type="time"
                        className="input w-full"
                        value={availForm.startTime}
                        onChange={e => setAvailForm({ ...availForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Fin</label>
                      <input
                        type="time"
                        className="input w-full"
                        value={availForm.endTime}
                        onChange={e => setAvailForm({ ...availForm, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button type="submit" disabled={addingAvail} className="btn-primary text-sm">
                      {addingAvail ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Guardando...
                        </span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Guardar horario
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Availability grid */}
              {availabilities.length === 0 ? (
                <div className="card-elevated text-center py-14">
                  <div className="text-5xl mb-4 opacity-20">🗓️</div>
                  <h3 className="text-lg font-bold text-text-secondary mb-1">Sin horarios configurados</h3>
                  <p className="text-text-muted text-sm">Agrega tus horarios disponibles para que los alumnos puedan reservar</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(availByDay)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([day, slots]) => (
                      <div key={day} className="card-elevated">
                        <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand" />
                          {DAY_LABELS[Number(day)] || `Dia ${day}`}
                        </h4>
                        <div className="space-y-2">
                          {slots.map((slot: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-light border border-border-dark"
                            >
                              <span className="text-sm text-brand font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {slot.club?.name && (
                                <span className="badge-neutral text-xs">{slot.club.name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* ====== JUGADORES CONECTADOS ====== */}
            <section className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Jugadores conectados
                {acceptedConnections.length > 0 && (
                  <span className="badge-green ml-2">{acceptedConnections.length}</span>
                )}
              </h2>

              {acceptedConnections.length === 0 ? (
                <div className="card-elevated text-center py-14">
                  <div className="text-5xl mb-4 opacity-20">👥</div>
                  <h3 className="text-lg font-bold text-text-secondary mb-1">Sin jugadores conectados</h3>
                  <p className="text-text-muted text-sm">Los jugadores que se conecten con vos apareceran aca</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {acceptedConnections.map((conn: any, i: number) => {
                    const player = conn.fromUser || conn.toUser;
                    const playerId = conn.fromUserId || conn.toUserId;
                    const playerName = player ? `${player.firstName} ${player.lastName}` : 'Jugador';
                    const autoAccepted = conn.autoAccept ?? false;

                    return (
                      <div
                        key={conn.id}
                        className="card-elevated animate-fade-in-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold">
                            {player?.firstName?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{playerName}</p>
                            {player?.email && (
                              <p className="text-xs text-text-muted truncate">{player.email}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          {/* Auto-accept toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleAutoAccept(playerId, autoAccepted)}
                            disabled={togglingAutoAccept === playerId}
                            className="flex items-center gap-2 group"
                          >
                            <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${autoAccepted ? 'bg-brand' : 'bg-surface-light border border-border-dark'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 shadow ${autoAccepted ? 'left-[18px] bg-black' : 'left-0.5 bg-text-muted'}`} />
                            </div>
                            <span className="text-xs text-text-muted group-hover:text-text-secondary transition-colors">
                              Auto-aceptar
                            </span>
                          </button>

                          {/* Review button */}
                          <button
                            onClick={() => {
                              setReviewModal({ playerId, playerName });
                              setReviewForm({ comment: '', isWarning: false });
                            }}
                            className="btn-ghost text-xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Escribir resena
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ====== CONFIGURACION ====== */}
            <section className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuracion
              </h2>

              <div className="card-elevated space-y-5">
                {[
                  {
                    field: 'requireConnection' as const,
                    label: 'Requiere conexion para reservar',
                    desc: 'Los jugadores deben conectarse contigo antes de poder reservar una clase',
                    value: coachProfile?.requireConnection ?? false,
                  },
                  {
                    field: 'autoAcceptAll' as const,
                    label: 'Auto-aceptar todas las reservas',
                    desc: 'Aceptar automaticamente todas las solicitudes de clase entrantes',
                    value: coachProfile?.autoAcceptAll ?? false,
                  },
                ].map((setting) => (
                  <button
                    key={setting.field}
                    type="button"
                    onClick={() => handleSettingsToggle(setting.field, setting.value)}
                    disabled={savingSettings}
                    className="flex items-center gap-4 w-full text-left group"
                  >
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${setting.value ? 'bg-brand' : 'bg-surface-light border border-border-dark'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow ${setting.value ? 'left-[22px] bg-black' : 'left-0.5 bg-text-muted'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-brand transition-colors">{setting.label}</p>
                      <p className="text-xs text-text-muted">{setting.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        <ActivateRoleBanner currentRole="COACH" />
      </div>

      {/* ====== REVIEW MODAL ====== */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setReviewModal(null)}
          />
          <div className="relative glass p-6 sm:p-8 max-w-md w-full animate-fade-in-up">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Escribir resena</h3>
            <p className="text-sm text-text-muted mb-5">
              Para {reviewModal.playerName}
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="label">Comentario</label>
                <textarea
                  className="input w-full resize-none"
                  rows={4}
                  placeholder="Escribe tu resena sobre este alumno..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, isWarning: !reviewForm.isWarning })}
                className="flex items-center gap-3 w-full text-left group"
              >
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${reviewForm.isWarning ? 'bg-red-500' : 'bg-surface-light border border-border-dark'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 shadow ${reviewForm.isWarning ? 'left-[18px] bg-white' : 'left-0.5 bg-text-muted'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">Advertencia</p>
                  <p className="text-xs text-text-muted">Marcar como advertencia sobre el alumno</p>
                </div>
              </button>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submittingReview} className="btn-primary flex-1">
                  {submittingReview ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar resena'
                  )}
                </button>
                <button type="button" onClick={() => setReviewModal(null)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
