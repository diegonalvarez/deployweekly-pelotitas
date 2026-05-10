/* ─────────────────────────────────────────────────────────────
   Date helpers — single source of truth for date formatting
   across the app. Standard format: 09-may-2026
   ───────────────────────────────────────────────────────────── */

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const WEEKDAYS_LONG  = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;

/** Coerce input into a Date. Accepts Date, ISO string, "YYYY-MM-DD",
 *  or anything `new Date()` can parse. Returns null on invalid input. */
function toDate(input: Date | string | number | null | undefined): Date | null {
  if (input == null) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input === 'string') {
    // Treat plain "YYYY-MM-DD" as local-noon to avoid TZ shifting it a day back.
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const d = new Date(input + 'T12:00:00');
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/* ─── Format helpers ─────────────────────────────────────────── */

/** Standard date — "09-may-2026". Use this everywhere a date is shown. */
export function formatDate(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  return `${pad2(d.getDate())}-${MONTHS_ES[d.getMonth()]}-${d.getFullYear()}`;
}

/** Short date — "9-may" (no year). Use only in dense UI like list cards
 *  where the full year is redundant or there's no room. */
export function formatDateShort(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  return `${d.getDate()}-${MONTHS_ES[d.getMonth()]}`;
}

/** With weekday — "lun 09-may-2026". Use in calendar/agenda contexts. */
export function formatDateWithWeekday(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  return `${WEEKDAYS_SHORT[d.getDay()]} ${formatDate(d)}`;
}

/** Just time — "14:30". 24h format. */
export function formatTime(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Date + time — "09-may-2026 · 14:30". */
export function formatDateTime(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  return `${formatDate(d)} · ${formatTime(d)}`;
}

/** Long weekday — "lunes 09-may-2026". Use sparingly. */
export function formatDateLong(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  return `${WEEKDAYS_LONG[d.getDay()]} ${formatDate(d)}`;
}

/** Month + year — "may 2026". For headers like calendar month titles. */
export function formatMonthYear(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

/* ─── Input helpers ──────────────────────────────────────────── */

/** Today as "YYYY-MM-DD" — value for <input type="date" />. */
export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Convert a Date to "YYYY-MM-DD" — for <input type="date" /> values. */
export function toDateInputString(input: Date | string | number): string {
  const d = toDate(input);
  if (!d) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/* ─── Relative helpers ───────────────────────────────────────── */

/** "hace 5 min", "hace 2 h", "hace 3 d", or formatDate(d) if older than 7 days. */
export function formatRelative(input: Date | string | number | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'ahora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `hace ${day} d`;
  return formatDate(d);
}

/** Days from today (positive future, negative past, 0 today). */
export function daysFromToday(input: Date | string | number): number {
  const d = toDate(input);
  if (!d) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
