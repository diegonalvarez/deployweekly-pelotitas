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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* V5 Hero */}
      <section className="v5-hero-card relative">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 p-6 sm:p-8 lg:p-10 items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-5"
                  style={{ background: '#5C3320', color: 'var(--v5-cream)', fontFamily: 'var(--font-mono), monospace' }}>
              <span className="block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--v5-orange)' }} />
              RANKING ELO · {sport === 'PADEL' ? 'PADEL' : 'TENIS'}
            </span>
            <h1 className="font-bold uppercase tracking-[-0.035em] leading-[0.88]"
                style={{
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 'clamp(40px, 6vw, 80px)',
                  color: 'var(--v5-cream)',
                }}>
              RANKING<br />
              <span style={{ color: 'var(--v5-yellow)' }}>GLOBAL</span>.
            </h1>
            <p className="mt-5 text-[14px] max-w-md leading-relaxed" style={{ color: 'rgba(242,237,222,0.72)' }}>
              Calculado automáticamente desde tus partidos. Empezás en 1000 y se ajusta con cada game.
              K-factor 32 hasta los 30 partidos, después 16.
            </p>
          </div>
          {user && myRow && data && (
            <div className="rounded-2xl p-5"
                 style={{ background: 'rgba(244,239,230,0.08)', border: '1px solid rgba(244,239,230,0.15)' }}>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold mb-1"
                 style={{ color: 'rgba(242,237,222,0.6)', fontFamily: 'var(--font-mono), monospace' }}>
                TU POSICIÓN
              </p>
              <p className="font-bold tabular leading-none tracking-[-0.04em] mt-1"
                 style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 56, color: 'var(--v5-yellow)' }}>
                #{data.findIndex((e) => e.userId === user.id) + 1}
              </p>
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4" style={{ borderTop: '1px solid rgba(244,239,230,0.15)' }}>
                <Stat label="ELO" value={String(myRow.rating)} accent />
                <Stat label="Pico" value={String(myRow.peakRating)} />
                <Stat label="P-G-E" value={`${myRow.wins}-${myRow.losses}-${myRow.draws}`} />
              </div>
            </div>
          )}
        </div>
      </section>

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
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(242,237,222,0.6)' }}>{label}</p>
      <p className="font-mono tabular leading-none mt-1 font-bold tracking-[-0.03em]"
         style={{ fontSize: 22, color: accent ? 'var(--v5-yellow)' : 'var(--v5-cream)' }}>
        {value}
      </p>
    </div>
  );
}
