'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */

export type LocationMode =
  | 'off'         // user has no location set
  | 'auto'        // browser geolocation succeeded
  | 'manual'      // user picked country/state/city manually
  | 'denied'      // user denied permission
  | 'unsupported' // browser doesn't support geolocation
  | 'asking';     // request in flight

export type Coords = { lat: number; lng: number };

export type ManualLocation = {
  country?: string;
  state?: string;
  city?: string;
};

type LocationState = {
  mode: LocationMode;
  coords: Coords | null;
  /** Reverse-geocoded display label (e.g. "Buenos Aires, Argentina"). */
  label: string | null;
  /** Components for filter use. */
  city: string | null;
  state: string | null;
  country: string | null;
  countryCode: string | null;
  /** Last time auto-location was refreshed. */
  updatedAt: number | null;
};

type LocationCtx = LocationState & {
  /** Ask the browser for permission and get GPS coords. */
  requestAuto: () => Promise<void>;
  /** Set country/state/city manually (e.g. "estoy en México ahora"). */
  setManual: (loc: ManualLocation) => void;
  /** Clear all location data. */
  clear: () => void;
};

const STORAGE_KEY = 'pelotitas_location_v1';

/* ─────────────────────────────────────────────────────────────
   Reverse geocode (BigDataCloud — no API key needed)
   ───────────────────────────────────────────────────────────── */
