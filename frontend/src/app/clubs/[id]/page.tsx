'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function ClubsLegacyRedirect() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!id) return;
    if (loading) return;
    if (!user) {
      router.replace(`/c/${id}`);
      return;
    }
    api
      .get<any[]>('/clubs/mine')
      .then((clubs) => {
        const isOwner = Array.isArray(clubs) && clubs.some((c) => c.id === id);
        router.replace(isOwner ? `/dashboard/club/${id}` : `/c/${id}`);
      })
      .catch(() => router.replace(`/c/${id}`));
  }, [id, user, loading, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--v5-paper)' }}
    >
      <p
        className="text-[12px] font-bold uppercase tracking-[0.22em]"
        style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
      >
        Cargando…
      </p>
    </div>
  );
}
