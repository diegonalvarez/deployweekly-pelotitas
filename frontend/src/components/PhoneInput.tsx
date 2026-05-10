'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  findCountryByName,
  parseE164,
  type Country,
} from '@/lib/location';

/* ─────────────────────────────────────────────────────────────
   PhoneInput — country selector + national number, emits E.164.
   ─────────────────────────────────────────────────────────────

   Output contract:
     - When the national number field is empty → emits ''
     - Otherwise → emits '+<dial><digits>'
       (digits-only national number; spaces/dashes are stripped)

   Validation is the parent's job. Use `isValidE164` from `lib/location`
   if you need a check before submit.
*/

type Props = {
  /** Current value as E.164 string (e.g. "+5491145678901"). */
  value: string;
  /** Called whenever the composed E.164 changes. */
  onChange: (e164: string) => void;
  /** Country to default to (display name, e.g. "Argentina") if value is empty. */
  defaultCountryName?: string;
  /** Optional input id (for label htmlFor). */
  id?: string;
  /** Placeholder for the national number side. */
  placeholder?: string;
  /** Disable both sides. */
  disabled?: boolean;
  /** Required attribute on the number input. */
  required?: boolean;
  /** Autocomplete hint for the number input. */
  autoComplete?: string;
};

export default function PhoneInput({
  value,
  onChange,
  defaultCountryName,
  id,
  placeholder = '11 1234 5678',
  disabled,
  required,
  autoComplete = 'tel',
}: Props) {
  /* ── Initial country: parse from `value` if it's E.164,
        else use defaultCountryName, else fall back to AR. ── */
  const initial = useMemo(() => {
    const parsed = parseE164(value);
    if (parsed) return { country: parsed.country, nsn: parsed.nsn };
    const fromName = findCountryByName(defaultCountryName);
    return { country: fromName || DEFAULT_COUNTRY, nsn: '' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentional: only on mount

  const [country, setCountry] = useState<Country>(initial.country);
  const [nsn, setNsn] = useState<string>(initial.nsn);

  /* ── If the parent changes `defaultCountryName` AND the user
        hasn't typed anything yet, follow the new default.       ── */
  useEffect(() => {
    if (nsn) return;
    const fromName = findCountryByName(defaultCountryName);
    if (fromName && fromName.code !== country.code) setCountry(fromName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCountryName]);

  /* ── Push composed E.164 up whenever country or nsn changes. ── */
  useEffect(() => {
    const digits = nsn.replace(/\D/g, '');
    if (!digits) {
      if (value !== '') onChange('');
      return;
    }
    const next = `${country.dial}${digits}`;
    if (next !== value) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, nsn]);

  /* ── Sync from external value when parent loads async data
        (e.g. /clubs/:id returns existing phone after mount).        ── */
  useEffect(() => {
    const composed = `${country.dial}${nsn.replace(/\D/g, '')}`;
    if (value && value !== composed) {
      const parsed = parseE164(value);
      if (parsed) {
        if (parsed.country.code !== country.code) setCountry(parsed.country);
        if (parsed.nsn !== nsn.replace(/\D/g, '')) setNsn(parsed.nsn);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* ── Country picker popover state. ── */
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const popRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 30);
  }, [open]);

  const filtered = query.trim()
    ? COUNTRIES.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.dial.includes(q.replace(/^\+/, ''))
        );
      })
    : COUNTRIES;

  /* ── National-number length hint. ── */
  const digitsTyped = nsn.replace(/\D/g, '').length;
  const min = country.nsnLen?.[0];
  const max = country.nsnLen?.[1];
  const tooShort = digitsTyped > 0 && min !== undefined && digitsTyped < min;
  const tooLong  = max !== undefined && digitsTyped > max;

  /* ── Render. ── */
  return (
    <div className="relative" ref={popRef}>
      <div
        className={`flex items-stretch w-full bg-surface-light text-text-primary rounded-lg border border-border-dark transition-all overflow-hidden focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/15 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        } ${tooLong ? 'border-negative/60' : ''}`}
      >
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 border-r border-border-dark hover:bg-surface-hover transition-colors shrink-0"
          aria-label="Cambiar país"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-xs font-medium tabular text-text-secondary">{country.dial}</span>
          <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Number input */}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted px-3 py-2.5 outline-none"
          value={nsn}
          onChange={(e) => setNsn(e.target.value.replace(/[^\d\s\-()]/g, '').slice(0, 18))}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
        />
      </div>

      {/* Helper text — only shown when relevant */}
      {(tooShort || tooLong) && (
        <p className={`mt-1 text-2xs ${tooLong ? 'text-negative' : 'text-text-muted'}`}>
          {tooLong
            ? `Demasiado largo para ${country.name} (máx. ${max} dígitos).`
            : `Faltan dígitos para ${country.name} (mín. ${min}).`}
        </p>
      )}

      {/* Country picker popover */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] z-50 rounded-xl border border-border-dark bg-surface-card overflow-hidden"
          style={{ boxShadow: '0 16px 40px -10px rgba(0,0,0,0.7)' }}
        >
          {/* Search */}
          <div className="px-3 py-2.5 border-b border-border-dark">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar país…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-2.5 bg-base text-sm rounded-md border border-border-dark focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15 placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-2xs text-text-muted">
                Sin resultados
              </p>
            ) : (
              filtered.map((c) => {
                const isActive = c.code === country.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountry(c);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      isActive ? 'bg-surface-light text-text-primary' : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                    }`}
                  >
                    <span className="text-base leading-none shrink-0 w-5 text-center">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-text-muted tabular shrink-0">{c.dial}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-brand shrink-0" strokeWidth={3} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
