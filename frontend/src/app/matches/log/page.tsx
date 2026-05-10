'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate, todayString, formatDateTime } from '@/lib/date';
import {
  Plus,
  Trophy,
  Swords,
  X,
  Search,
  Loader2,
  CalendarCheck,
  MapPin,
  StickyNote,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Filter,
  Activity,
} from 'lucide-react';

type Side = 'PARTNER' | 'OPPONENT';
type Outcome = 'WON' | 'LOST' | 'DRAW';
type SportT = 'PADEL' | 'TENNIS';

interface ParticipantInput {
  side: Side;
  userId?: string;
  firstName?: string;
  lastName?: string;
  noteAboutPlayer?: string;
  // For UI display when picked from search
  _displayLabel?: string;
}

interface ParticipantOut {
  id: string;
  side: Side;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  noteAboutPlayer: string | null;
  user?: { id: string; firstName: string; lastName: string };
}

interface LogEntry {
  id: string;
  ownerId: string;
  matchId: string | null;
  tournamentMatchId: string | null;
  sport: SportT;
  date: string;
  startTime: string | null;
  city: string | null;
  venue: string | null;
  myScore: string | null;
  opponentScore: string | null;
  result: Outcome | null;
  notes: string | null;
  participants: ParticipantOut[];
  tournamentMatch: { tournament: { id: string; name: string } } | null;
}

type EmptyForm = {
  sport: SportT;
  date: string;
  startTime: string;
  city: string;
  venue: string;
  myScore: string;
  opponentScore: string;
  result: Outcome | '';
  notes: string;
  participants: ParticipantInput[];
};

const EMPTY_FORM = (): EmptyForm => ({
  sport: 'PADEL',
  date: todayString(),
  startTime: '',
  city: '',
  venue: '',
  myScore: '',
  opponentScore: '',
  result: '',
  notes: '',
  participants: [{ side: 'OPPONENT' }],
});

export default function MatchLogPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div>}>
      <MatchLogPageInner />
    </Suspense>
  );
}

