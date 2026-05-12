'use client';

import { useEffect, useState } from 'react';

type Props = {
  hoursWeekday: string | null;
  hoursWeekend: string | null;
};

/** Parse "08:00 — 23:30" (or "08:00 - 23:30") into [openMin, closeMin] in minutes. */
function parseRange(range: string | null): [number, number] | null {
  if (!range) return null;
  const m = range.match(/(\d{1,2}):(\d{2})\s*[—\-–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const open = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const close = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
  return [open, close];
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const mm = min % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function OpenStatusBadge({ hoursWeekday, hoursWeekend }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!now || (!hoursWeekday && !hoursWeekend)) return null;

  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const todayRange = parseRange(isWeekend ? hoursWeekend : hoursWeekday);
  if (!todayRange) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [open, close] = todayRange;
  const isOpen = nowMin >= open && nowMin < close;
  const closingSoon = isOpen && close - nowMin <= 60;

  const bg = isOpen ? (closingSoon ? 'var(--v5-yellow)' : 'var(--v5-lime)') : 'var(--v5-paper-2)';
  const fg = isOpen ? 'var(--v5-ink)' : 'var(--v5-ink-2)';
  const dotBg = isOpen ? '#1a8a2e' : '#999';
  const label = isOpen
    ? closingSoon
      ? `Cierra ${fmtMin(close)}`
      : `Abierto · ${fmtMin(open)}–${fmtMin(close)}`
    : nowMin < open
      ? `Abre hoy ${fmtMin(open)}`
      : `Cerrado · abre mañana`;

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
      style={{
        background: bg,
        color: fg,
        fontFamily: 'var(--font-mono), monospace',
        boxShadow: isOpen ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          background: dotBg,
          animation: isOpen ? 'pelotitas-pulse 2s ease-in-out infinite' : 'none',
        }}
      />
      {label}
    </span>
  );
}
