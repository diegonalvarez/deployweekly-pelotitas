'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/date';
import {
  ArrowLeft,
  Trophy,
  Loader2,
  Plus,
  Undo2,
  Settings,
  Check,
  X,
  Lock,
  Copy,
  History,
  Sparkles,
  Activity,
  ChevronDown,
  Maximize,
  Minimize,
} from 'lucide-react';

type Side = 'HOME' | 'AWAY';
type Status = 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

type Scoreboard = {
  id: string;
  ownerId: string;
  isOfficial: boolean;
  sport: 'PADEL' | 'TENNIS';
  homeLabel: string;
  awayLabel: string;
  scoringMode: 'STANDARD' | 'GOLDEN_POINT';
  totalSets: number;
  gamesPerSet: number;
  superTieBreak: boolean;
  status: Status;
  currentSet: number;
  homeSetGames: number[];
  awaySetGames: number[];
  homePoints: number;
  awayPoints: number;
  homeAdvantage: boolean;
  awayAdvantage: boolean;
  inTieBreak: boolean;
  inSuperTieBreak: boolean;
  homeTbPoints: number;
  awayTbPoints: number;
  servingSide: Side;
  winner: Side | null;
  notes: string | null;
  tournamentMatchId: string | null;
  mirrorsScoreboardId: string | null;
  tournamentMatch: { tournamentId: string; tournament: { id: string; name: string } } | null;
  events: ScoreboardEvent[];
};

type ScoreboardEvent = {
  id: string;
  action: string;
  payload: any;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
};

type ByMatchResponse = {
  official: Scoreboard | null;
  mine: Scoreboard | null;
};

const POINT_LABEL = ['0', '15', '30', '40'];

/** Split a doubles label like "Diego / Juan" into two names; single names return [name, null]. */
function splitDoubles(label?: string | null): [string, string | null] {
  if (!label) return ['', null];
  const parts = label.split(/\s*\/\s*/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return [parts[0].trim(), parts.slice(1).join(' / ').trim()];
  }
  return [label.trim(), null];
}

