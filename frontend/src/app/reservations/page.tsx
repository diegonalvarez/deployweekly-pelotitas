'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Users, Check, X as XIcon, Loader2 } from 'lucide-react';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/reservations').then(setReservations).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/reservations/${id}/cancel`);
      toast.success('Reserva cancelada');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const statusConfig: Record<string, { badge: string; label: string }> = {
    CONFIRMED: { badge: 'badge-green', label: 'Confirmada' },
    CANCELLED: { badge: 'badge-red', label: 'Cancelada' },
    COMPLETED: { badge: 'badge-blue', label: 'Completada' },
    PENDING: { badge: 'badge-yellow', label: 'Pendiente' },
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4 opacity-20">🔒</div>
        <p className="text-text-secondary text-lg mb-4">Inicia sesion para ver tus reservas</p>
        <Link href="/login" className="btn-primary">Ingresar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Mis reservas</h1>
            <p className="text-text-muted text-sm mt-1">Historial y proximas reservas</p>
          </div>
          <Link href="/clubs" className="btn-primary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva reserva
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando reservas...
            </div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">📅</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No tenes reservas</h3>
            <p className="text-text-muted mb-6">Busca un complejo y reserva tu cancha</p>
            <Link href="/clubs" className="btn-primary">Buscar complejos</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r, i) => {
              const config = statusConfig[r.status] || { badge: 'badge-neutral', label: r.status };
              return (
                <div
                  key={r.id}
                  className={`card-glow animate-fade-in-up ${
                    r.status === 'CANCELLED' ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        r.sport === 'PADEL' ? 'bg-padel/10' : 'bg-brand/10'
                      }`}>
                        <span className="text-xl">{r.sport === 'PADEL' ? '🏸' : '🎾'}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {r.court?.club?.name} - {r.court?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-text-secondary tabular">
                            {formatDate(r.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-text-secondary">{r.startTime} - {r.endTime}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className={r.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                            {r.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <span className={config.badge}>{config.label}</span>
                      {r.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="btn-ghost text-negative text-sm hover:bg-negative/10"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Matchmaking panel — only for future confirmed reservations */}
                  {r.status !== 'CANCELLED' && (
                    <MatchmakingPanel reservation={r} onChange={load} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchmakingPanel({ reservation, onChange }: { reservation: any; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState(reservation.slotsNeeded || 1);
  const [note, setNote] = useState(reservation.joinNote || '');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const isOpen = !!reservation.openForJoin && (reservation.slotsNeeded || 0) > 0;
  const joiners: any[] = reservation.joiners || [];
  const pending = joiners.filter((j) => j.status === 'PENDING');
  const accepted = joiners.filter((j) => j.status === 'ACCEPTED');

  const submitOpen = async () => {
    setSaving(true);
    try {
      await api.patch(`/reservations/${reservation.id}/open`, {
        slotsNeeded: slots,
        joinNote: note || null,
      });
      toast.success('Cupos abiertos. Otros jugadores van a poder anotarse.');
      setOpen(false);
      onChange();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const close = async () => {
    setSaving(true);
    try {
      await api.patch(`/reservations/${reservation.id}/close`);
      toast.success('Cupos cerrados');
      onChange();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const respond = async (joinId: string, accept: boolean) => {
    setBusy(joinId);
    try {
      await api.patch(`/reservations/joins/${joinId}/respond`, { accept });
      toast.success(accept ? 'Aceptado' : 'Rechazado');
      onChange();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border-dark">
      {!isOpen && !open && (
        <button
          onClick={() => setOpen(true)}
          className="btn-secondary text-xs"
        >
          <Users className="w-3.5 h-3.5" /> Faltan jugadores
        </button>
      )}

      {open && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="font-mono text-2xs uppercase tracking-widest text-text-muted">
              Faltan
            </label>
            <input
              type="number"
              min={1}
              max={6}
              value={slots}
              onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
              className="input w-20 text-center font-mono"
            />
            <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
              jugadores
            </span>
          </div>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Comentario opcional (ej: nivel 3.0, juego relajado…)"
            maxLength={140}
          />
          <div className="flex items-center gap-2">
            <button onClick={submitOpen} disabled={saving} className="btn-primary text-xs">
              {saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Abriendo…</> : 'Abrir cupos'}
            </button>
            <button onClick={() => setOpen(false)} className="btn-ghost text-xs">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-mono text-2xs uppercase tracking-widest text-brand font-semibold">
              ▸ Buscando {reservation.slotsNeeded} jugador{reservation.slotsNeeded === 1 ? '' : 'es'}
            </span>
            <button onClick={close} disabled={saving} className="btn-ghost text-xs">
              Cerrar cupos
            </button>
          </div>
          {reservation.joinNote && (
            <p className="text-sm text-text-secondary leading-relaxed border-l-2 border-brand/40 pl-3 italic">
              "{reservation.joinNote}"
            </p>
          )}
          {(pending.length > 0 || accepted.length > 0) && (
            <div className="space-y-2">
              {accepted.map((j) => (
                <div key={j.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-2xs font-display font-bold text-brand">
                    {j.user.firstName[0]}{j.user.lastName[0]}
                  </div>
                  <span className="text-sm text-text-primary flex-1">{j.user.firstName} {j.user.lastName}</span>
                  <span className="badge-brand text-2xs">Aceptado</span>
                </div>
              ))}
              {pending.map((j) => (
                <div key={j.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-surface-light border border-border-dark flex items-center justify-center text-2xs font-display font-bold text-text-secondary">
                    {j.user.firstName[0]}{j.user.lastName[0]}
                  </div>
                  <span className="text-sm text-text-primary flex-1">{j.user.firstName} {j.user.lastName}</span>
                  <button
                    onClick={() => respond(j.id, true)}
                    disabled={busy === j.id}
                    className="btn-icon-sm hover:text-brand"
                    aria-label="Aceptar"
                  >
                    {busy === j.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => respond(j.id, false)}
                    disabled={busy === j.id}
                    className="btn-icon-sm hover:text-negative"
                    aria-label="Rechazar"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
