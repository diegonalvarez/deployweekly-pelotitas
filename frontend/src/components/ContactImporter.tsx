'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Loader2, UserPlus, Phone, X } from 'lucide-react';

type MatchedUser = { id: string; firstName: string; lastName: string; avatarUrl: string | null; phone: string };

declare global {
  interface Navigator {
    contacts?: {
      select: (
        props: ('name' | 'tel' | 'email')[],
        options?: { multiple?: boolean },
      ) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
      getProperties?: () => Promise<string[]>;
    };
  }
}

/**
 * Best-effort phone normaliser. Accepts inputs like:
 *   "+54 9 11 1234-5678"   →  "+5491112345678"
 *   "11 1234 5678"  (AR)   →  "+5491112345678"
 *   "(011) 1234 5678"      →  "+5491112345678"
 * If the result doesn't pass /^\+\d{6,15}$/ it's dropped.
 */
function normalisePhone(raw: string, defaultDial = '54'): string | null {
  let s = raw.replace(/[^\d+]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) {
    s = s.replace(/^0+/, '');
    s = `+${defaultDial}${s}`;
  }
  return /^\+\d{6,15}$/.test(s) ? s : null;
}

type ImportState = 'idle' | 'picking' | 'pasting' | 'loading' | 'done';

export default function ContactImporter() {
  const [state, setState] = useState<ImportState>('idle');
  const [matched, setMatched] = useState<MatchedUser[]>([]);
  const [notOn, setNotOn] = useState<string[]>([]);
  const [pasted, setPasted] = useState('');

  const supported = typeof navigator !== 'undefined' && !!navigator.contacts?.select;

  const callLookup = async (phones: string[]) => {
    const unique = Array.from(new Set(phones));
    if (unique.length === 0) {
      toast.error('No encontramos números válidos');
      setState('idle');
      return;
    }
    setState('loading');
    try {
      const res = await api.post<{ matched: MatchedUser[]; notOnPelotitas: string[] }>(
        '/users/lookup-by-phones',
        { phones: unique },
      );
      setMatched(res.matched);
      setNotOn(res.notOnPelotitas);
      setState('done');
    } catch (err: any) {
      toast.error(err.message || 'Error');
      setState('idle');
    }
  };

  const pickContacts = async () => {
    if (!supported) {
      setState('pasting');
      return;
    }
    setState('picking');
    try {
      const result = await navigator.contacts!.select(['tel'], { multiple: true });
      const phones = (result || []).flatMap((c) => (c.tel ?? []).map((t) => normalisePhone(t)).filter(Boolean) as string[]);
      await callLookup(phones);
    } catch (err: any) {
      // user cancelled or perm denied
      setState('idle');
    }
  };

  const submitPasted = async () => {
    const lines = pasted.split(/[\n,;\s]+/).filter(Boolean);
    const phones = lines.map((l) => normalisePhone(l)).filter(Boolean) as string[];
    await callLookup(phones);
  };

  const reset = () => {
    setState('idle');
    setMatched([]);
    setNotOn([]);
    setPasted('');
  };

  if (state === 'done') {
    return (
      <section className="card-elevated">
        <header className="flex items-center justify-between mb-4">
          <div>
            <p className="eyebrow text-text-muted mb-1">Tu agenda en pelotitas</p>
            <h2 className="font-display text-lg font-semibold tracking-tight-2">
              {matched.length} ya {matched.length === 1 ? 'está' : 'están'} en pelotitas
            </h2>
          </div>
          <button onClick={reset} className="btn-icon-sm" aria-label="Cerrar"><X className="w-4 h-4" /></button>
        </header>

        {matched.length > 0 ? (
          <div className="divide-y divide-border-dark">
            {matched.map((m) => (
              <Link
                key={m.id}
                href={`/players/${m.id}`}
                className="py-3 flex items-center gap-3 hover:bg-surface-light/40 rounded-lg -mx-2 px-2 transition-colors"
              >
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-border-dark" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-surface-light border border-border-dark flex items-center justify-center font-display text-xs font-bold text-text-secondary">
                    {m.firstName[0]}{m.lastName[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold truncate">{m.firstName} {m.lastName}</p>
                  <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">{m.phone}</p>
                </div>
                <span className="badge-brand">En pelotitas</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary leading-relaxed">
            No encontramos a nadie de tu agenda en pelotitas todavía. Invita a tus contactos
            compartiendo tu link de match cards.
          </p>
        )}

        {notOn.length > 0 && (
          <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-4 text-center">
            {notOn.length} número{notOn.length === 1 ? '' : 's'} sin cuenta — invítalos a registrarse
          </p>
        )}
      </section>
    );
  }

  if (state === 'pasting') {
    return (
      <section className="card-elevated">
        <header className="flex items-center justify-between mb-3">
          <div>
            <p className="eyebrow text-text-muted mb-1">Importar contactos</p>
            <h2 className="font-display text-lg font-semibold tracking-tight-2">Pegá números</h2>
          </div>
          <button onClick={reset} className="btn-icon-sm" aria-label="Cancelar"><X className="w-4 h-4" /></button>
        </header>
        <p className="text-sm text-text-secondary mb-3 leading-relaxed">
          Tu navegador no soporta lectura directa de contactos. Pegá los números (uno por línea,
          o separados por coma).
        </p>
        <textarea
          className="textarea font-mono text-sm"
          rows={6}
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="+5491134567890&#10;1234567890&#10;..."
        />
        <div className="flex items-center gap-2 mt-3">
          <button onClick={submitPasted} disabled={!pasted.trim()} className="btn-primary text-xs">
            Buscar
          </button>
          <button onClick={reset} className="btn-ghost text-xs">Cancelar</button>
        </div>
      </section>
    );
  }

  return (
    <section className="card-elevated">
      <header className="flex items-center gap-2 mb-3">
        <Phone className="w-4 h-4 text-brand" />
        <h2 className="font-display text-lg font-semibold tracking-tight-2">Tu agenda en pelotitas</h2>
      </header>
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        Importá tus contactos y descubrí quién ya está en pelotitas. Nunca guardamos los
        números — solo los matcheamos en el momento.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={pickContacts} disabled={state === 'picking'} className="btn-primary text-xs">
          {state === 'picking' || state === 'loading'
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Buscando…</>
            : <><UserPlus className="w-3.5 h-3.5" /> Importar contactos</>}
        </button>
        {!supported && (
          <button onClick={() => setState('pasting')} className="btn-secondary text-xs">
            O pegá números manualmente
          </button>
        )}
      </div>
      {!supported && (
        <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-3">
          Web Contacts Picker no disponible · usá el ingreso manual
        </p>
      )}
    </section>
  );
}
