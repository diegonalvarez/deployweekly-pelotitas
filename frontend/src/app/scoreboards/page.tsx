'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import {
  Plus,
  Loader2,
  X,
  Trophy,
  Activity,
  Lock,
  ChevronRight,
} from 'lucide-react';

type Sport = 'PADEL' | 'TENNIS';
type Status = 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

type Scoreboard = {
  id: string;
  isOfficial: boolean;
  sport: Sport;
  homeLabel: string;
  awayLabel: string;
  scoringMode: 'STANDARD' | 'GOLDEN_POINT';
  totalSets: number;
  superTieBreak: boolean;
  status: Status;
  currentSet: number;
  homeSetGames: number[];
  awaySetGames: number[];
  winner: 'HOME' | 'AWAY' | null;
  updatedAt: string;
  tournamentMatch: { tournament: { id: string; name: string } } | null;
};

export default function ScoreboardsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<Scoreboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Scoreboard[]>('/scoreboards');
      setList(Array.isArray(res) ? res : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div>;
  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  const live = list.filter((s) => s.status === 'IN_PROGRESS' || s.status === 'PAUSED');
  const done = list.filter((s) => s.status === 'COMPLETED' || s.status === 'ABANDONED');

  return (
    <div className="bg-base">
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="eyebrow text-text-muted">Tu juego</p>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
              Anotadores
            </h1>
          </div>
          <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm h-9">
            <Plus className="w-3.5 h-3.5" />
            Nuevo anotador
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
          </div>
        ) : list.length === 0 ? (
          <div className="card-elevated text-center py-16">
            <div className="w-12 h-12 rounded-lg bg-surface-light text-text-muted mx-auto mb-4 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Sin anotadores</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
              Creá un anotador para llevar el marcador en tiempo real durante un partido —
              punto por punto, con audit log y settings configurables.
            </p>
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus className="w-3.5 h-3.5" /> Mi primer anotador
            </button>
          </div>
        ) : (
          <>
            {live.length > 0 && (
              <Section title="En curso" badge={live.length}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {live.map((s) => <ScoreboardRow key={s.id} sb={s} />)}
                </div>
              </Section>
            )}
            {done.length > 0 && (
              <Section title="Finalizados" badge={done.length}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {done.map((s) => <ScoreboardRow key={s.id} sb={s} />)}
                </div>
              </Section>
            )}
          </>
        )}
      </div>

      {createOpen && (
        <CreateScoreboardModal
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => { setCreateOpen(false); router.push(`/scoreboard/${id}`); }}
        />
      )}
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: number; children: React.ReactNode }) {
  return (
    <section>
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
        {badge !== undefined && <span className="text-2xs text-text-muted tabular">{badge}</span>}
      </header>
      {children}
    </section>
  );
}

