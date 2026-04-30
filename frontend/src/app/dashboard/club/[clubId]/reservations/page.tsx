'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ClubReservationsPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayString());
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await api.get(`/reservations/club/${clubId}?date=${date}`);
      setReservations(Array.isArray(data) ? data : data.reservations || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar reservas');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [clubId, date]);

  useEffect(() => {
    if (user && clubId) fetchReservations();
  }, [user, clubId, fetchReservations]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await api.patch(`/reservations/${id}/cancel`);
      toast.success('Reserva cancelada');
      fetchReservations();
    } catch (err: any) {
      toast.error(err.message || 'Error al cancelar');
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando...
        </div>
      </div>
    );
  }

  const confirmed = reservations.filter(r => r.status === 'CONFIRMED');
  const cancelled = reservations.filter(r => r.status === 'CANCELLED');

  const statusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'badge-green';
      case 'CANCELLED': return 'badge-red';
      case 'PENDING': return 'badge-yellow';
      default: return 'badge-neutral';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'CANCELLED': return 'Cancelada';
      case 'PENDING': return 'Pendiente';
      case 'COMPLETED': return 'Completada';
      default: return status;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Back link */}
        <Link
          href="/dashboard/club"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al panel
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reservas
            </h1>
            <p className="text-text-muted text-sm mt-1">Gestiona las reservas de tu complejo</p>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-text-muted">Fecha:</label>
            <input
              type="date"
              className="input w-auto"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">📅</span>
            </div>
            <p className="stat-value text-white">{reservations.length}</p>
            <p className="stat-label">Total hoy</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <p className="stat-value text-brand">{confirmed.length}</p>
            <p className="stat-label">Confirmadas</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">❌</span>
            </div>
            <p className="stat-value text-negative">{cancelled.length}</p>
            <p className="stat-label">Canceladas</p>
          </div>
        </div>

        {/* Reservations list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-text-muted">
              <Spinner />
              Cargando reservas...
            </div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">Sin reservas para esta fecha</h3>
            <p className="text-text-muted max-w-md mx-auto">
              No hay reservas registradas para el {formatDate(date)}.
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {reservations.map((r, i) => (
              <div
                key={r.id}
                className="card-glow animate-fade-in-up"
                style={{ animationDelay: `${(i + 3) * 60}ms` }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white">
                          {r.court?.name || 'Cancha'}
                        </p>
                        <span className={r.court?.sport === 'PADEL' ? 'badge-padel' : r.court?.sport === 'TENNIS' ? 'badge-tennis' : 'badge-neutral'}>
                          {r.court?.sport === 'PADEL' ? 'Padel' : r.court?.sport === 'TENNIS' ? 'Tenis' : r.court?.sport || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sm text-text-secondary flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {r.user?.firstName} {r.user?.lastName}
                        </span>
                        <span className="text-sm text-text-muted flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {r.startTime} - {r.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={statusBadge(r.status)}>
                      {statusLabel(r.status)}
                    </span>
                    {r.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={cancellingId === r.id}
                        className="btn-danger text-sm"
                      >
                        {cancellingId === r.id ? (
                          <><Spinner /> Cancelando...</>
                        ) : (
                          'Cancelar'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
