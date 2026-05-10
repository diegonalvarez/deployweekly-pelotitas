'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Globe2, X, Check } from 'lucide-react';
import { useLocation, COUNTRIES, STATES_BY_COUNTRY } from '@/lib/location';

/* ─────────────────────────────────────────────────────────────
   LocationPill — topbar control showing geo status, click to open
   manage popover (request browser geo or set manually).
   ───────────────────────────────────────────────────────────── */
export default function LocationPill() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'auto' | 'manual'>('auto');
  const [manual, setManual] = useState({ country: '', state: '', city: '' });
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Hydrate manual form when opening if mode is manual
  useEffect(() => {
    if (open && loc.mode === 'manual') {
      setManual({ country: loc.country || '', state: loc.state || '', city: loc.city || '' });
      setTab('manual');
    }
  }, [open, loc.mode, loc.country, loc.state, loc.city]);

  /* ─── Pill display ─────────────────────────────── */
  const isActive = loc.mode === 'auto' || loc.mode === 'manual';
  const dotColor =
    loc.mode === 'auto'   ? 'bg-brand'    :
    loc.mode === 'manual' ? 'bg-sky'      :
    loc.mode === 'denied' ? 'bg-negative' :
    'bg-text-muted';

  const labelText = (() => {
    if (loc.mode === 'asking') return 'Detectando…';
    if (loc.mode === 'denied') return 'Permiso denegado';
    if (loc.mode === 'unsupported') return 'No disponible';
    if (loc.label) return loc.label;
    return 'Sin ubicación';
  })();

  const states = manual.country ? STATES_BY_COUNTRY[manual.country] : null;

  /* ─── Actions ─────────────────────────────── */
  const handleAuto = async () => {
    await loc.requestAuto();
    setOpen(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loc.setManual({
      country: manual.country || undefined,
      state: manual.state || undefined,
      city: manual.city.trim() || undefined,
    });
    setOpen(false);
  };

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`group flex items-center gap-2 h-9 px-2.5 rounded-lg border transition-all max-w-[180px] sm:max-w-[220px] ${
          isActive
            ? 'bg-surface-light border-border-default text-text-primary'
            : 'bg-transparent border-border-dark text-text-secondary hover:bg-surface-light hover:text-text-primary'
        }`}
        aria-label="Cambiar ubicación"
      >
        <span className={`relative flex w-1.5 h-1.5 shrink-0 ${isActive ? '' : 'opacity-60'}`}>
          {loc.mode === 'asking' && (
            <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60" />
          )}
          <span className={`relative w-1.5 h-1.5 rounded-full ${dotColor}`} />
        </span>
        <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span className="text-xs font-medium truncate">{labelText}</span>
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 z-50 rounded-xl border border-border-dark bg-surface-card overflow-hidden"
          style={{ boxShadow: '0 16px 40px -10px rgba(0,0,0,0.7)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
            <div>
              <p className="eyebrow text-text-muted">Ubicación</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                {isActive ? labelText : 'Sin ubicación activa'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="btn-icon-sm"
              aria-label="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-2 pt-2 flex items-center gap-1 border-b border-border-dark">
            <button
              onClick={() => setTab('auto')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                tab === 'auto' ? 'bg-surface-light text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 inline -mt-0.5 mr-1.5" />
              Mi ubicación
            </button>
            <button
              onClick={() => setTab('manual')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                tab === 'manual' ? 'bg-surface-light text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 inline -mt-0.5 mr-1.5" />
              Elegir lugar
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            {tab === 'auto' && (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Activá la ubicación del dispositivo para mostrarte clubes y torneos cerca tuyo primero.
                </p>
                {loc.mode === 'denied' && (
                  <div className="bg-negative/10 border border-negative/20 rounded-md px-3 py-2 text-2xs text-negative">
                    Bloqueaste el permiso. Cambialo desde la configuración del navegador y volvé a intentar.
                  </div>
                )}
                {loc.mode === 'unsupported' && (
                  <div className="bg-warning/10 border border-warning/20 rounded-md px-3 py-2 text-2xs text-warning">
                    Tu navegador no soporta geolocalización.
                  </div>
                )}
                <button
                  onClick={handleAuto}
                  disabled={loc.mode === 'asking' || loc.mode === 'unsupported'}
                  className="btn-primary w-full justify-center text-sm h-10"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {loc.mode === 'auto' ? 'Refrescar ubicación' : 'Usar mi ubicación'}
                </button>
                {isActive && (
                  <button
                    onClick={() => { loc.clear(); setOpen(false); }}
                    className="btn-ghost w-full justify-center text-xs"
                  >
                    Quitar ubicación
                  </button>
                )}
              </div>
            )}

            {tab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Estás de viaje o querés explorar otro lugar. Elegí país y ciudad.
                </p>

                <div>
                  <label className="label">País</label>
                  <select
                    className="input"
                    value={manual.country}
                    onChange={(e) => setManual({ country: e.target.value, state: '', city: '' })}
                    required
                  >
                    <option value="">Seleccionar…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {states && states.length > 0 && (
                  <div>
                    <label className="label">Provincia / Estado</label>
                    <select
                      className="input"
                      value={manual.state}
                      onChange={(e) => setManual({ ...manual, state: e.target.value })}
                    >
                      <option value="">Cualquiera</option>
                      {states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="label">Ciudad</label>
                  <input
                    type="text"
                    className="input"
                    value={manual.city}
                    onChange={(e) => setManual({ ...manual, city: e.target.value })}
                    placeholder="Ej. Capital Federal"
                  />
                </div>

                <button type="submit" className="btn-primary w-full justify-center text-sm h-10">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  Aplicar
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