function MatchLogPageInner() {
  const { user, loading: authLoading } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const queryTournamentMatchId = params.get('tournamentMatchId') || null;
  const queryMatchId = params.get('matchId') || null;

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState<'' | SportT>('');
  const [filterOpponent, setFilterOpponent] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkContext, setLinkContext] = useState<{ tournamentMatchId?: string; matchId?: string } | null>(null);
  const [form, setForm] = useState<EmptyForm>(EMPTY_FORM());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterSport) params.set('sport', filterSport);
    if (filterOpponent.trim()) params.set('opponent', filterOpponent.trim());
    try {
      const res = await api.get<{ entries: LogEntry[] }>(`/match-log?${params}`);
      setEntries(res.entries || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar tu historial');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Reload on filter change (debounce text)
  useEffect(() => {
    if (!user) return;
    const handle = setTimeout(load, filterOpponent ? 250 : 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSport, filterOpponent]);

  const openCreate = (ctx?: { tournamentMatchId?: string; matchId?: string }) => {
    setEditingId(null);
    setLinkContext(ctx || null);
    setForm(EMPTY_FORM());
    setCreateOpen(true);
  };

  // Auto-open form when arriving with a tournamentMatchId or matchId in the URL.
  // Strip the params after opening so a refresh doesn't reopen.
  useEffect(() => {
    if (!user) return;
    if (queryTournamentMatchId || queryMatchId) {
      openCreate({
        tournamentMatchId: queryTournamentMatchId || undefined,
        matchId: queryMatchId || undefined,
      });
      router.replace('/matches/log');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, queryTournamentMatchId, queryMatchId]);

  const openEdit = (e: LogEntry) => {
    setEditingId(e.id);
    setForm({
      sport: e.sport,
      date: e.date.slice(0, 10),
      startTime: e.startTime || '',
      city: e.city || '',
      venue: e.venue || '',
      myScore: e.myScore || '',
      opponentScore: e.opponentScore || '',
      result: e.result || '',
      notes: e.notes || '',
      participants: e.participants.map((p) => ({
        side: p.side,
        userId: p.userId || undefined,
        firstName: p.firstName || (p.user ? p.user.firstName : undefined),
        lastName: p.lastName || (p.user ? p.user.lastName : undefined),
        noteAboutPlayer: p.noteAboutPlayer || undefined,
        _displayLabel: p.user ? `${p.user.firstName} ${p.user.lastName}` : `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      })),
    });
    setCreateOpen(true);
  };

  const closeForm = () => {
    setCreateOpen(false);
    setEditingId(null);
    setLinkContext(null);
    setForm(EMPTY_FORM());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.participants.filter((p) => p.side === 'OPPONENT').length === 0) {
      toast.error('Agregá al menos un rival');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        sport: form.sport,
        date: form.date,
        startTime: form.startTime || undefined,
        city: form.city || undefined,
        venue: form.venue || undefined,
        // Score is ignored server-side when linked to a TournamentMatch.
        myScore: form.myScore || undefined,
        opponentScore: form.opponentScore || undefined,
        result: form.result || undefined,
        notes: form.notes || undefined,
        // Linkage from URL context (only on create, not edit)
        ...(linkContext && !editingId ? linkContext : {}),
        participants: form.participants
          .filter((p) => p.userId || (p.firstName?.trim() || p.lastName?.trim()))
          .map((p) => ({
            side: p.side,
            userId: p.userId,
            firstName: p.userId ? undefined : p.firstName?.trim(),
            lastName: p.userId ? undefined : p.lastName?.trim(),
            noteAboutPlayer: p.noteAboutPlayer || undefined,
          })),
      };
      if (editingId) {
        await api.patch(`/match-log/${editingId}`, payload);
        toast.success('Entrada actualizada');
      } else {
        await api.post('/match-log', payload);
        toast.success('Partido registrado');
      }
      closeForm();
      load();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta entrada?')) return;
    try {
      await api.delete(`/match-log/${id}`);
      toast.success('Eliminada');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-sm text-text-muted mb-4">Necesitás iniciar sesión para ver tu historial.</p>
        <Link href="/login" className="btn-primary">Ingresar</Link>
      </div>
    );
  }

  return (
    <div className="bg-base">
      {/* Header */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="eyebrow text-text-muted">Tu juego</p>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
              Mi historial
            </h1>
          </div>
          <button onClick={() => openCreate()} className="btn-primary text-sm h-9">
            <Plus className="w-3.5 h-3.5" />
            Registrar partido
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-2xs text-text-muted uppercase font-semibold tracking-widest mb-1" style={{ letterSpacing: '0.1em' }}>
              Deporte
            </label>
            <div className="flex gap-1 bg-surface-light border border-border-dark rounded-lg p-0.5">
              {[
                { v: '', label: 'Todos' },
                { v: 'PADEL', label: 'Padel' },
                { v: 'TENNIS', label: 'Tenis' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setFilterSport(opt.v as any)}
                  className={`px-3 h-9 text-xs font-medium rounded-md transition-colors ${
                    filterSport === opt.v
                      ? opt.v === 'TENNIS' ? 'bg-clay text-white'
                      : opt.v === 'PADEL'  ? 'bg-sky text-white'
                      : 'bg-surface text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-[180px]">
            <label className="text-2xs text-text-muted uppercase font-semibold tracking-widest mb-1" style={{ letterSpacing: '0.1em' }}>
              Buscar rival
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                className="input h-10 pl-9"
                placeholder="Nombre o apellido…"
                value={filterOpponent}
                onChange={(e) => setFilterOpponent(e.target.value)}
              />
            </div>
          </div>
          {(filterSport || filterOpponent) && (
            <button onClick={() => { setFilterSport(''); setFilterOpponent(''); }} className="btn-ghost h-10 text-xs">
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="card-elevated text-center py-16">
            <div className="w-12 h-12 rounded-lg bg-surface-light text-text-muted mx-auto mb-4 flex items-center justify-center">
              <StickyNote className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Sin partidos registrados</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
              Anotá tus partidos para llevar un historial de contra quién jugaste, qué pasó y cómo te fue.
            </p>
            <button onClick={() => openCreate()} className="btn-primary">
              <Plus className="w-3.5 h-3.5" />
              Registrar mi primer partido
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <EntryCard key={e.id} entry={e} onEdit={() => openEdit(e)} onDelete={() => handleDelete(e.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {createOpen && (
        <EntryFormModal
          editingId={editingId}
          linkContext={linkContext}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Entry card
   ───────────────────────────────────────────────────────────── */
function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: LogEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [openingScoreboard, setOpeningScoreboard] = useState(false);
  const opponents = entry.participants.filter((p) => p.side === 'OPPONENT');
  const partners  = entry.participants.filter((p) => p.side === 'PARTNER');
  const isTournamentLinked = !!entry.tournamentMatchId;
  const result = entry.result;

  const openScoreboard = async () => {
    setOpeningScoreboard(true);
    try {
      // If tournament-linked, look for an existing personal mirror first.
      if (entry.tournamentMatchId) {
        const peers = await api.get<{ official: any; mine: any }>(
          `/scoreboards/by-tournament-match/${entry.tournamentMatchId}`,
        ).catch(() => ({ official: null, mine: null }));
        if (peers.mine?.id) {
          router.push(`/scoreboard/${peers.mine.id}`);
          return;
        }
      }
      // Build labels: me + partner on home side, opponents on away side.
      const nameOf = (p: ParticipantOut): string => p.user
        ? `${p.user.firstName} ${p.user.lastName}`
        : [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Sin nombre';
      const meName = user ? `${user.firstName}${partners[0] ? ` / ${nameOf(partners[0])}` : ''}` : 'Yo';
      const awayName = opponents.length > 0
        ? opponents.map(nameOf).join(' / ')
        : 'Rival';
      const created = await api.post<any>('/scoreboards', {
        sport: entry.sport,
        homeLabel: meName,
        awayLabel: awayName,
        scoringMode: 'STANDARD',
        totalSets: 3,
        superTieBreak: false,
        tournamentMatchId: entry.tournamentMatchId || undefined,
      });
      router.push(`/scoreboard/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al abrir anotador');
    } finally {
      setOpeningScoreboard(false);
    }
  };

  const displayName = (p: ParticipantOut): string => {
    if (p.user) return `${p.user.firstName} ${p.user.lastName}`;
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Sin nombre';
  };

  return (
    <div className="card-elevated">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={entry.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
              {entry.sport === 'PADEL' ? 'Padel' : 'Tenis'}
            </span>
            {result === 'WON'  && <span className="badge-brand">Ganado</span>}
            {result === 'LOST' && <span className="badge-red">Perdido</span>}
            {result === 'DRAW' && <span className="badge-yellow">Empate</span>}
            {isTournamentLinked && (
              <span className="badge-neutral">
                <Lock className="w-3 h-3" /> Torneo
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5 tabular">
              <CalendarCheck className="w-3.5 h-3.5 text-text-muted" />
              {formatDate(entry.date)}
              {entry.startTime && <span className="text-text-muted">· {entry.startTime}</span>}
            </span>
            {entry.venue && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                {entry.venue}{entry.city ? `, ${entry.city}` : ''}
              </span>
            )}
          </div>

          {entry.tournamentMatch?.tournament && (
            <p className="text-2xs text-text-muted mt-1.5 inline-flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <Link href={`/tournaments/${entry.tournamentMatch.tournament.id}`} className="text-text-secondary hover:text-text-primary transition-colors">
                {entry.tournamentMatch.tournament.name}
              </Link>
            </p>
          )}

          {/* Opponents and partners */}
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {opponents.length > 0 && (
              <div>
                <p className="text-2xs uppercase font-semibold text-text-muted tracking-widest mb-1.5" style={{ letterSpacing: '0.1em' }}>
                  Rival{opponents.length > 1 ? 'es' : ''}
                </p>
                <div className="space-y-1">
                  {opponents.map((p) => {
                    // Build head-to-head URL: by userId if registered, by name if phantom.
                    const vsUrl = p.user
                      ? `/matches/log/vs?userId=${p.user.id}`
                      : `/matches/log/vs?firstName=${encodeURIComponent(p.firstName || '')}&lastName=${encodeURIComponent(p.lastName || '')}`;
                    return (
                      <p key={p.id} className="text-sm text-text-primary inline-flex items-center gap-1.5">
                        <Link
                          href={vsUrl}
                          className="hover:text-brand transition-colors"
                          title={`Ver historial vs ${displayName(p)}`}
                        >
                          {displayName(p)}
                        </Link>
                        {!p.user && <span className="text-2xs text-text-muted">(sin cuenta)</span>}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
            {partners.length > 0 && (
              <div>
                <p className="text-2xs uppercase font-semibold text-text-muted tracking-widest mb-1.5" style={{ letterSpacing: '0.1em' }}>
                  Compañero{partners.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-1">
                  {partners.map((p) => (
                    <p key={p.id} className="text-sm text-text-primary">{displayName(p)}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Score */}
          {(entry.myScore || entry.opponentScore) && (
            <div className="mt-3 pt-3 border-t border-border-dark">
              <p className="text-2xs uppercase font-semibold text-text-muted tracking-widest mb-1" style={{ letterSpacing: '0.1em' }}>
                Marcador
              </p>
              <p className="text-sm font-mono text-text-primary tabular">
                {entry.myScore || '—'} <span className="text-text-muted">vs</span> {entry.opponentScore || '—'}
              </p>
            </div>
          )}

          {/* Notes (collapsible) */}
          {entry.notes && (
            <div className="mt-3 pt-3 border-t border-border-dark">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-2xs uppercase font-semibold text-text-muted hover:text-text-primary tracking-widest inline-flex items-center gap-1"
                style={{ letterSpacing: '0.1em' }}
              >
                <StickyNote className="w-3 h-3" /> Notas privadas
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {expanded && (
                <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap leading-relaxed">{entry.notes}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={openScoreboard}
            disabled={openingScoreboard}
            className="btn-icon-sm hover:text-brand"
            aria-label="Abrir anotador"
            title="Abrir anotador en vivo"
          >
            {openingScoreboard
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Activity className="w-3.5 h-3.5" />
            }
          </button>
          <button onClick={onEdit} className="btn-icon-sm" aria-label="Editar">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="btn-icon-sm hover:text-negative" aria-label="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Modal — create / edit form
   ───────────────────────────────────────────────────────────── */
function EntryFormModal({
  editingId,
  linkContext,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}: {
  editingId: string | null;
  linkContext: { tournamentMatchId?: string; matchId?: string } | null;
  form: EmptyForm;
  setForm: (f: EmptyForm) => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isTournamentLinked = !!linkContext?.tournamentMatchId;
  const setParticipant = (idx: number, patch: Partial<ParticipantInput>) => {
    const next = [...form.participants];
    next[idx] = { ...next[idx], ...patch };
    setForm({ ...form, participants: next });
  };
  const removeParticipant = (idx: number) => {
    setForm({ ...form, participants: form.participants.filter((_, i) => i !== idx) });
  };
  const addParticipant = (side: Side) => {
    setForm({ ...form, participants: [...form.participants, { side }] });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={onSubmit}
        className="glass-dark max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in"
      >
        <header className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-dark shrink-0">
          <div>
            <p className="eyebrow text-text-muted">Mi historial</p>
            <h2 className="text-lg font-bold text-text-primary tracking-tight-2 mt-1">
              {editingId ? 'Editar partido' : 'Registrar partido'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon-sm" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0 space-y-5">
          {/* Tournament linkage banner */}
          {isTournamentLinked && (
            <div className="rounded-lg border border-clay/30 bg-clay/8 p-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-clay/20 text-clay flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 text-2xs">
                <p className="text-text-primary font-semibold">Vinculado a un torneo</p>
                <p className="text-text-secondary leading-relaxed mt-0.5">
                  Esta entrada queda como notas privadas sobre un partido oficial.
                  El marcador lo carga el organizador del torneo — los campos de marcador acá quedan deshabilitados.
                </p>
              </div>
            </div>
          )}

          {/* Sport + date + time */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Deporte</label>
              <select
                className="input"
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value as SportT })}
              >
                <option value="PADEL">Padel</option>
                <option value="TENNIS">Tenis</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Hora</label>
              <input
                type="time"
                className="input"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Resultado</label>
              <select
                className="input"
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value as Outcome | '' })}
              >
                <option value="">Sin definir</option>
                <option value="WON">Ganado</option>
                <option value="LOST">Perdido</option>
                <option value="DRAW">Empate</option>
              </select>
            </div>
          </div>

          {/* Venue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Lugar</label>
              <input
                type="text"
                className="input"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Club Almagro"
              />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input
                type="text"
                className="input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Capital Federal"
              />
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="label">Marcador {isTournamentLinked && <span className="text-text-muted normal-case font-normal">(deshabilitado, lo carga el organizador)</span>}</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                className="input font-mono"
                value={form.myScore}
                onChange={(e) => setForm({ ...form, myScore: e.target.value })}
                placeholder="6-4 6-3 (vos)"
                disabled={isTournamentLinked}
              />
              <input
                type="text"
                className="input font-mono"
                value={form.opponentScore}
                onChange={(e) => setForm({ ...form, opponentScore: e.target.value })}
                placeholder="4-6 3-6 (rival)"
                disabled={isTournamentLinked}
              />
            </div>
            {!isTournamentLinked && (
              <p className="text-2xs text-text-muted mt-1.5">
                Si fue un torneo en pelotitas, el marcador oficial lo cargará el organizador.
                Tu entrada queda como notas privadas.
              </p>
            )}
          </div>

          {/* Participants */}
          <div>
            <label className="label">Rivales y compañeros</label>
            <p className="text-2xs text-text-muted mb-3">
              Si el rival está en pelotitas, buscalo. Si no, escribí nombre y apellido —
              después podés vincularlo cuando se registre.
            </p>

            <div className="space-y-2">
              {form.participants.map((p, idx) => (
                <ParticipantRow
                  key={idx}
                  participant={p}
                  onChange={(patch) => setParticipant(idx, patch)}
                  onRemove={() => removeParticipant(idx)}
                />
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => addParticipant('OPPONENT')}
                className="btn-secondary text-xs h-8"
              >
                <UserPlus className="w-3 h-3" /> Agregar rival
              </button>
              <button
                type="button"
                onClick={() => addParticipant('PARTNER')}
                className="btn-secondary text-xs h-8"
              >
                <UserPlus className="w-3 h-3" /> Agregar compañero
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notas privadas</label>
            <textarea
              className="textarea"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Cómo fue el partido, qué hiciste bien, qué mejorar, observaciones del rival…"
            />
            <p className="text-2xs text-text-muted mt-1.5">
              <Lock className="w-3 h-3 inline -mt-0.5 mr-1" />
              Sólo vos podés leer estas notas.
            </p>
          </div>
        </div>

        <footer className="flex items-center gap-3 px-6 py-4 border-t border-border-dark shrink-0">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <div className="flex-1" />
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…</>
              : editingId ? 'Guardar cambios' : 'Registrar partido'
            }
          </button>
        </footer>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Participant row — user search OR phantom name
   ───────────────────────────────────────────────────────────── */
function ParticipantRow({
  participant,
  onChange,
  onRemove,
}: {
  participant: ParticipantInput;
  onChange: (patch: Partial<ParticipantInput>) => void;
  onRemove: () => void;
}) {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [query, setQuery] = useState(participant._displayLabel || '');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [open, setOpen] = useState(false);

  const isLinked = !!participant.userId;

  useEffect(() => {
    setQuery(participant._displayLabel || '');
  }, [participant._displayLabel, participant.userId, participant.firstName, participant.lastName]);

  const onQueryChange = (v: string) => {
    setQuery(v);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get<{ players: any[] }>(`/users/search?city=&sport=&page=1`).catch(() => ({ players: [] }));
        const matches = (res.players || [])
          .filter((p: any) =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(v.toLowerCase()),
          )
          .slice(0, 6);
        setResults(matches);
      } finally {
        setSearching(false);
      }
    }, 250);
  };

  const pickUser = (u: { id: string; firstName: string; lastName: string }) => {
    onChange({
      userId: u.id,
      firstName: undefined,
      lastName: undefined,
      _displayLabel: `${u.firstName} ${u.lastName}`,
    });
    setQuery(`${u.firstName} ${u.lastName}`);
    setOpen(false);
  };

  const usePhantom = () => {
    // Split query into firstName + lastName by first space.
    const trimmed = query.trim();
    const space = trimmed.indexOf(' ');
    const firstName = space > 0 ? trimmed.slice(0, space) : trimmed;
    const lastName = space > 0 ? trimmed.slice(space + 1) : '';
    onChange({
      userId: undefined,
      firstName,
      lastName,
      _displayLabel: trimmed,
    });
    setOpen(false);
  };

  return (
    <div className="rounded-lg border border-border-dark bg-surface p-3 space-y-2">
      <div className="flex items-center gap-2">
        <select
          className="input h-8 text-xs w-32"
          value={participant.side}
          onChange={(e) => onChange({ side: e.target.value as Side })}
        >
          <option value="OPPONENT">Rival</option>
          <option value="PARTNER">Compañero</option>
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            className={`input h-8 text-xs ${isLinked ? 'pr-8' : ''}`}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Nombre y apellido o buscar en pelotitas…"
          />
          {isLinked && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-brand font-semibold">
              ✓ vinculado
            </span>
          )}
          {open && (results.length > 0 || query.trim().length >= 2) && (
            <div
              className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border border-border-dark bg-surface-card overflow-hidden"
              style={{ boxShadow: '0 16px 40px -10px rgba(0,0,0,0.7)' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {searching && <p className="px-3 py-2 text-2xs text-text-muted">Buscando…</p>}
              {!searching && results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => pickUser(r)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-surface-light text-text-primary transition-colors"
                >
                  <span className="font-medium">{r.firstName} {r.lastName}</span>
                  <span className="text-2xs text-brand ml-2">en pelotitas</span>
                </button>
              ))}
              {!searching && query.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={usePhantom}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-surface-light text-text-secondary transition-colors border-t border-border-dark"
                >
                  Usar como nombre <span className="text-text-primary font-medium">"{query.trim()}"</span>
                  <span className="text-2xs text-text-muted ml-2">(sin cuenta)</span>
                </button>
              )}
            </div>
          )}
        </div>

        <button type="button" onClick={onRemove} className="btn-icon-sm hover:text-negative" aria-label="Quitar">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Note about this player */}
      <input
        type="text"
        className="input h-8 text-xs"
        value={participant.noteAboutPlayer || ''}
        onChange={(e) => onChange({ noteAboutPlayer: e.target.value })}
        placeholder="Nota sobre este jugador (opcional)"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton
   ───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="card animate-pulse">
      <div className="h-3 w-24 bg-surface-light rounded mb-3" />
      <div className="h-4 w-2/3 bg-surface-light rounded mb-2" />
      <div className="h-3 w-1/2 bg-surface-light rounded" />
    </div>
  );
}
