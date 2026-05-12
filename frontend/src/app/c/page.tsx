'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocation, COUNTRIES, STATES_BY_COUNTRY } from '@/lib/location';
import { PublicTopBar, FooterSignupCTA } from '@/components/public/PublicAuthAware';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type Sport = 'PADEL' | 'TENNIS';

type Club = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  sports?: Sport[];
  locations?: { city?: string; state?: string; country?: string; address?: string; isMain?: boolean }[];
  _count?: { tournaments?: number; courts?: number };
  distanceKm?: number | null;
};

type ListResponse = {
  clubs: Club[];
  total: number;
  page: number;
  totalPages: number;
  sort?: 'recent' | 'nearest';
};

export default function PublicClubsDiscover() {
  const loc = useLocation();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortMode, setSortMode] = useState<'recent' | 'nearest'>('recent');

  const [filterCountry, setFilterCountry] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSport, setFilterSport] = useState<'' | Sport>('');
  const [useNearMe, setUseNearMe] = useState(false);

  const [bootstrapped, setBootstrapped] = useState(false);
  useEffect(() => {
    if (bootstrapped) return;
    if (loc.mode === 'auto' && loc.coords) {
      setUseNearMe(true);
      if (loc.country) setFilterCountry(loc.country);
    } else if (loc.mode === 'manual') {
      if (loc.country) setFilterCountry(loc.country);
      if (loc.state) setFilterState(loc.state);
      if (loc.city) setFilterCity(loc.city);
    }
    setBootstrapped(true);
  }, [loc, bootstrapped]);

  const states = filterCountry ? STATES_BY_COUNTRY[filterCountry] || null : null;

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterCountry) params.set('country', filterCountry);
        if (filterState) params.set('state', filterState);
        if (filterCity) params.set('city', filterCity);
        if (filterSport) params.set('sport', filterSport);
        if (useNearMe && loc.coords) {
          params.set('lat', String(loc.coords.lat));
          params.set('lng', String(loc.coords.lng));
          params.set('sort', 'nearest');
        }
        const res = await fetch(`${API}/api/public/clubs?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ListResponse = await res.json();
        setClubs(data.clubs || []);
        setTotal(data.total || 0);
        setSortMode(data.sort || 'recent');
      } catch {
        setClubs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, filterCity ? 250 : 0);
    return () => clearTimeout(handle);
  }, [filterCountry, filterState, filterCity, filterSport, useNearMe, loc.coords?.lat, loc.coords?.lng]);

  const hasFilters = !!(filterCountry || filterState || filterCity || filterSport || useNearMe);
  const clearFilters = () => {
    setFilterCountry('');
    setFilterState('');
    setFilterCity('');
    setFilterSport('');
    setUseNearMe(false);
  };
  const requestNearMe = async () => {
    if (loc.mode !== 'auto') await loc.requestAuto();
    setUseNearMe(true);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--v5-paper)', color: 'var(--v5-ink)' }}>
      {/* Top bar */}
      <header
        className="px-5 sm:px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--v5-paper-2)' }}
      >
        <Link
          href="/"
          className="text-[20px] font-bold tracking-[-0.025em]"
          style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}
        >
          PELOTITAS<span style={{ color: 'var(--v5-orange)' }}>.</span>
        </Link>
        <PublicTopBar />
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Hero */}
        <section className="v5-hero-card relative mb-8">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10 p-6 sm:p-8 lg:p-10 items-end">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}
              >
                Complejos · descubrir
              </p>
              <h1
                className="font-bold uppercase tracking-[-0.035em] leading-[0.88]"
                style={{
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 'clamp(40px, 6vw, 80px)',
                  color: 'var(--v5-cream)',
                }}
              >
                ELEGÍ
                <br />
                <span style={{ color: 'var(--v5-yellow)' }}>DÓNDE</span> JUGAR.
              </h1>
              <p className="mt-5 text-[14px] max-w-md leading-relaxed" style={{ color: 'rgba(242,237,222,0.72)' }}>
                Canchas de padel y tenis en tu zona. Filtrá por país, ciudad, deporte o cercanía.
              </p>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(244,239,230,0.08)', border: '1px solid rgba(244,239,230,0.15)' }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.22em] font-bold mb-1"
                style={{ color: 'rgba(242,237,222,0.6)', fontFamily: 'var(--font-mono), monospace' }}
              >
                {loading ? 'Buscando' : 'Resultados'}
              </p>
              <p
                className="font-bold tabular leading-none mt-1 tracking-[-0.04em]"
                style={{ fontSize: 56, color: 'var(--v5-yellow)', fontFamily: 'var(--font-mono), monospace' }}
              >
                {loading ? '—' : total}
              </p>
              <p
                className="text-[11px] uppercase tracking-[0.18em] font-bold mt-2"
                style={{ color: 'var(--v5-cream)', opacity: 0.8, fontFamily: 'var(--font-mono), monospace' }}
              >
                {sortMode === 'nearest' ? 'Por cercanía' : 'Complejos activos'}
              </p>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <section
          className="mb-8 p-5 sm:p-6"
          style={{
            background: 'var(--v5-card-bg)',
            border: '1px solid var(--v5-paper-2)',
            borderRadius: 24,
          }}
        >
          <div className="flex flex-wrap items-end gap-3">
            {/* Near me */}
            <button
              onClick={() => (useNearMe ? setUseNearMe(false) : requestNearMe())}
              disabled={loc.mode === 'asking'}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-[12px] font-bold uppercase tracking-[0.12em]"
              style={{
                background: useNearMe ? 'var(--v5-orange)' : 'var(--v5-paper-2)',
                color: useNearMe ? 'var(--v5-ink)' : 'var(--v5-ink-2)',
                fontFamily: 'var(--font-mono), monospace',
                opacity: loc.mode === 'asking' ? 0.6 : 1,
              }}
            >
              {loc.mode === 'asking' ? '⏳' : '📍'}
              {useNearMe ? 'Cerca de mí' : 'Activar cercanía'}
            </button>

            <FilterField label="País">
              <select
                value={filterCountry}
                onChange={(e) => {
                  setFilterCountry(e.target.value);
                  setFilterState('');
                }}
                className="h-10 px-3 rounded-full text-[13px] min-w-[160px] outline-none appearance-none"
                style={{
                  background: 'var(--v5-paper)',
                  color: 'var(--v5-ink)',
                  border: '1px solid var(--v5-paper-2)',
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                }}
              >
                <option value="">Cualquiera</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </FilterField>

            {states && (
              <FilterField label="Provincia">
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="h-10 px-3 rounded-full text-[13px] min-w-[160px] outline-none appearance-none"
                  style={{
                    background: 'var(--v5-paper)',
                    color: 'var(--v5-ink)',
                    border: '1px solid var(--v5-paper-2)',
                    fontFamily: 'var(--font-sans), Inter, sans-serif',
                  }}
                >
                  <option value="">Cualquiera</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FilterField>
            )}

            <FilterField label="Ciudad">
              <input
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Buscar ciudad…"
                className="h-10 px-4 rounded-full text-[13px] min-w-[200px] outline-none"
                style={{
                  background: 'var(--v5-paper)',
                  color: 'var(--v5-ink)',
                  border: '1px solid var(--v5-paper-2)',
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                }}
              />
            </FilterField>

            <FilterField label="Deporte">
              <div
                className="flex gap-0.5 p-0.5 rounded-full"
                style={{ background: 'var(--v5-paper-2)' }}
              >
                {([
                  { v: '', l: 'Todos' },
                  { v: 'PADEL', l: 'Padel' },
                  { v: 'TENNIS', l: 'Tenis' },
                ] as const).map((opt) => {
                  const active = filterSport === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={() => setFilterSport(opt.v as '' | Sport)}
                      className="h-9 px-4 rounded-full text-[12px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        background: active
                          ? opt.v === 'TENNIS'
                            ? 'var(--v5-orange)'
                            : opt.v === 'PADEL'
                              ? 'var(--v5-sky)'
                              : 'var(--v5-ink)'
                          : 'transparent',
                        color: active && opt.v === '' ? 'var(--v5-cream)' : active ? 'var(--v5-ink)' : 'var(--v5-ink-2)',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>
            </FilterField>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-[12px] font-bold uppercase tracking-[0.12em] ml-auto"
                style={{
                  background: 'transparent',
                  color: 'var(--v5-ink-2)',
                  border: '1px solid var(--v5-paper-2)',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Helper text */}
          <p
            className="mt-4 text-[12px]"
            style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
          >
            {useNearMe && loc.coords ? (
              <>
                Más cercanos a <strong style={{ color: 'var(--v5-ink)' }}>{loc.label || 'tu ubicación'}</strong> · con distancia en km
              </>
            ) : loc.mode === 'manual' ? (
              <>
                Filtros sugeridos según <strong style={{ color: 'var(--v5-ink)' }}>{loc.label}</strong>
              </>
            ) : (
              <>Activá la ubicación o elegí país/ciudad para acotar.</>
            )}
          </p>
        </section>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((c, i) => (
              <ClubCard key={c.id} club={c} index={i} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-14 pt-8 text-center"
          style={{ borderTop: '1px solid var(--v5-paper-2)' }}
        >
          <FooterSignupCTA taglineLoggedOut="¿Tu club no está? Registralo gratis" />
          <div className="mt-6">
            <Link
              href="/"
              className="text-[12px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              ← Volver a pelotitas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5"
        style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ClubCard({ club, index }: { club: Club; index: number }) {
  const main = club.locations?.find((l) => l.isMain) || club.locations?.[0];
  return (
    <Link
      href={`/c/${club.id}`}
      className="block p-5 transition-transform"
      style={{
        background: 'var(--v5-card-bg)',
        border: '1px solid var(--v5-paper-2)',
        borderRadius: 24,
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        {club.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={club.logoUrl}
            alt={`${club.name} logo`}
            className="w-12 h-12 rounded-xl object-cover flex-none"
            style={{ background: 'var(--v5-paper-2)' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-none"
            style={{
              background: 'var(--v5-orange)',
              color: 'var(--v5-ink)',
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 22,
            }}
          >
            {club.name[0]?.toUpperCase() ?? 'C'}
          </div>
        )}
        <div className="flex flex-wrap gap-1 justify-end">
          {club.sports?.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{
                background: s === 'PADEL' ? 'var(--v5-sky)' : 'var(--v5-orange)',
                color: 'var(--v5-ink)',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {s === 'PADEL' ? 'Padel' : 'Tenis'}
            </span>
          ))}
          {typeof club.distanceKm === 'number' && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{
                background: 'var(--v5-yellow)',
                color: 'var(--v5-ink)',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {club.distanceKm < 1
                ? `${Math.round(club.distanceKm * 1000)} m`
                : `${club.distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>
      </div>

      <h3
        className="font-bold leading-tight tracking-[-0.02em] truncate"
        style={{
          fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
          fontSize: 20,
          color: 'var(--v5-ink)',
        }}
      >
        {club.name}
      </h3>

      {main && (
        <p
          className="text-[12px] mt-2 truncate"
          style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
        >
          📍 {[main.city, main.state, main.country].filter(Boolean).join(', ')}
        </p>
      )}

      <div
        className="mt-4 pt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em]"
        style={{
          borderTop: '1px solid var(--v5-paper-2)',
          color: 'var(--v5-ink-2)',
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        <span>
          <strong style={{ color: 'var(--v5-ink)' }}>{club._count?.courts ?? 0}</strong> canchas ·{' '}
          <strong style={{ color: 'var(--v5-ink)' }}>{club._count?.tournaments ?? 0}</strong> torneos
        </span>
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full"
          style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
        >
          →
        </span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div
      className="p-5 animate-pulse"
      style={{
        background: 'var(--v5-card-bg)',
        border: '1px solid var(--v5-paper-2)',
        borderRadius: 24,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl" style={{ background: 'var(--v5-paper-2)' }} />
        <div className="flex gap-1">
          <div className="w-12 h-5 rounded-full" style={{ background: 'var(--v5-paper-2)' }} />
        </div>
      </div>
      <div className="h-5 w-2/3 rounded mb-2" style={{ background: 'var(--v5-paper-2)' }} />
      <div className="h-3 w-1/2 rounded" style={{ background: 'var(--v5-paper-2)' }} />
      <div className="h-px w-full my-4" style={{ background: 'var(--v5-paper-2)' }} />
      <div className="h-3 w-1/3 rounded" style={{ background: 'var(--v5-paper-2)' }} />
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div
      className="text-center py-16 px-6"
      style={{
        background: 'var(--v5-card-bg)',
        border: '1px solid var(--v5-paper-2)',
        borderRadius: 28,
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl"
        style={{ background: 'var(--v5-paper-2)' }}
      >
        🏟️
      </div>
      <h3
        className="font-bold mb-2"
        style={{
          fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
          fontSize: 22,
          letterSpacing: '-0.02em',
        }}
      >
        No encontramos complejos
      </h3>
      <p
        className="text-[13px] mb-6 max-w-md mx-auto"
        style={{ color: 'var(--v5-ink-2)' }}
      >
        {hasFilters
          ? 'Probá ajustar los filtros o ampliar la zona.'
          : 'Todavía no hay complejos publicados en la plataforma.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.12em]"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
        >
          Limpiar filtros
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </button>
      )}
    </div>
  );
}
