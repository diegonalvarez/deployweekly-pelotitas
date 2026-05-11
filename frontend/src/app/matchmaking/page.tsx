'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/date';
import { Loader2, Users, MapPin } from 'lucide-react';
import { CanchaIcon } from '@/components/icons/SportIcons';

type Sport = 'PADEL' | 'TENNIS';
type OpenSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: Sport;
  slotsNeeded: number;
  joinLevelMin: string | null;
  joinLevelMax: string | null;
  joinNote: string | null;
  user: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  court: { id: string; name: string; club: { id: string; name: string } };
  joiners: {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
    userId: string;
    user: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  }[];
};

export default function MatchmakingPage() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<OpenSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState<Sport | ''>('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (sport) qs.set('sport', sport);
    api
      .get<OpenSlot[]>(`/reservations/open-slots?${qs}`)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); }, [user, sport]);

  const requestJoin = async (slot: OpenSlot) => {
    setBusy(slot.id);
    try {
      await api.post(`/reservations/${slot.id}/join`, { message: null });
      toast.success('Pedido enviado al dueño');
      load();
    } catch (err: any) {
      toast.error(err.message || 'No se pudo enviar el pedido');
    } finally {
      setBusy(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-text-secondary">Necesitás iniciar sesión.</p>
        <Link href="/login" className="btn-primary mt-4">Ingresar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="eyebrow text-text-muted mb-2">Matchmaking</p>
        <h1 className="section-header mb-3">Buscar partido</h1>
        <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
          Turnos reservados a los que les faltan jugadores. Si te sumás, el dueño tiene
          que aceptar el pedido. Para abrir cupos en tu propia reserva, andá a{' '}
          <Link href="/reservations" className="text-brand underline">Mis reservas</Link>.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[
          { v: '' as const, l: 'Todos' },
          { v: 'PADEL' as const, l: 'Padel' },
          { v: 'TENNIS' as const, l: 'Tenis' },
        ].map((opt) => {
          const active = sport === opt.v;
          return (
            <button
              key={opt.v}
              onClick={() => setSport(opt.v)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                active
                  ? 'bg-brand text-brand-ink border-brand'
                  : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default hover:text-text-primary'
              }`}
            >
              {opt.l}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <CanchaIcon className="w-10 h-10 text-text-muted mx-auto mb-4" />
          <p className="font-display font-semibold text-lg text-text-primary mb-2">
            No hay cupos abiertos
          </p>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Volvé en un rato o abrí cupos en tu propia reserva para que otros se sumen.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => {
            const myJoin = slot.joiners.find((j) => j.userId === user.id);
            const accepted = slot.joiners.filter((j) => j.status === 'ACCEPTED');
            const pending = slot.joiners.filter((j) => j.status === 'PENDING');

            return (
              <article key={slot.id} className="card-elevated">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={slot.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                        {slot.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                      </span>
                      <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                        {formatDate(slot.date)} · {slot.startTime}–{slot.endTime}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg sm:text-xl tracking-tight-2 truncate">
                      {slot.court.club.name}
                      <span className="text-text-muted font-normal text-base"> · {slot.court.name}</span>
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Organiza <span className="text-text-primary font-medium">{slot.user.firstName} {slot.user.lastName}</span>
                    </p>
                    {slot.joinNote && (
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed border-l-2 border-brand/40 pl-3 italic">
                        "{slot.joinNote}"
                      </p>
                    )}
                    {(slot.joinLevelMin || slot.joinLevelMax) && (
                      <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-2">
                        Nivel: {slot.joinLevelMin || '—'} {slot.joinLevelMax ? `· ${slot.joinLevelMax}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">Faltan</p>
                    <p className="score-digit text-4xl text-brand">{slot.slotsNeeded}</p>
                    <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                      {slot.slotsNeeded === 1 ? 'jugador' : 'jugadores'}
                    </p>
                  </div>
                </div>

                {/* Joiners stats + CTA */}
                <div className="mt-4 pt-4 border-t border-border-dark flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono text-2xs uppercase tracking-widest">
                      {accepted.length} aceptado{accepted.length === 1 ? '' : 's'}
                      {pending.length > 0 && ` · ${pending.length} esperando`}
                    </span>
                  </div>

                  {myJoin ? (
                    <span className={`font-mono text-2xs uppercase tracking-widest font-semibold ${
                      myJoin.status === 'ACCEPTED' ? 'text-brand' :
                      myJoin.status === 'PENDING' ? 'text-warning' :
                      'text-negative'
                    }`}>
                      ▸ {myJoin.status === 'ACCEPTED' ? 'Estás en el partido' :
                          myJoin.status === 'PENDING' ? 'Pedido enviado' :
                          'No quedaste'}
                    </span>
                  ) : (
                    <button
                      onClick={() => requestJoin(slot)}
                      disabled={busy === slot.id}
                      className="btn-primary text-xs"
                    >
                      {busy === slot.id
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Enviando…</>
                        : 'Anotarme'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