export default function ScoreboardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [sb, setSb] = useState<Scoreboard | null>(null);
  const [official, setOfficial] = useState<Scoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [courtMode, setCourtMode] = useState(false);

  const isOwner = !!(user && sb && sb.ownerId === user.id);
  const canEdit = isOwner && sb?.status !== 'COMPLETED';

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get<Scoreboard>(`/scoreboards/${id}`);
      setSb(data);
      // If linked to a tournament, fetch the official sibling for side-by-side display.
      if (data.tournamentMatchId) {
        const peers = await api.get<ByMatchResponse>(`/scoreboards/by-tournament-match/${data.tournamentMatchId}`).catch(() => null);
        if (peers && peers.official && peers.official.id !== data.id) {
          setOfficial(peers.official);
        } else {
          setOfficial(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar anotador');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const awardPoint = async (side: Side) => {
    if (!sb || !canEdit) return;
    setBusy(`point-${side}`);
    try {
      const updated = await api.post<Scoreboard>(`/scoreboards/${sb.id}/point`, { side });
      setSb(updated);
      if (updated.status === 'COMPLETED') {
        toast.success(`Partido finalizado · ${updated.winner === 'HOME' ? updated.homeLabel : updated.awayLabel}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setBusy(null);
    }
  };

  const undo = async () => {
    if (!sb || !canEdit) return;
    setBusy('undo');
    try {
      const updated = await api.post<Scoreboard>(`/scoreboards/${sb.id}/undo`, {});
      setSb(updated);
    } catch (err: any) {
      toast.error(err.message || 'Error al deshacer');
    } finally {
      setBusy(null);
    }
  };

  const copyFromOfficial = async () => {
    if (!sb || !canEdit) return;
    setBusy('copy');
    try {
      const updated = await api.post<Scoreboard>(`/scoreboards/${sb.id}/copy-from-official`, {});
      setSb(updated);
      toast.success('Valores oficiales copiados');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setBusy(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
      </div>
    );
  }
  if (!sb || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-sm text-text-muted mb-4">Anotador no encontrado o no tenés acceso.</p>
        <Link href="/scoreboards" className="btn-secondary">Volver</Link>
      </div>
    );
  }

  const showOfficialSidebar = !sb.isOfficial && !!official;

  return (
    <div className="bg-base">
      {/* Header */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-2xs text-text-muted hover:text-text-primary mb-1.5 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Volver
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="eyebrow text-text-muted">
                {sb.isOfficial ? 'Anotador oficial' : 'Mi anotador'}
              </p>
              {sb.isOfficial && (
                <span className="badge-yellow">
                  <Trophy className="w-3 h-3" /> Oficial
                </span>
              )}
              {sb.tournamentMatch?.tournament && (
                <Link
                  href={`/tournaments/${sb.tournamentMatch.tournament.id}`}
                  className="text-2xs text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
                >
                  <Trophy className="w-3 h-3" /> {sb.tournamentMatch.tournament.name}
                </Link>
              )}
              {sb.status === 'COMPLETED' && (
                <span className="badge-brand">Finalizado</span>
              )}
              <span className={sb.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                {sb.sport === 'PADEL' ? 'Padel' : 'Tenis'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showOfficialSidebar && (
              <button
                onClick={copyFromOfficial}
                disabled={!canEdit || busy === 'copy'}
                className="btn-secondary text-xs h-9"
              >
                {busy === 'copy'
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Copiando…</>
                  : <><Copy className="w-3 h-3" /> Copiar oficial</>
                }
              </button>
            )}
            <button
              onClick={() => setCourtMode(true)}
              className="btn-secondary text-xs h-9"
              aria-label="Modo cancha"
              title="Modo Cancha — fullscreen para anotar al lado de la cancha"
            >
              <Maximize className="w-3.5 h-3.5" /> Modo Cancha
            </button>
            <button onClick={() => setShowAudit(!showAudit)} className="btn-icon" aria-label="Auditoría">
              <History className="w-4 h-4" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="btn-icon" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Settings drawer */}
        {showSettings && (
          <SettingsCard
            sb={sb}
            canEdit={canEdit}
            onClose={() => setShowSettings(false)}
            onUpdate={(updated) => setSb(updated)}
          />
        )}

        {/* Main scoreboard */}
        <main className={`grid gap-5 ${showOfficialSidebar ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
          {/* Scoreboard panel */}
          <div className="card-elevated p-0 overflow-hidden">
            <ScoreboardDisplay sb={sb} />
            {/* Action buttons */}
            <div className="border-t border-border-dark bg-base/40 p-4 sm:p-5 grid grid-cols-2 gap-3">
              <PointButton
                label={`Punto ${sb.homeLabel || 'local'}`}
                side="HOME"
                accent="brand"
                onClick={() => awardPoint('HOME')}
                disabled={!canEdit || !!busy}
                loading={busy === 'point-HOME'}
              />
              <PointButton
                label={`Punto ${sb.awayLabel || 'visitante'}`}
                side="AWAY"
                accent="sky"
                onClick={() => awardPoint('AWAY')}
                disabled={!canEdit || !!busy}
                loading={busy === 'point-AWAY'}
              />
            </div>
            <div className="border-t border-border-dark bg-base/20 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={undo}
                disabled={!canEdit || busy === 'undo'}
                className="btn-ghost text-xs"
              >
                {busy === 'undo'
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Deshaciendo…</>
                  : <><Undo2 className="w-3 h-3" /> Deshacer último punto</>
                }
              </button>
              {!canEdit && (
                <span className="text-2xs text-text-muted inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {sb.status === 'COMPLETED' ? 'Partido finalizado' : 'No editable'}
                </span>
              )}
            </div>
          </div>

          {/* Official side panel (when this is a personal mirror) */}
          {showOfficialSidebar && official && (
            <aside>
              <div className="rounded-xl border-2 border-warning/40 bg-warning/5 overflow-hidden">
                <header className="px-4 py-3 border-b border-warning/30 bg-warning/10 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  <p className="text-xs font-semibold text-warning uppercase tracking-widest" style={{ letterSpacing: '0.12em' }}>
                    Marcador oficial
                  </p>
                </header>
                <div className="p-4">
                  <CompactScoreboard sb={official} accent="warning" />
                  <p className="text-2xs text-text-muted mt-3 leading-relaxed">
                    Este es el marcador oficial del torneo. Tu anotador personal corre en paralelo —
                    podés copiar los valores cuando quieras.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </main>

        {/* Audit feed */}
        {showAudit && <AuditFeed sb={sb} onClose={() => setShowAudit(false)} />}

        {/* Notes */}
        <NotesCard sb={sb} canEdit={canEdit} onUpdate={(u) => setSb(u)} />
      </div>

      {/* Court mode — fullscreen anotador for cancha-side use */}
      {courtMode && (
        <CourtMode
          sb={sb}
          canEdit={canEdit}
          busy={busy}
          onPoint={awardPoint}
          onUndo={undo}
          onExit={() => setCourtMode(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Display — stadium scoreboard hero
   Brutal mono digits, court-line backdrop, Wimbledon header.
   ───────────────────────────────────────────────────────────── */
function ScoreboardDisplay({ sb }: { sb: Scoreboard }) {
  const setsRow = (sb.homeSetGames || []).map((_, i) => i);
  const sportAccent = sb.sport === 'PADEL' ? 'sky' : 'clay';

  return (
    <div className="relative bg-court-lines">
      {/* Subtle radial glow on the side that's serving */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          sb.status === 'IN_PROGRESS' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            sb.servingSide === 'HOME'
              ? 'radial-gradient(at 50% 20%, rgba(212,255,63,0.08), transparent 55%)'
              : 'radial-gradient(at 50% 80%, rgba(107,169,255,0.08), transparent 55%)',
        }}
      />

      {/* Stadium top strip — Wimbledon-y eyebrow */}
      <div className="relative z-10 border-b border-border-dark/60 px-5 sm:px-7 py-3 flex items-center gap-3 flex-wrap">
        <span className="font-mono text-2xs uppercase font-semibold text-text-secondary tracking-[0.18em]">
          Set {sb.currentSet} / {sb.totalSets}
        </span>
        <span className="text-text-muted/40">·</span>
        <span className="font-mono text-2xs uppercase text-text-muted tracking-widest">
          {sb.scoringMode === 'GOLDEN_POINT' ? 'Golden point' : 'Deuce'}
        </span>
        {sb.superTieBreak && (
          <>
            <span className="text-text-muted/40">·</span>
            <span className="font-mono text-2xs uppercase text-text-muted tracking-widest">Super TB</span>
          </>
        )}
        {sb.inTieBreak && (
          <span className="font-mono text-2xs uppercase text-warning tracking-widest font-semibold animate-pulse">
            ▸ Tie-break
          </span>
        )}
        {sb.inSuperTieBreak && (
          <span className="font-mono text-2xs uppercase text-warning tracking-widest font-semibold animate-pulse">
            ▸ Super tie-break
          </span>
        )}

        {/* Set ladder header — small column titles like a real stadium board */}
        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          {setsRow.map((i) => (
            <div
              key={i}
              className={`w-7 sm:w-9 text-center font-mono text-2xs uppercase tracking-widest ${
                i === sb.currentSet - 1 ? 'text-brand' : 'text-text-muted'
              }`}
            >
              S{i + 1}
            </div>
          ))}
          <div className="w-16 sm:w-24 text-center font-mono text-2xs uppercase tracking-widest text-text-muted">
            Pts
          </div>
        </div>
      </div>

      {/* Two giant rows */}
      <div className="relative z-10 divide-y divide-border-dark/60">
        <SideRow side="HOME" sb={sb} setsRow={setsRow} sportAccent={sportAccent} />
        <SideRow side="AWAY" sb={sb} setsRow={setsRow} sportAccent={sportAccent} />
      </div>
    </div>
  );
}

function SideRow({
  side,
  sb,
  setsRow,
  sportAccent,
}: {
  side: Side;
  sb: Scoreboard;
  setsRow: number[];
  sportAccent: 'sky' | 'clay';
}) {
  const isHome = side === 'HOME';
  const label = isHome ? sb.homeLabel : sb.awayLabel;
  const isServing = sb.servingSide === side;
  const setGames = isHome ? sb.homeSetGames : sb.awaySetGames;
  const points = isHome ? sb.homePoints : sb.awayPoints;
  const advantage = isHome ? sb.homeAdvantage : sb.awayAdvantage;
  const tbPoints = isHome ? sb.homeTbPoints : sb.awayTbPoints;
  const isWinner = sb.winner === side;
  const isLive = sb.status === 'IN_PROGRESS';

  const pointDisplay = (() => {
    if (sb.inTieBreak || sb.inSuperTieBreak) return String(tbPoints);
    if (advantage) return 'AD';
    return POINT_LABEL[points] || String(points);
  })();

  // Sport-aware serving accent (padel sky, tennis clay) — loser still desat
  const serveColor = sportAccent === 'sky' ? 'bg-sky' : 'bg-clay';
  const serveGlow = sportAccent === 'sky' ? 'rgba(107,169,255,0.6)' : 'rgba(255,92,43,0.6)';

  return (
    <div
      className={`px-5 sm:px-7 py-5 sm:py-7 flex items-center gap-4 sm:gap-6 transition-colors ${
        isWinner ? 'bg-brand/5' : ''
      }`}
    >
      {/* Server dot + name(s) */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <span
          className={`relative flex w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-opacity ${
            isServing && isLive ? 'opacity-100' : 'opacity-15'
          }`}
        >
          {isServing && isLive && (
            <span
              className={`absolute inset-0 rounded-full ${serveColor} animate-ping opacity-50`}
            />
          )}
          <span
            className={`relative w-full h-full rounded-full ${serveColor}`}
            style={isServing && isLive ? { boxShadow: `0 0 14px ${serveGlow}` } : undefined}
          />
        </span>
        <div className="min-w-0">
          {(() => {
            const [a, b] = splitDoubles(label);
            const fallback = isHome ? 'Local' : 'Visitante';
            if (b) {
              return (
                <>
                  <p
                    className={`font-display font-semibold truncate text-lg sm:text-2xl tracking-tight-2 leading-tight ${
                      isWinner ? 'text-brand' : 'text-text-primary'
                    }`}
                  >
                    {a}
                  </p>
                  <p
                    className={`font-display font-medium truncate text-base sm:text-xl tracking-tight-2 leading-tight ${
                      isWinner ? 'text-brand/80' : 'text-text-secondary'
                    }`}
                  >
                    {b}
                  </p>
                </>
              );
            }
            return (
              <p
                className={`font-display font-semibold truncate text-xl sm:text-3xl tracking-tight-2 leading-none ${
                  isWinner ? 'text-brand' : 'text-text-primary'
                }`}
              >
                {a || fallback}
              </p>
            );
          })()}
          <p className="font-mono text-2xs uppercase text-text-muted tracking-widest mt-1.5 sm:mt-2">
            {splitDoubles(label)[1] ? 'Pareja' : isHome ? 'Equipo A' : 'Equipo B'}
            {isWinner && <span className="ml-2 text-brand font-semibold">· Ganador</span>}
            {isServing && isLive && <span className="ml-2 text-text-secondary">· Sacando</span>}
          </p>
        </div>
      </div>

      {/* Set ladder — mini stadium bulbs */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {setsRow.map((i) => {
          const isCurrent = i === sb.currentSet - 1;
          const games = setGames[i] ?? 0;
          const otherGames = (isHome ? sb.awaySetGames[i] : sb.homeSetGames[i]) ?? 0;
          const isSetWinner = !isCurrent && games > otherGames;
          return (
            <div
              key={i}
              className={`score-digit w-7 sm:w-9 text-center text-2xl sm:text-4xl py-0.5 ${
                isCurrent
                  ? 'text-brand'
                  : isSetWinner
                    ? 'text-text-primary'
                    : 'text-text-muted'
              }`}
            >
              {games}
            </div>
          );
        })}
      </div>

      {/* BIG live points — the hero number */}
      <div
        className={`shrink-0 w-16 sm:w-24 text-center transition-opacity ${
          isLive ? 'opacity-100' : 'opacity-50'
        }`}
      >
        <span
          className={`score-digit inline-block ${
            advantage ? 'text-warning' : isLive ? 'text-text-primary' : 'text-text-muted'
          }`}
          style={{
            fontSize: 'clamp(56px, 11vw, 132px)',
            textShadow: isLive ? '0 4px 32px rgba(0,0,0,0.45)' : undefined,
          }}
        >
          {pointDisplay}
        </span>
      </div>
    </div>
  );
}

function CompactScoreboard({ sb, accent }: { sb: Scoreboard; accent: 'warning' | 'brand' }) {
  const accClass = accent === 'warning' ? 'text-warning' : 'text-brand';
  const setsRow = (sb.homeSetGames || []).map((_, i) => i);
  const pointStr = (side: Side) => {
    if (sb.inTieBreak || sb.inSuperTieBreak) {
      return String(side === 'HOME' ? sb.homeTbPoints : sb.awayTbPoints);
    }
    if (side === 'HOME' && sb.homeAdvantage) return 'Adv';
    if (side === 'AWAY' && sb.awayAdvantage) return 'Adv';
    return POINT_LABEL[side === 'HOME' ? sb.homePoints : sb.awayPoints];
  };

  return (
    <div className="space-y-3">
      {(['HOME', 'AWAY'] as Side[]).map((side) => {
        const isWinner = sb.winner === side;
        const games = side === 'HOME' ? sb.homeSetGames : sb.awaySetGames;
        return (
          <div key={side} className="flex items-center gap-2">
            <p className={`text-xs font-semibold flex-1 truncate ${isWinner ? accClass : 'text-text-primary'}`}>
              {side === 'HOME' ? sb.homeLabel : sb.awayLabel}
            </p>
            <div className="flex items-center gap-1">
              {setsRow.map((i) => (
                <span
                  key={i}
                  className={`w-6 text-center text-sm font-bold tabular ${
                    i === sb.currentSet - 1 ? accClass : 'text-text-secondary'
                  }`}
                >
                  {games[i] ?? 0}
                </span>
              ))}
            </div>
            <span className={`w-10 text-center text-sm font-bold tabular ${accClass}`}>
              {pointStr(side)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Big point button
   ───────────────────────────────────────────────────────────── */
function PointButton({
  label,
  side,
  accent,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  side: Side;
  accent: 'brand' | 'sky';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  void side;
  const cls = accent === 'brand'
    ? 'bg-brand text-brand-ink hover:bg-brand-dark border-brand'
    : 'bg-sky text-white hover:opacity-90 border-sky';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 h-20 sm:h-24 rounded-xl border text-base sm:text-lg font-bold tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${cls}`}
    >
      {loading
        ? <Loader2 className="w-5 h-5 animate-spin" />
        : <><Plus className="w-5 h-5" strokeWidth={3} /> {label}</>
      }
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Settings card
   ───────────────────────────────────────────────────────────── */
function SettingsCard({
  sb,
  canEdit,
  onClose,
  onUpdate,
}: {
  sb: Scoreboard;
  canEdit: boolean;
  onClose: () => void;
  onUpdate: (sb: Scoreboard) => void;
}) {
  const [form, setForm] = useState({
    scoringMode: sb.scoringMode,
    totalSets: sb.totalSets,
    superTieBreak: sb.superTieBreak,
    homeLabel: sb.homeLabel,
    awayLabel: sb.awayLabel,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.patch<Scoreboard>(`/scoreboards/${sb.id}/settings`, form);
      onUpdate(updated);
      toast.success('Configuración guardada');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card-elevated">
      <header className="flex items-center justify-between mb-5">
        <div>
          <p className="eyebrow text-text-muted">Configuración</p>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight mt-1">Ajustes del partido</h3>
        </div>
        <button onClick={onClose} className="btn-icon-sm" aria-label="Cerrar">
          <X className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Equipo / jugador local</label>
          <input
            className="input"
            value={form.homeLabel}
            onChange={(e) => setForm({ ...form, homeLabel: e.target.value })}
            disabled={!canEdit}
          />
        </div>
        <div>
          <label className="label">Equipo / jugador visitante</label>
          <input
            className="input"
            value={form.awayLabel}
            onChange={(e) => setForm({ ...form, awayLabel: e.target.value })}
            disabled={!canEdit}
          />
        </div>

        <div>
          <label className="label">Modo</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: 'STANDARD',     label: 'Deuce / ventaja' },
              { v: 'GOLDEN_POINT', label: 'Punto de oro' },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setForm({ ...form, scoringMode: opt.v as any })}
                disabled={!canEdit}
                className={`px-3 h-10 rounded-lg border text-xs font-medium transition-all ${
                  form.scoringMode === opt.v
                    ? 'bg-brand/10 border-brand/40 text-text-primary'
                    : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default'
                }`}
              >
                {opt.label}
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
                disabled={!canEdit}
                className={`h-10 rounded-lg border text-xs font-medium transition-all ${
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

        <div className="col-span-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, superTieBreak: !form.superTieBreak })}
            disabled={!canEdit}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              form.superTieBreak
                ? 'bg-clay/8 border-clay/30 text-text-primary'
                : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default'
            }`}
          >
            <div className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${form.superTieBreak ? 'bg-clay' : 'bg-border-default'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.superTieBreak ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Super tie-break en último set</p>
              <p className="text-2xs text-text-muted mt-0.5">El último set se reemplaza por un super tiebreak a 10.</p>
            </div>
          </button>
        </div>
      </div>

      <footer className="flex items-center gap-3 mt-6 pt-5 border-t border-border-dark">
        <button onClick={onClose} className="btn-ghost text-sm">Cancelar</button>
        <div className="flex-1" />
        <button onClick={save} disabled={saving || !canEdit} className="btn-primary text-sm">
          {saving
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…</>
            : <><Check className="w-3.5 h-3.5" strokeWidth={3} /> Guardar</>
          }
        </button>
      </footer>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Audit feed
   ───────────────────────────────────────────────────────────── */
function AuditFeed({ sb, onClose }: { sb: Scoreboard; onClose: () => void }) {
  const events = sb.events || [];
  const labelFor = (action: string) => {
    switch (action) {
      case 'CREATE':              return 'Anotador creado';
      case 'POINT_HOME':          return `Punto a ${sb.homeLabel}`;
      case 'POINT_AWAY':          return `Punto a ${sb.awayLabel}`;
      case 'UNDO':                return 'Deshecho';
      case 'SETTING_CHANGE':      return 'Configuración modificada';
      case 'COPY_FROM_OFFICIAL':  return 'Copiado desde oficial';
      case 'COMPLETE':            return 'Partido finalizado';
      default: return action;
    }
  };

  return (
    <section className="card-elevated">
      <header className="flex items-center justify-between mb-4">
        <div>
          <p className="eyebrow text-text-muted">Auditoría</p>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight mt-1 flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-text-muted" />
            Historial completo
            <span className="text-2xs text-text-muted tabular ml-1">{events.length}</span>
          </h3>
        </div>
        <button onClick={onClose} className="btn-icon-sm" aria-label="Cerrar"><X className="w-3.5 h-3.5" /></button>
      </header>

      {events.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-6">Sin eventos registrados todavía.</p>
      ) : (
        <ol className="space-y-1 max-h-80 overflow-y-auto">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 text-2xs py-1.5 border-b border-border-dark last:border-0">
              <span className="text-text-muted tabular shrink-0">{formatDateTime(e.createdAt)}</span>
              <span className="text-text-primary flex-1">
                {labelFor(e.action)}
              </span>
              <span className="text-text-muted shrink-0">
                por <span className="text-text-secondary">{e.author.firstName}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Notes
   ───────────────────────────────────────────────────────────── */
function NotesCard({
  sb,
  canEdit,
  onUpdate,
}: {
  sb: Scoreboard;
  canEdit: boolean;
  onUpdate: (sb: Scoreboard) => void;
}) {
  const [notes, setNotes] = useState(sb.notes || '');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.patch<Scoreboard>(`/scoreboards/${sb.id}/settings`, { notes });
      onUpdate(updated);
      toast.success('Notas guardadas');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card-elevated">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2.5 w-full text-left">
        <Activity className="w-4 h-4 text-text-secondary" />
        <p className="text-sm font-semibold text-text-primary tracking-tight flex-1">Notas privadas</p>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <textarea
            className="textarea"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones del partido, condiciones de cancha, etc."
            disabled={!canEdit}
          />
          <button onClick={save} disabled={saving || !canEdit} className="btn-secondary text-xs">
            {saving
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Guardando…</>
              : 'Guardar notas'
            }
          </button>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Court mode — fullscreen anotador for cancha-side use.
   Big tap zones (top half = HOME, bottom half = AWAY), screen
   wake lock, body scroll lock. Tap anywhere on a half = +punto.
   ───────────────────────────────────────────────────────────── */
function CourtMode({
  sb,
  canEdit,
  busy,
  onPoint,
  onUndo,
  onExit,
}: {
  sb: Scoreboard;
  canEdit: boolean;
  busy: string | null;
  onPoint: (side: Side) => void;
  onUndo: () => void;
  onExit: () => void;
}) {
  // Lock body scroll while in court mode
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Acquire wake lock so the screen doesn't sleep on the bench
    let wakeLock: any = null;
    const lock = async () => {
      try {
        // @ts-ignore — wakeLock not in older lib types
        if (navigator.wakeLock?.request) {
          // @ts-ignore
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {
        /* permission denied or not supported, no-op */
      }
    };
    lock();

    return () => {
      document.body.style.overflow = prevOverflow;
      if (wakeLock) {
        try { wakeLock.release(); } catch { /* */ }
      }
    };
  }, []);

  // Re-acquire wake lock if user switches tabs and comes back
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        // @ts-ignore
        navigator.wakeLock?.request?.('screen').catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const setsRow = (sb.homeSetGames || []).map((_, i) => i);
  const isLive = sb.status === 'IN_PROGRESS';

  const pointStr = (side: Side) => {
    if (sb.inTieBreak || sb.inSuperTieBreak) {
      return String(side === 'HOME' ? sb.homeTbPoints : sb.awayTbPoints);
    }
    if (side === 'HOME' && sb.homeAdvantage) return 'AD';
    if (side === 'AWAY' && sb.awayAdvantage) return 'AD';
    return POINT_LABEL[side === 'HOME' ? sb.homePoints : sb.awayPoints];
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-base bg-court-lines tap-none flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Top utility bar — minimal, doesn't compete with score */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 pt-safe">
        <button onClick={onExit} className="btn-icon" aria-label="Salir modo cancha">
          <Minimize className="w-4 h-4" />
        </button>
        <div className="font-mono text-2xs uppercase tracking-[0.2em] text-text-muted">
          Set {sb.currentSet}/{sb.totalSets}
          {sb.inTieBreak && <span className="ml-2 text-warning">· TB</span>}
          {sb.inSuperTieBreak && <span className="ml-2 text-warning">· STB</span>}
        </div>
        <button
          onClick={onUndo}
          disabled={!canEdit || busy === 'undo'}
          className="btn-icon disabled:opacity-30"
          aria-label="Deshacer"
        >
          {busy === 'undo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Two huge tap zones */}
      <CourtSide
        side="HOME"
        sb={sb}
        setsRow={setsRow}
        canEdit={canEdit}
        busy={busy}
        isLive={isLive}
        pointStr={pointStr('HOME')}
        onTap={() => canEdit && !busy && onPoint('HOME')}
        accent="brand"
      />
      <div className="h-px bg-border-default/40 relative">
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-2 bg-base font-mono text-2xs uppercase tracking-[0.25em] text-text-muted">
          ↑ HOME · AWAY ↓
        </span>
      </div>
      <CourtSide
        side="AWAY"
        sb={sb}
        setsRow={setsRow}
        canEdit={canEdit}
        busy={busy}
        isLive={isLive}
        pointStr={pointStr('AWAY')}
        onTap={() => canEdit && !busy && onPoint('AWAY')}
        accent="sky"
      />
    </div>
  );
}

function CourtSide({
  side,
  sb,
  setsRow,
  canEdit,
  busy,
  isLive,
  pointStr,
  onTap,
  accent,
}: {
  side: Side;
  sb: Scoreboard;
  setsRow: number[];
  canEdit: boolean;
  busy: string | null;
  isLive: boolean;
  pointStr: string;
  onTap: () => void;
  accent: 'brand' | 'sky';
}) {
  const isHome = side === 'HOME';
  const label = isHome ? sb.homeLabel : sb.awayLabel;
  const setGames = isHome ? sb.homeSetGames : sb.awaySetGames;
  const isServing = sb.servingSide === side;
  const isWinner = sb.winner === side;
  const flipped = side === 'AWAY'; // bottom half mirrors so the cancha-side player reads upright
  const accentColor = accent === 'brand' ? '#D4FF3F' : '#6BA9FF';
  const isBusy = busy === `point-${side}`;

  return (
    <button
      onClick={onTap}
      disabled={!canEdit || !!busy}
      className="relative flex-1 flex items-center justify-between px-6 sm:px-12 active:bg-white/[0.03] disabled:opacity-90 disabled:cursor-not-allowed transition-colors w-full text-left overflow-hidden"
      style={{ transform: flipped ? 'rotate(180deg)' : undefined }}
      aria-label={`Sumar punto a ${label || side}`}
    >
      {/* Subtle glow when serving */}
      {isServing && isLive && (
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(at 50% 50%, ${accentColor}1A, transparent 60%)`,
          }}
        />
      )}

      {/* Left block — name + sets */}
      <div className="relative flex flex-col gap-3 sm:gap-4 z-10">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full transition-opacity"
            style={{
              background: accentColor,
              opacity: isServing && isLive ? 1 : 0.18,
              boxShadow: isServing && isLive ? `0 0 16px ${accentColor}99` : undefined,
            }}
          />
          {(() => {
            const [a, b] = splitDoubles(label);
            const fallback = isHome ? 'Local' : 'Visitante';
            if (b) {
              return (
                <div className="min-w-0">
                  <p
                    className="font-display font-semibold tracking-tight-2 text-2xl sm:text-4xl leading-tight truncate"
                    style={{ color: isWinner ? '#D4FF3F' : '#F4F6FB' }}
                  >
                    {a}
                  </p>
                  <p
                    className="font-display font-medium tracking-tight-2 text-xl sm:text-3xl leading-tight truncate"
                    style={{ color: isWinner ? '#D4FF3F' : '#94A0B5' }}
                  >
                    {b}
                  </p>
                </div>
              );
            }
            return (
              <p
                className="font-display font-semibold tracking-tight-2 text-3xl sm:text-5xl leading-none truncate"
                style={{ color: isWinner ? '#D4FF3F' : '#F4F6FB' }}
              >
                {a || fallback}
              </p>
            );
          })()}
        </div>

        {/* Set ladder */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {setsRow.map((i) => {
            const isCurrent = i === sb.currentSet - 1;
            const games = setGames[i] ?? 0;
            const otherGames = (isHome ? sb.awaySetGames[i] : sb.homeSetGames[i]) ?? 0;
            const isSetWinner = !isCurrent && games > otherGames;
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                  S{i + 1}
                </span>
                <span
                  className="score-digit text-3xl sm:text-5xl"
                  style={{
                    color: isCurrent ? accentColor : isSetWinner ? '#F4F6FB' : '#5A6478',
                  }}
                >
                  {games}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right block — the BIG point digit */}
      <div className="relative z-10 shrink-0 ml-4">
        {isBusy ? (
          <Loader2 className="w-16 h-16 animate-spin" style={{ color: accentColor }} />
        ) : (
          <span
            className="score-digit"
            style={{
              fontSize: 'clamp(120px, 28vw, 320px)',
              color: pointStr === 'AD' ? '#FFB547' : isLive ? accentColor : '#5A6478',
              textShadow: isLive ? `0 8px 64px ${accentColor}55` : undefined,
            }}
          >
            {pointStr}
          </span>
        )}
      </div>

      {/* Tap hint at bottom — only when live */}
      {isLive && canEdit && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-2xs uppercase tracking-[0.25em] text-text-muted/60 z-10">
          Tap para sumar
        </span>
      )}

      {!isLive && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-2xs uppercase tracking-widest text-text-muted/50 z-10">
          {sb.status === 'COMPLETED' ? 'Finalizado' : 'Pausado'}
        </span>
      )}
    </button>
  );
}
