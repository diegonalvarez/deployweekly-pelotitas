'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLocation, COUNTRIES, STATES_BY_COUNTRY } from '@/lib/location';
import {
  Search,
  Loader2,
  MapPin,
  Building2,
  Navigation,
  X,
  ChevronDown,
} from 'lucide-react';

type Club = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sports?: string[];
  locations?: { city?: string; state?: string; country?: string; address?: string; isMain?: boolean }[];
  courts?: { id: string }[];
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

export default function ClubsPage() {
  const loc = useLocation();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortMode, setSortMode] = useState<'recent' | 'nearest'>('recent');

  // Filters
  const [filterCountry, setFilterCountry] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [useNearMe, setUseNearMe] = useState(false);

  // Bootstrap filters from LocationContext on first mount
  const [bootstrapped, setBootstrapped] = useState(false);
  useEffect(() => {
    if (bootstrapped) return;
    if (loc.mode === 'auto' && loc.coords) {
      setUseNearMe(true);
      if (loc.country) setFilterCountry(loc.country);
    } else if (loc.mode === 'manual') {
      if (loc.country) setFilterCountry(loc.country);
      if (loc.state)   setFilterState(loc.state);
      if (loc.city)    setFilterCity(loc.city);
    }
    setBootstrapped(true);
  }, [loc, bootstrapped]);

  const states = filterCountry ? STATES_BY_COUNTRY[filterCountry] || null : null;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCountry) params.set('country', filterCountry);
      if (filterState)   params.set('state',   filterState);
      if (filterCity)    params.set('city',    filterCity);
      if (filterSport)   params.set('sport',   filterSport);

      if (useNearMe && loc.coords) {
        params.set('lat',  String(loc.coords.lat));
        params.set('lng',  String(loc.coords.lng));
        params.set('sort', 'nearest');
      }

      const res = await api.get<ListResponse>(`/clubs?${params}`);
      setClubs(res.clubs || []);
      setTotal(res.total || 0);
      setSortMode(res.sort || 'recent');
    } catch {
      setClubs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Reload when filters change (debounced for city text)
  useEffect(() => {
    const handle = setTimeout(load, filterCity ? 250 : 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCountry, filterState, filterCity, filterSport, useNearMe, loc.coords?.lat, loc.coords?.lng]);

  const hasFilters = filterCountry || filterState || filterCity || filterSport || useNearMe;
  const clearFilters = () => {
    setFilterCountry('');
    setFilterState('');
    setFilterCity('');
    setFilterSport('');
    setUseNearMe(false);
  };

  const requestNearMe = async () => {
    if (loc.mode !== 'auto') {
      await loc.requestAuto();
    }
    setUseNearMe(true);
  };

  return (
    <div className="bg-base">
      {/* ── Page header ─────────────────────── */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="eyebrow text-text-muted">Descubrir</p>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
                Complejos
              </h1>
            </div>
            <div className="text-2xs text-text-muted tabular">
              {loading
                ? 'Buscando…'
                : `${total.toLocaleString('es-AR')} resultado${total === 1 ? '' : 's'}`
              }
              {sortMode === 'nearest' && (
                <span className="ml-2 text-brand">· orden por cercanía</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Filter bar ─────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-end gap-3">
            {/* Near me toggle */}
            <button
              onClick={() => useNearMe ? setUseNearMe(false) : requestNearMe()}
              disabled={loc.mode === 'asking'}
              className={`flex items-center gap-2 h-10 px-3.5 rounded-lg border text-sm font-medium transition-all ${
                useNearMe
                  ? 'bg-brand text-brand-ink border-brand'
                  : 'bg-surface-light text-text-secondary border-border-dark hover:border-border-default hover:text-text-primary'
              }`}
            >
              {loc.mode === 'asking'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Navigation className="w-4 h-4" />
              }
              {useNearMe ? 'Cerca de mí' : 'Activar cercanía'}
            </button>

            {/* Country */}
            <div className="flex flex-col">
              <label className="text-2xs text-text-muted uppercase font-semibold tracking-widest mb-1" style={{ letterSpacing: '0.1em' }}>
                País
              </label>
              <div className="relative">
                <select
                  className="input h-10 pr-9 appearance-none cursor-pointer min-w-[160px]"
                  value={filterCountry}
                  onChange={(e) => { setFilterCountry(e.target.value); setFilterState(''); }}
                >
                  <option value="">Cualquiera</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              </div>
            </div>

            {/* State */}
            {states && (
              <div className="flex flex-col">
                <label className="text-2xs text-text-muted uppercase font-semibold tracking-widest mb-1" style={{ letterSpacing: '0.1em' }}>
                  Provincia
                </label>
                <div className="relative">
                  <select
                    className="input h-10 pr-9 appearance-none cursor-pointer min-w-[160px]"
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                  >
                    <option value="">Cualquiera</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                </div>
              </div>
            )}

            {/* City */}
            <div className="flex flex-col">
              <label className="text-2xs text-text-muted uppercase font-semibold tracking-widest mb-1" style={{ letterSpacing: '0.1em' }}>
                Ciudad
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                <input
                  className="input h-10 pl-9 min-w-[180px]"
                  placeholder="Buscar ciudad…"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                />
              </div>
            </div>

            {/* Sport */}
            <div className="flex flex-col">
              <label className="text-2xs text-text-muted uppercase font-semibold tracking-widest mb-1" style={{ letterSpacing: '0.1em' }}>
                Deporte
              </label>
              <div className="flex gap-1 bg-surface-light border border-border-dark rounded-lg p-0.5">
                {[
                  { value: '',       label: 'Todos' },
                  { value: 'PADEL',  label: 'Padel'  },
                  { value: 'TENNIS', label: 'Tenis'  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterSport(opt.value)}
                    className={`px-3 h-9 text-xs font-medium rounded-md transition-colors ${
                      filterSport === opt.value
                        ? opt.value === 'TENNIS' ? 'bg-clay text-white' :
                          opt.value === 'PADEL'  ? 'bg-sky text-white'  :
                          'bg-surface text-text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn-ghost h-10 text-xs"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>

          {/* Helper line — explains current location filter status */}
          <div className="mt-3 flex items-center gap-2 text-2xs text-text-muted flex-wrap">
            <MapPin className="w-3 h-3 text-brand" />
            {useNearMe && loc.coords ? (
              <>
                <span>Mostrando primero los más cercanos a</span>
                <span className="text-text-primary font-medium">{loc.label || 'tu ubicación'}</span>
                <span className="text-text-muted">·</span>
                <span>Resultados con distancia en km.</span>
              </>
            ) : loc.mode === 'manual' ? (
              <>
                <span>Filtros sugeridos según tu ubicación elegida:</span>
                <span className="text-text-primary font-medium">{loc.label}</span>
              </>
            ) : (
              <>
                <span>
                  Activá la ubicación o elegí país/ciudad para ver complejos cerca tuyo.
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Results ─────────────────────── */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : clubs.length === 0 ? (
          <div className="card-elevated text-center py-16">
            <div className="w-12 h-12 rounded-lg bg-surface-light text-text-muted mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No encontramos complejos</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              {hasFilters
                ? 'Probá ajustar los filtros o ampliar la zona de búsqueda.'
                : 'Todavía no hay complejos publicados en la plataforma.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club, i) => <ClubCard key={club.id} club={club} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Card
   ───────────────────────────────────────────────────────────── */
function ClubCard({ club, index }: { club: Club; index: number }) {
  const main = club.locations?.find((l) => l.isMain) || club.locations?.[0];

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="card-interactive group animate-fade-in-up block"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/15 flex items-center justify-center text-brand shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {club.sports?.map((s) => (
            <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
              {s === 'PADEL' ? 'Padel' : 'Tenis'}
            </span>
          ))}
          {typeof club.distanceKm === 'number' && (
            <span className="badge-brand">
              <Navigation className="w-3 h-3" />
              {club.distanceKm < 1
                ? `${Math.round(club.distanceKm * 1000)} m`
                : `${club.distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight-2 mb-1 group-hover:text-brand transition-colors truncate">
        {club.name}
      </h3>

      {/* Location */}
      {main && (
        <p className="text-2xs text-text-muted inline-flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {[main.city, main.state, main.country].filter(Boolean).join(', ')}
          </span>
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-dark text-2xs text-text-muted">
        <span>
          <span className="text-text-primary font-bold tabular">{club._count?.courts || 0}</span> canchas
        </span>
        <span>
          <span className="text-text-primary font-bold tabular">{club._count?.tournaments || 0}</span> torneos
        </span>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton
   ───────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card border border-border-dark animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-lg bg-surface-light" />
        <div className="flex gap-1">
          <div className="w-12 h-5 rounded bg-surface-light" />
        </div>
      </div>
      <div className="h-5 w-2/3 bg-surface-light rounded mb-2" />
      <div className="h-3 w-1/2 bg-surface-light rounded" />
      <div className="h-px w-full bg-border-dark my-4" />
      <div className="flex gap-3">
        <div className="h-3 w-16 bg-surface-light rounded" />
        <div className="h-3 w-16 bg-surface-light rounded" />
      </div>
    </div>
  );
}
