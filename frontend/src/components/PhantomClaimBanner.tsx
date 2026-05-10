'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { UserPlus, Check, Loader2, X, ExternalLink } from 'lucide-react';

type PhantomMention = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  side: 'PARTNER' | 'OPPONENT';
  entry: {
    id: string;
    ownerId: string;
    date: string;
    sport: 'PADEL' | 'TENNIS';
    owner: { firstName: string; lastName: string };
  };
};

/* ─────────────────────────────────────────────────────────────
   PhantomClaimBanner — when other users have logged matches
   against "First Last" and the current user matches that name,
   they can claim those mentions to attach them to their account.
   ───────────────────────────────────────────────────────────── */
export default function PhantomClaimBanner() {
  const { user } = useAuth();
  const [mentions, setMentions] = useState<PhantomMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get<PhantomMention[]>('/match-log/phantom-mentions')
      .then((res) => {
        setMentions(res || []);
        // Pre-select all by default — most users will want to claim them all.
        setSelected(new Set((res || []).map((m) => m.id)));
      })
      .catch(() => setMentions([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !user || dismissed || mentions.length === 0) return null;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const claim = async () => {
    if (selected.size === 0) {
      toast.error('Seleccioná al menos una');
      return;
    }
    setClaiming(true);
    try {
      const ids = Array.from(selected);
      await api.post('/match-log/phantom-mentions/claim', { participantIds: ids });
      toast.success(`Reclamaste ${ids.length} mención${ids.length === 1 ? '' : 'es'}`);
      // Refresh the list (claimed ones disappear)
      const res = await api.get<PhantomMention[]>('/match-log/phantom-mentions');
      setMentions(res || []);
      setSelected(new Set((res || []).map((m) => m.id)));
    } catch (err: any) {
      toast.error(err.message || 'Error al reclamar');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <section className="card-elevated border-brand/20 bg-gradient-to-br from-brand/5 via-surface to-transparent relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-md bg-brand/15 text-brand border border-brand/25 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="eyebrow text-text-muted">Menciones</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                Otros jugadores te anotaron en su historial
              </p>
              <p className="text-2xs text-text-secondary leading-relaxed mt-1 max-w-md">
                Encontramos <span className="text-text-primary font-semibold tabular">{mentions.length}</span>{' '}
                {mentions.length === 1 ? 'mención registrada' : 'menciones registradas'} de{' '}
                <span className="text-text-primary font-semibold">{user.firstName} {user.lastName}</span>{' '}
                en partidos privados de otros usuarios. Reclamalas para vincularlas a tu cuenta.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="btn-icon-sm shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toggle list */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-2xs uppercase font-semibold text-brand hover:text-brand-dark transition-colors mt-2 inline-flex items-center gap-1"
          style={{ letterSpacing: '0.1em' }}
        >
          {expanded ? 'Ocultar detalle' : `Ver ${mentions.length} mención${mentions.length === 1 ? '' : 'es'}`}
        </button>

        {expanded && (
          <div className="mt-4 space-y-2 animate-fade-in">
            {mentions.map((m) => {
              const isChecked = selected.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    isChecked
                      ? 'bg-brand/10 border-brand/30'
                      : 'bg-surface-light border-border-dark hover:border-border-default'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    isChecked
                      ? 'bg-brand text-brand-ink'
                      : 'bg-surface border border-border-default'
                  }`}>
                    {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">
                      <span className="text-text-secondary">Anotado por</span>{' '}
                      <span className="font-medium">{m.entry.owner.firstName} {m.entry.owner.lastName}</span>
                      <span className="text-text-muted ml-2 text-2xs">
                        como {m.side === 'OPPONENT' ? 'rival' : 'compañero'}
                      </span>
                    </p>
                    <p className="text-2xs text-text-muted mt-0.5 tabular">
                      {m.entry.sport === 'PADEL' ? 'Padel' : 'Tenis'} · {formatDate(m.entry.date)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-dark">
          <button
            onClick={claim}
            disabled={claiming || selected.size === 0}
            className="btn-primary text-sm h-9"
          >
            {claiming
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reclamando…</>
              : <><Check className="w-3.5 h-3.5" strokeWidth={3} /> Reclamar {selected.size > 0 ? selected.size : ''}</>
            }
          </button>
          <Link href="/matches/log" className="btn-ghost text-xs">
            Mi historial
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