async function reverseGeocode(coords: Coords): Promise<{
  city: string | null;
  state: string | null;
  country: string | null;
  countryCode: string | null;
}> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=es`,
      { cache: 'no-store' },
    );
    if (!res.ok) throw new Error('rev-geo failed');
    const data = await res.json();
    return {
      city:        data.city || data.locality || null,
      state:       data.principalSubdivision || null,
      country:     data.countryName || null,
      countryCode: data.countryCode || null,
    };
  } catch {
    return { city: null, state: null, country: null, countryCode: null };
  }
}

/* ─────────────────────────────────────────────────────────────
   Provider
   ───────────────────────────────────────────────────────────── */

const Ctx = createContext<LocationCtx | null>(null);

const initialState: LocationState = {
  mode: 'off',
  coords: null,
  label: null,
  city: null,
  state: null,
  country: null,
  countryCode: null,
  updatedAt: null,
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocationState>(initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocationState;
        // Don't restore "asking" — that's transient
        if (parsed.mode !== 'asking') setState(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: LocationState) => {
    setState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const requestAuto = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      persist({ ...initialState, mode: 'unsupported' });
      return;
    }
    setState((s) => ({ ...s, mode: 'asking' }));
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords: Coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const geo = await reverseGeocode(coords);
          persist({
            mode: 'auto',
            coords,
            label: [geo.city, geo.country].filter(Boolean).join(', ') || null,
            city: geo.city,
            state: geo.state,
            country: geo.country,
            countryCode: geo.countryCode,
            updatedAt: Date.now(),
          });
          resolve();
        },
        (err) => {
          persist({
            ...initialState,
            mode: err.code === err.PERMISSION_DENIED ? 'denied' : 'off',
          });
          resolve();
        },
        { timeout: 10000, maximumAge: 60_000 * 30 }, // cache 30 min
      );
    });
  }, [persist]);

  const setManual = useCallback(
    (loc: ManualLocation) => {
      const label = [loc.city, loc.country].filter(Boolean).join(', ') || null;
      persist({
        mode: 'manual',
        coords: null,
        label,
        city: loc.city || null,
        state: loc.state || null,
        country: loc.country || null,
        countryCode: null,
        updatedAt: Date.now(),
      });
    },
    [persist],
  );

  const clear = useCallback(() => {
    persist(initialState);
  }, [persist]);

  return (
    <Ctx.Provider value={{ ...state, requestAuto, setManual, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocation(): LocationCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider');
  return ctx;
}

/* ─────────────────────────────────────────────────────────────
   Country list (used for dropdowns)
   ───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   Country list with ISO code, display name, dial code and flag emoji.
   Used by location dropdowns AND PhoneInput.
   ───────────────────────────────────────────────────────────── */

export type Country = {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
  dial: string;   // E.164 country code, e.g. '+54'
  flag: string;   // Unicode flag emoji
  /** Approx national-number length, used as soft validation hint. */
  nsnLen?: [number, number];
};

export const COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina',      dial: '+54',  flag: '🇦🇷', nsnLen: [10, 11] },
  { code: 'MX', name: 'México',         dial: '+52',  flag: '🇲🇽', nsnLen: [10, 10] },
  { code: 'ES', name: 'España',         dial: '+34',  flag: '🇪🇸', nsnLen: [9,  9]  },
  { code: 'CL', name: 'Chile',          dial: '+56',  flag: '🇨🇱', nsnLen: [9,  9]  },
  { code: 'UY', name: 'Uruguay',        dial: '+598', flag: '🇺🇾', nsnLen: [8,  9]  },
  { code: 'PY', name: 'Paraguay',       dial: '+595', flag: '🇵🇾', nsnLen: [9,  9]  },
  { code: 'BR', name: 'Brasil',         dial: '+55',  flag: '🇧🇷', nsnLen: [10, 11] },
  { code: 'PE', name: 'Perú',           dial: '+51',  flag: '🇵🇪', nsnLen: [9,  9]  },
  { code: 'CO', name: 'Colombia',       dial: '+57',  flag: '🇨🇴', nsnLen: [10, 10] },
  { code: 'EC', name: 'Ecuador',        dial: '+593', flag: '🇪🇨', nsnLen: [9,  9]  },
  { code: 'VE', name: 'Venezuela',      dial: '+58',  flag: '🇻🇪', nsnLen: [10, 10] },
  { code: 'BO', name: 'Bolivia',        dial: '+591', flag: '🇧🇴', nsnLen: [8,  8]  },
  { code: 'US', name: 'Estados Unidos', dial: '+1',   flag: '🇺🇸', nsnLen: [10, 10] },
  { code: 'PT', name: 'Portugal',       dial: '+351', flag: '🇵🇹', nsnLen: [9,  9]  },
  { code: 'IT', name: 'Italia',         dial: '+39',  flag: '🇮🇹', nsnLen: [9, 11] },
  { code: 'FR', name: 'Francia',        dial: '+33',  flag: '🇫🇷', nsnLen: [9,  9]  },
  { code: 'DE', name: 'Alemania',       dial: '+49',  flag: '🇩🇪', nsnLen: [10, 11] },
  { code: 'GB', name: 'Reino Unido',    dial: '+44',  flag: '🇬🇧', nsnLen: [10, 10] },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]; // Argentina

/** Lookup by display name (used to map LocationContext.country → Country). */
export function findCountryByName(name?: string | null): Country | undefined {
  if (!name) return undefined;
  return COUNTRIES.find((c) => c.name === name);
}

/** Lookup by ISO code. */
export function findCountryByCode(code?: string | null): Country | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === upper);
}

/** Try to parse a stored E.164 string back into country + national number.
 *  Returns null if no known country matches. */
export function parseE164(input?: string | null): { country: Country; nsn: string } | null {
  if (!input) return null;
  const cleaned = input.trim();
  if (!cleaned.startsWith('+')) return null;
  // Match longest dial code first (so +591 beats +59).
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (cleaned.startsWith(c.dial)) {
      const nsn = cleaned.slice(c.dial.length).replace(/\D/g, '');
      return { country: c, nsn };
    }
  }
  return null;
}

/** Strict-ish E.164 check: + followed by 8-15 digits. */
export function isValidE164(value?: string | null): boolean {
  if (!value) return false;
  return /^\+\d{8,15}$/.test(value);
}

/* States/provinces for the most common countries. Light-weight lookup. */
export const STATES_BY_COUNTRY: Record<string, string[]> = {
  Argentina: [
    'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán',
    'Salta', 'Entre Ríos', 'Misiones', 'Chaco', 'Corrientes',
    'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro', 'Formosa',
    'Neuquén', 'Chubut', 'San Luis', 'Catamarca', 'La Rioja', 'La Pampa',
    'Santa Cruz', 'Tierra del Fuego',
  ],
  México: [
    'Ciudad de México', 'Jalisco', 'Nuevo León', 'Estado de México', 'Yucatán',
    'Puebla', 'Querétaro', 'Quintana Roo', 'Guanajuato', 'Veracruz',
    'Baja California', 'Baja California Sur', 'Sonora', 'Chihuahua',
  ],
  España: [
    'Madrid', 'Cataluña', 'Andalucía', 'Comunidad Valenciana', 'Galicia',
    'País Vasco', 'Castilla y León', 'Castilla-La Mancha', 'Canarias',
    'Aragón', 'Murcia', 'Asturias', 'Navarra', 'Cantabria', 'Baleares',
    'Extremadura', 'La Rioja',
  ],
  Chile: [
    'Región Metropolitana', 'Valparaíso', 'Biobío', 'Maule', 'Coquimbo',
    'O\'Higgins', 'Los Lagos', 'Antofagasta', 'Atacama', 'Araucanía',
  ],
  Uruguay: [
    'Montevideo', 'Canelones', 'Maldonado', 'Salto', 'Paysandú',
  ],
  Brasil: [
    'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná',
    'Rio Grande do Sul', 'Pernambuco', 'Ceará', 'Pará', 'Santa Catarina',
  ],
};

/* ─────────────────────────────────────────────────────────────
   Haversine — used for client-side distance display fallback
   ───────────────────────────────────────────────────────────── */
export function haversineKm(a: Coords, b: Coords): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
