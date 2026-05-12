'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type Slot = { time: string; endTime: string; available: boolean };
type AvailabilityResp = { slots: Slot[] };

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isFutureSlot(s: Slot, now: Date): boolean {
  const [h, m] = s.time.split(':').map(Number);
  return h * 60 + m > now.getHours() * 60 + now.getMinutes();
}

export default function CourtReserveAction({
  clubId,
  courtId,
}: {
  clubId: string;
  courtId: string;
}) {
  const { user, loading: authLoading } = useAuth();
  const [availCount, setAvailCount] = useState<number | null>(null);
  const [nextSlot, setNextSlot] = useState<string | null>(null);
  const [probed, setProbed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/courts/${courtId}/availability?date=${todayISO()}`)
      .then((r) => (r.ok ? (r.json() as Promise<AvailabilityResp>) : null))
      .then((data) => {
        if (cancelled || !data) {
          if (!cancelled) setProbed(true);
          return;
        }
        const now = new Date();
        const future = (data.slots ?? []).filter((s) => s.available && isFutureSlot(s, now));
        setAvailCount(future.length);
        setNextSlot(future[0]?.time ?? null);
        setProbed(true);
      })
      .catch(() => {
        if (!cancelled) setProbed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [courtId]);

  const isLoggedIn = !authLoading && !!user;
  const href = isLoggedIn ? `/clubs/${clubId}` : `/register?next=/clubs/${clubId}`;
  const label = isLoggedIn ? 'Reservar' : 'Registrate y reservá';

  return (
    <div className="mt-4">
      {/* Availability chip */}
      {probed && availCount !== null && (
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3 inline-flex items-center gap-1.5"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: availCount > 0 ? '#1a8a2e' : '#999' }}
          />
          <span style={{ color: availCount > 0 ? 'var(--v5-ink)' : 'var(--v5-ink-2)' }}>
            {availCount > 0
              ? nextSlot
                ? `Próximo turno · ${nextSlot}`
                : `${availCount} turnos hoy`
              : 'Sin turnos hoy'}
          </span>
        </p>
      )}

      <Link
        href={href}
        className="w-full inline-flex items-center justify-between pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.12em]"
        style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
      >
        {label}
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full"
          style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
        >
          →
        </span>
      </Link>
    </div>
  );
}
