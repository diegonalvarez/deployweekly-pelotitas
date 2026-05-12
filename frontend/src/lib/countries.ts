/** Shared country list — no React, safe to import from server components. */

export type Country = {
  code: string;
  name: string;
  dial: string;
  flag: string;
  nsnLen: [number, number];
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

export const DEFAULT_COUNTRY: Country = COUNTRIES[0];

export function findCountryByName(name?: string | null): Country | undefined {
  if (!name) return undefined;
  return COUNTRIES.find((c) => c.name === name);
}

export function findCountryByCode(code?: string | null): Country | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === upper);
}
