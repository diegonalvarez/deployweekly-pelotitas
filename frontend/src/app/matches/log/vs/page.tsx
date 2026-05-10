'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { useAuth } from '@/lib/auth';
import {
  ArrowLeft,
  Trophy,
  Loader2,
  Swords,
  StickyNote,
  TrendingUp,
  Target,
  Activity,
  Lock,
  ExternalLink,
} from 'lucide-react';

type ParticipantOut = {
  id: string;
  side: 'PARTNER' | 'OPPONENT';
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  user?: { id: string; firstName: string; lastName: string };
};

type LogEntry = {
  id: string;
  sport: 'PADEL' | 'TENNIS';
  date: string;
  startTime: string | null;
  city: string | null;
  venue: string | null;
  myScore: string | null;
  opponentScore: string | null;
  result: 'WON' | 'LOST' | 'DRAW' | null;
  notes: string | null;
  participants: ParticipantOut[];
  tournamentMatch: { tournament: { id: string; name: string } } | null;
};

type HistoryResponse = {
  entries: LogEntry[];
  stats: {
    total: number;
    won: number;
    lost: number;
    draw: number;
    winRate: number;
  };
};

export default function HeadToHeadPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div>}>
      <HeadToHeadInner />
    </Suspense>
  );
}

function HeadToHeadInner() {
  const { user } = useAuth();
  const params = useSearchParams();
  const opponentUserId = params.get('userId') || undefined;
  const firstName = params.get('firstName') || undefined;
  const lastName = params.get('lastName') || undefined;

  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [opponentLabel, setOpponentLabel] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    const qs = new URLSearchParams();
    if (opponentUserId) qs.set('opponentUserId', opponentUserId);
    if (firstName) qs.set('firstName', firstName);
    if (lastName)  qs.set('lastName',  lastName);
    api.get<HistoryResponse>(`/match-log/opponent?${qs}`)
      .then((res) => {
        setData(res);
        // Best-effort label from the first entry's matching opponent
        const first = res.entries?.[0];
        if (first) {
          const opp = first.participants.find((p) =>
            p.side === 'OPPONENT' &&
            (opponentUserId ? p.userId === opponentUserId :
              (p.firstName || '').toLowerCase() === (firstName || '').toLowerCase() &&
              (p.lastName  || '').toLowerCase() === (lastName  || '').toLowerCase())
          );
          if (opp) {
            setOpponentLabel(opp.user
              ? `${opp.user.firstName} ${opp.user.lastName}`
              : `${opp.firstName || ''} ${opp.lastName || ''}`.trim());
          }
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, opponentUserId, firstName, lastName]);

  // Fallback label
  const fallbackLabel = opponentUserId
    ? 'Rival'
    : [firstName, lastName].filter(Boolean).join(' ') || 'Rival';
  const label = opponentLabel || fallbackLabel;
  const isPhantom = !opponentUserId;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-sm text-text-muted mb-3">Iniciá sesión para ver el head-to-head.</p>
          <Link href="/login" className="btn-primary">Ingresar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base">
      {/* Header */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <Link
            href="/matches/log"
            className="inline-flex items-center gap-1 text-2xs text-text-muted hover:text-text-primary mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Mi historial
          </Link>
          <p className="eyebrow text-text-muted">Head to head</p>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1 flex items-center gap-2">
            vs <span className="text-brand">{label}</span>
            {isPhantom && (
              <span className="badge-neutral text-2xs ml-1">sin cuenta</span>
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {loading ? (
          <div className="grid sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="kpi-tile animate-pulse">
                <div className="h-3 w-20 bg-surface-light rounded mb-3" />
                <div className="h-7 w-12 bg-surface-light rounded" />
              </div>
            ))}
          </div>
        ) : !data || data.entries.length === 0 ? (
          <div className="card-elevated text-center py-16">
            <div className="w-12 h-12 rounded-lg bg-surface-light text-text-muted mx-auto mb-4 flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Sin enfrentamientos registrados</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              Aún no anotaste ningún partido contra <span className="text-text-primary font-medium">{label}</span>.
            </p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KPI label="Partidos" value={data.stats.total} icon={<Activity className="w-3.5 h-3.5" />} />
              <KPI label="Ganados" value={data.stats.won} icon={<TrendingUp className="w-3.5 h-3.5 text-brand" />} />
              <KPI label="Perdidos" value={data.stats.lost} icon={<TrendingUp className="w-3.5 h-3.5 text-negative rotate-180" />} />
              <KPI label="Win rate" value={`${data.stats.winRate}%`} icon={<Target className="w-3.5 h-3.5" />} />
            </div>

            {/* Entries list */}
            <section>
              <header className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary tracking-tight">Partidos</h2>
                <span className="text-2xs text-text-muted tabular">{data.entries.length}</span>
              </header>
              <div className="space-y-3">
                {data.entries.map((e) => <EntryRow key={e.id} entry={e} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="kpi-tile">
      <div className="flex items-center justify-between">
        <p className="kpi-label">{label}</p>
        <span className="text-text-muted">{icon}</span>
      </div>
      <p className="kpi-value">{value}</p>
    </div>
  );
}

function EntryRow({ entry }: { entry: LogEntry }) {
  return (
    <Link
      href={`/matches/log#${entry.id}`}
      className="card-interactive block"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={entry.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
              {entry.sport === 'PADEL' ? 'Padel' : 'Tenis'}
            </span>
            {entry.result === 'WON'  && <span className="badge-brand">Ganado</span>}
            {entry.result === 'LOST' && <span className="badge-red">Perdido</span>}
            {entry.result === 'DRAW' && <span className="badge-yellow">Empate</span>}
            {entry.tournamentMatch && (
              <span className="badge-neutral">
                <Lock className="w-3 h-3" /> Torneo
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary tabular">
            {formatDate(entry.date)}
            {entry.startTime && <span className="text-text-muted"> · {entry.startTime}</span>}
            {entry.venue && <span className="text-text-muted"> · {entry.venue}</span>}
          </p>
          {(entry.myScore || entry.opponentScore) && (
            <p className="text-sm font-mono text-text-primary tabular mt-1.5">
              {entry.myScore || '—'} <span className="text-text-muted">vs</span> {entry.opponentScore || '—'}
            </p>
          )}
          {entry.notes && (
            <p className="text-2xs text-text-muted mt-2 line-clamp-2 italic">
              <StickyNote className="w-3 h-3 inline -mt-0.5 mr-1" />
              {entry.notes}
            </p>
          )}
          {entry.tournamentMatch && (
            <Link
              href={`/tournaments/${entry.tournamentMatch.tournament.id}`}
              className="text-2xs text-text-muted hover:text-text-primary mt-2 inline-flex items-center gap-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Trophy className="w-3 h-3" /> {entry.tournamentMatch.tournament.name}
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
}