function ScoreboardRow({ sb }: { sb: Scoreboard }) {
  const setsLine = (side: 'HOME' | 'AWAY') => {
    const games = side === 'HOME' ? sb.homeSetGames : sb.awaySetGames;
    return games.join(' · ');
  };

  return (
    <Link
      href={`/scoreboard/${sb.id}`}
      className="card-interactive block group"
    >
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={sb.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
          {sb.sport === 'PADEL' ? 'Padel' : 'Tenis'}
        </span>
        {sb.isOfficial && <span className="badge-yellow"><Trophy className="w-3 h-3" /> Oficial</span>}
        {sb.status === 'IN_PROGRESS' && (
          <span className="text-2xs text-brand inline-flex items-center gap-1">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-brand" />
            </span>
            En vivo
          </span>
        )}
        {sb.status === 'COMPLETED' && <span className="badge-brand">Finalizado</span>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <p className={`text-sm font-semibold truncate ${sb.winner === 'HOME' ? 'text-brand' : 'text-text-primary'}`}>
            {sb.homeLabel}
          </p>
          <p className="text-sm font-mono tabular text-text-secondary shrink-0">{setsLine('HOME')}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className={`text-sm font-semibold truncate ${sb.winner === 'AWAY' ? 'text-brand' : 'text-text-primary'}`}>
            {sb.awayLabel}
          </p>
          <p className="text-sm font-mono tabular text-text-secondary shrink-0">{setsLine('AWAY')}</p>
        </div>
      </div>

      {sb.tournamentMatch?.tournament && (
        <p className="text-2xs text-text-muted mt-3 inline-flex items-center gap-1">
          <Trophy className="w-3 h-3" /> {sb.tournamentMatch.tournament.name}
        </p>
      )}

      <p className="text-2xs text-text-muted mt-1.5 tabular">{formatDate(sb.updatedAt)}</p>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Create modal
   ───────────────────────────────────────────────────────────── */
function CreateScoreboardModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState({
    sport: 'PADEL' as Sport,
    homeLabel: '',
    awayLabel: '',
    scoringMode: 'STANDARD' as 'STANDARD' | 'GOLDEN_POINT',
    totalSets: 3,
    superTieBreak: false,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.homeLabel.trim() || !form.awayLabel.trim()) {
      toast.error('Cargá ambos lados');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<{ id: string }>('/scoreboards', form);
      onCreated(res.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear anotador');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form onSubmit={submit} className="glass-dark max-w-md w-full animate-scale-in">
        <header className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-dark">
          <div>
            <p className="eyebrow text-text-muted">Anotador</p>
            <h2 className="text-lg font-bold text-text-primary tracking-tight-2 mt-1">Nuevo anotador</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon-sm"><X className="w-4 h-4" /></button>
        </header>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Local</label>
              <input
                className="input"
                value={form.homeLabel}
                onChange={(e) => setForm({ ...form, homeLabel: e.target.value })}
                placeholder="Diego / Juan"
                required
              />
            </div>
            <div>
              <label className="label">Visitante</label>
              <input
                className="input"
                value={form.awayLabel}
                onChange={(e) => setForm({ ...form, awayLabel: e.target.value })}
                placeholder="Lucas / Pablo"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Deporte</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ v: 'PADEL', l: 'Padel', cls: 'bg-sky text-white' },
                { v: 'TENNIS', l: 'Tenis', cls: 'bg-clay text-white' }].map((opt) => {
                const active = form.sport === opt.v;
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm({ ...form, sport: opt.v as Sport })}
                    className={`h-10 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? `${opt.cls} border-transparent`
                        : 'bg-surface-light text-text-secondary border-border-dark hover:border-border-default'
                    }`}
                  >
                    {opt.l}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Modo</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'STANDARD',     l: 'Deuce / ventaja' },
                { v: 'GOLDEN_POINT', l: 'Punto de oro' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setForm({ ...form, scoringMode: opt.v as any })}
                  className={`h-10 rounded-lg text-xs font-medium border transition-all ${
                    form.scoringMode === opt.v
                      ? 'bg-brand/10 border-brand/40 text-text-primary'
                      : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Cantidad de sets</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, totalSets: n })}
                  className={`h-10 rounded-lg text-xs font-medium border transition-all ${
                    form.totalSets === n
                      ? 'bg-brand/10 border-brand/40 text-text-primary'
                      : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default'
                  }`}
                >
                  A {n} {n === 1 ? 'set' : 'sets'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, superTieBreak: !form.superTieBreak })}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              form.superTieBreak
                ? 'bg-clay/8 border-clay/30 text-text-primary'
                : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default'
            }`}
          >
            <div className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${form.superTieBreak ? 'bg-clay' : 'bg-border-default'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.superTieBreak ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <div className="min-w-0 flex-1 text-2xs">
              <p className="text-sm font-medium">Super tie-break en último set</p>
              <p className="text-text-muted">El último set se reemplaza por un super tiebreak a 10.</p>
            </div>
          </button>
        </div>

        <footer className="flex items-center gap-3 px-6 py-4 border-t border-border-dark">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <div className="flex-1" />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creando…</>
              : <>Empezar <ChevronRight className="w-3.5 h-3.5" /></>
            }
          </button>
        </footer>
      </form>
    </div>
  );
}
