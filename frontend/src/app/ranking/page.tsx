'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

type Sport = 'PADEL' | 'TENNIS';

type EloEntry = {
  id: string;
  userId: string;
  sport: Sport;
  rating: number;
  peakRating: number;
  matchesCount: number;
  wins: number;
  losses: number;
  draws: number;
  lastMatchAt: string | null;
  user: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
};

type RankingResp = EloEntry[] | { PADEL: EloEntry[]; TENNIS: EloEntry[] };

export default function RankingPage() {
  const { user } = useAuth();
  const [sport, setSport] = useState<Sport>('PADEL');
  const [data, setData] = useState<EloEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<RankingResp>(`/public/ranking?sport=${sport}&limit=100`)
      .then((res) => {
        const arr = Array.isArray(res) ? res : (res as any)[sport] || [];
        setData(arr);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [sport]);

  const myRow = useMemo(
    () => data?.find((e) => e.userId === user?.id) ?? null,
    [data, user],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="eyebrow text-text-muted mb-2">Ranking ELO</p>
        <h1 className="section-header mb-3">Ranking global</h1>
        <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
          Calculado automáticamente desde los partidos cargados en <span className="text-text-primary">Mi historial</span>.
          Empezás en <span className="font-mono text-text-primary">1000</span> y se ajusta con cada partido.
          K-factor <span className="font-mono">32</span> hasta los 30 partidos, después <span className="font-mono">16</span>.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {(['PADEL', 'TENNIS'] as Sport[]).map((s) => {
          const active = sport === s;
          return (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                active
                  ? s === 'PADEL'
                    ? 'bg-sky/15 border-sky/40 text-sky'
                    : 'bg-clay/15 border-clay/40 text-clay'
                  : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default hover:text-text-primary'
              }`}
            >
              {s === 'PADEL' ? 'Padel' : 'Tenis'}
            </button>
          );
        })}
      </div>

      {user && myRow && data && (
        <div className="card-elevated mb-6 bg-brand/5 border-brand/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="score-digit text-4xl text-brand">
                #{data.findIndex((e) => e.userId === user.id) + 1}
              </span>
              <div>
                <p className="font-display font-semibold text-lg tracking-tight-2">Tu posición</p>
                <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                  {myRow.user.firstName} {myRow.user.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Stat label="ELO" value={String(myRow.rating)} accent />
              <Stat label="Pico" value={String(myRow.peakRating)} />
              <Stat label="P-G-E" value={`${myRow.wins}-${myRow.losses}-${myRow.draws}`} />
            </div>
          </div>
        </div>
      )}

      <section className="card-elevated p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mb-3">
              Sin datos todavía
            </p>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              El ranking se construye automáticamente a medida que se cargan partidos en
              <span className="text-text-primary"> Mi historial</span>. Empezá registrando un partido
              con un rival que tenga cuenta para sumar al ranking.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            <div className="px-5 py-3 flex items-center gap-3 bg-base/50">
              <span className="w-10 font-mono text-2xs uppercase tracking-widest text-text-muted">#</span>
              <span className="flex-1 font-mono text-2xs uppercase tracking-widest text-text-muted">Jugador</span>
              <span className="w-20 text-right font-mono text-2xs uppercase tracking-widest text-text-muted">ELO</span>
              <span className="w-24 text-right font-mono text-2xs uppercase tracking-widest text-text-muted hidden sm:inline">Pico</span>
              <span className="w-32 text-right font-mono text-2xs uppercase tracking-widest text-text-muted hidden sm:inline">P-G-E</span>
            </div>
            {data.map((e, i) => {
              const isMe = e.userId === user?.id;
              const isPodium = i < 3;
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
              return (
                <Link
                  key={e.id}
                  href={user ? `/h2h/${user.id}/vs/${e.userId}` : `/players/${e.userId}`}
                  className={`px-5 py-3 flex items-center gap-3 hover:bg-surface-light/40 transition-colors ${
                    isMe ? 'bg-brand/5' : ''
                  }`}
                >
                  <span className="w-10 flex items-center gap-1">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className={`score-digit text-base ${isPodium ? 'text-brand' : 'text-text-muted'}`}>
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    {e.user.avatarUrl ? (
                      <img
                        src={e.user.avatarUrl}
                        alt={`${e.user.firstName} ${e.user.lastName}`}
                        className="w-8 h-8 rounded-full object-cover border border-border-dark"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-light border border-border-dark flex items-center justify-center font-display text-2xs font-bold text-text-secondary">
                        {e.user.firstName[0]}{e.user.lastName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={`font-display font-semibold truncate ${isMe ? 'text-brand' : 'text-text-primary'}`}>
                        {e.user.firstName} {e.user.lastName}
                      </p>
                      <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                        {e.matchesCount < 30 ? 'Provisional' : 'Establecido'}
                      </p>
                    </div>
                  </div>
                  <span className={`w-20 text-right score-digit text-xl ${isPodium ? 'text-brand' : 'text-text-primary'}`}>
                    {e.rating}
                  </span>
                  <span className="w-24 text-right score-digit text-base text-text-muted hidden sm:inline">
                    {e.peakRating}
                  </span>
                  <span className="w-32 text-right font-mono text-sm tabular text-text-secondary hidden sm:inline">
                    {e.wins}-{e.losses}{e.draws > 0 ? `-${e.draws}` : ''}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`score-digit text-2xl ${accent ? 'text-brand' : 'text-text-primary'}`}>{value}</p>
    </div>
  );
}
