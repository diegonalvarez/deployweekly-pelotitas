'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Activity,
  CalendarCheck,
  Trophy,
  GraduationCap,
  Users,
  Settings,
  Eye,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

type Club = {
  id: string;
  name: string;
  imageUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  sports: string[];
  approvalStatus: string;
  ownerId: string;
  locations?: { city: string; state: string | null; isMain: boolean }[];
  _count?: { courts?: number; tournaments?: number };
};

export default function ClubDashboardOverview() {
  const params = useParams<{ clubId: string }>();
  const clubId = params?.clubId;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (authLoading || !clubId) return;
    if (!user) {
      router.replace(`/login?next=/dashboard/club/${clubId}`);
      return;
    }
    const isAdmin = user.roles?.includes('ADMIN');

    Promise.all([
      api.get<Club>(`/clubs/${clubId}`),
      isAdmin ? Promise.resolve([] as Club[]) : api.get<Club[]>('/clubs/mine'),
    ])
      .then(([clubData, mine]) => {
        const isOwner = clubData.ownerId === user.id || mine.some((c) => c.id === clubId);
        if (!isAdmin && !isOwner) {
          router.replace(`/c/${clubId}`);
          return;
        }
        setClub(clubData);
        setAllowed(true);
      })
      .catch(() => router.replace(`/c/${clubId}`))
      .finally(() => setLoading(false));
  }, [authLoading, user, clubId, router]);

  if (loading || !allowed || !club) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando complejo...
        </div>
      </div>
    );
  }

  const mainLocation = club.locations?.find((l) => l.isMain) || club.locations?.[0];
  const tiles = [
    { href: `/dashboard/club/${clubId}/reservations`, label: 'Reservas', desc: 'Confirmá / cancelá las reservas entrantes', icon: <CalendarCheck className="w-5 h-5" />, accent: 'var(--v5-lime)' },
    { href: `/dashboard/club/${clubId}/courts`,       label: 'Canchas',  desc: 'Agregá, edití horarios y precios', icon: <Activity className="w-5 h-5" />, accent: 'var(--v5-sky)' },
    { href: `/dashboard/club/${clubId}/tournaments`,  label: 'Torneos',  desc: 'Creá torneos y gestioná inscriptos', icon: <Trophy className="w-5 h-5" />, accent: 'var(--v5-yellow)' },
    { href: `/dashboard/club/${clubId}/coaches`,      label: 'Profesores', desc: 'Vincula coaches al club', icon: <GraduationCap className="w-5 h-5" />, accent: 'var(--v5-pink)' },
    { href: `/dashboard/club/${clubId}/players`,      label: 'Jugadores', desc: 'Conexiones y reservaciones por jugador', icon: <Users className="w-5 h-5" />, accent: 'var(--v5-orange)' },
    { href: `/dashboard/club/${clubId}/settings`,     label: 'Configuración', desc: 'Datos públicos, imágenes, horarios, redes', icon: <Settings className="w-5 h-5" />, accent: 'var(--v5-cream)' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/club"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Mis complejos
        </Link>

        {/* Header card */}
        <section
          className="relative overflow-hidden p-6 sm:p-10"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)', borderRadius: 32 }}
        >
          {club.imageUrl && (
            <div className="absolute inset-0 opacity-25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={club.imageUrl} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%)' }}
              />
            </div>
          )}
          <div className="relative flex items-start gap-5 flex-wrap">
            {club.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.logoUrl}
                alt={`${club.name} logo`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-none"
                style={{ background: 'var(--v5-cream)' }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}
              >
                Panel de gestión
              </p>
              <h1
                className="font-bold uppercase tracking-[-0.025em] leading-[0.95] mt-1"
                style={{
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 'clamp(28px, 4.5vw, 48px)',
                  color: 'var(--v5-cream)',
                }}
              >
                {club.name}
              </h1>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                {mainLocation && (
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{
                      background: 'rgba(242,237,222,0.12)',
                      color: 'var(--v5-cream)',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    📍 {mainLocation.city}
                  </span>
                )}
                {club.sports.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{
                      background: s === 'PADEL' ? 'var(--v5-sky)' : 'var(--v5-orange)',
                      color: 'var(--v5-ink)',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    {s === 'PADEL' ? 'Padel' : 'Tenis'}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href={`/c/${clubId}`}
              target="_blank"
              rel="noreferrer"
              className="relative inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.12em]"
              style={{ background: 'var(--v5-cream)', color: 'var(--v5-brown)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              Ver landing pública
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
              >
                →
              </span>
            </Link>
          </div>
        </section>

        {/* Tiles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group p-5 transition-transform hover:-translate-y-0.5"
              style={{
                background: 'var(--v5-card-bg)',
                border: '1px solid var(--v5-paper-2)',
                borderRadius: 24,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: t.accent, color: 'var(--v5-ink)' }}
                >
                  {t.icon}
                </div>
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors"
                  style={{ background: 'var(--v5-paper-2)', color: 'var(--v5-ink-2)' }}
                >
                  →
                </span>
              </div>
              <h3
                className="font-bold leading-tight"
                style={{
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 20,
                  letterSpacing: '-0.02em',
                  color: 'var(--v5-ink)',
                }}
              >
                {t.label}
              </h3>
              <p className="text-[13px] mt-1.5" style={{ color: 'var(--v5-ink-2)' }}>
                {t.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
