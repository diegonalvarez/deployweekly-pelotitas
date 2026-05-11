'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Swords } from 'lucide-react';

type Rivalry = {
  opponent: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  total: number;
  won: number;
  lost: number;
  draw: number;
  lastMeet: string;
  sports: ('PADEL' | 'TENNIS')[];
  winRate: number;
};

export default function RivalriesWidget({ limit = 5 }: { limit?: number }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Rivalry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    api
      .get<Rivalry[]>('/match-log/rivalries')
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;
  if (items === null) {
    return (
      <section className="card-elevated">
        <header className="flex items-center gap-2 mb-4">
          <Swords className="w-4 h-4 text-brand" />
          <h2 className="font-display text-lg font-semibold tracking-tight-2">Rivalidades</h2>
        </header>
        <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">Cargando…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="card-elevated">
        <header className="flex items-center gap-2 mb-3">
          <Swords className="w-4 h-4 text-text-muted" />
          <h2 className="font-display text-lg font-semibold tracking-tight-2">Rivalidades</h2>
        </header>
        <p className="text-sm text-text-secondary leading-relaxed">
          Una rivalidad nace cuando jugaste <span className="font-mono text-text-primary">3+</span> partidos
          contra el mismo oponente. Seguí anotando partidos y se van armando solas.
        </p>
      </section>
    );
  }

  const visible = items.slice(0, limit);

  return (
    <section className="card-elevated">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-brand" />
          <h2 className="font-display text-lg font-semibold tracking-tight-2">Rivalidades</h2>
          <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
            {items.length} {items.length === 1 ? 'rival' : 'rivales'}
          </span>
        </div>
      </header>
      <div className="divide-y divide-border-dark">
        {visible.map((r) => {
          const leading = r.won > r.lost;
          const trailing = r.lost > r.won;
          return (
            <Link
              key={r.opponent.id}
              href={`/h2h/${user.id}/vs/${r.opponent.id}`}
              className="py-3 flex items-center gap-3 group transition-colors hover:bg-surface-light/30 -mx-2 px-2 rounded-lg"
            >
              {r.opponent.avatarUrl ? (
                <img
                  src={r.opponent.avatarUrl}
                  alt={`${r.opponent.firstName} ${r.opponent.lastName}`}
                  className="w-9 h-9 rounded-full object-cover border border-border-dark shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-surface-light border border-border-dark flex items-center justify-center font-display text-xs font-bold text-text-secondary shrink-0">
                  {r.opponent.firstName[0]}{r.opponent.lastName[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold truncate text-text-primary group-hover:text-brand transition-colors">
                  {r.opponent.firstName} {r.opponent.lastName}
                </p>
                <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                  {r.total} {r.total === 1 ? 'partido' : 'partidos'} · {r.sports.join(' / ').toLowerCase()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`score-digit text-2xl ${
                    leading ? 'text-brand' : trailing ? 'text-negative' : 'text-text-primary'
                  }`}
                >
                  {r.won}<span className="text-text-muted">-</span>{r.lost}
                  {r.draw > 0 && <span className="text-text-muted text-base"> · {r.draw}d</span>}
                </p>
                <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                  {leading ? `Lidera vos` : trailing ? `Lidera ${r.opponent.firstName}` : 'Empatados'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {items.length > limit && (
        <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-3 text-center">
          + {items.length - limit} más
        </p>
      )}
    </section>
  );
}
