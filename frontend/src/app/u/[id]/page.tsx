import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TimelineClient from './TimelineClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

async function getProfile(id: string) {
  try {
    const res = await fetch(`${API}/api/public/u/${id}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
async function getTimeline(id: string) {
  try {
    const res = await fetch(`${API}/api/public/u/${id}/timeline`, { next: { revalidate: 15 } });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const u = await getProfile(params.id);
  if (!u) return { title: 'Jugador — pelotitas' };
  const name = `${u.firstName} ${u.lastName}`;
  const elo = u.eloRatings?.[0]?.rating;
  const desc = elo ? `ELO ${elo} · ${u.playerProfile?.matchesPlayed ?? 0} partidos en pelotitas` : 'Perfil de jugador en pelotitas';
  return {
    title: `${name} — pelotitas`,
    description: desc,
    openGraph: { title: name, description: desc, type: 'profile' },
    twitter:   { card: 'summary_large_image', title: name, description: desc },
  };
}

export default async function PublicProfile({ params }: { params: { id: string } }) {
  const [profile, posts] = await Promise.all([getProfile(params.id), getTimeline(params.id)]);
  if (!profile) notFound();

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const padel = profile.eloRatings?.find((e: any) => e.sport === 'PADEL');
  const tennis = profile.eloRatings?.find((e: any) => e.sport === 'TENNIS');
  const pp = profile.playerProfile;

  return (
    <div className="min-h-screen" style={{ background: 'var(--v5-paper)', color: 'var(--v5-ink)' }}>
      {/* Top bar */}
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--v5-paper-2)' }}>
        <Link href="/" className="text-[20px] font-bold tracking-[-0.025em]" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          PELOTITAS<span style={{ color: 'var(--v5-orange)' }}>.</span>
        </Link>
        <Link href="/register" className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.1em]"
              style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}>
          Crear cuenta gratis
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full" style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}>→</span>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Hero profile card */}
        <section className="v5-hero-card relative p-6 sm:p-10 mb-8">
          <div className="flex items-center gap-5 sm:gap-7 flex-wrap">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center font-bold"
                 style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)', fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 40 }}>
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}>
                Perfil público · jugador
              </p>
              <h1 className="font-bold uppercase tracking-[-0.03em] leading-[0.92] mt-1"
                  style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 'clamp(34px, 5vw, 56px)', color: 'var(--v5-cream)' }}>
                {fullName}
              </h1>
              {pp?.bio && <p className="text-[14px] mt-3 max-w-md leading-relaxed" style={{ color: 'rgba(242,237,222,0.75)' }}>{pp.bio}</p>}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-7 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ borderTop: '1px solid #5C3320' }}>
            {[
              { l: 'ELO Padel',   v: padel?.rating ?? '—' },
              { l: 'ELO Tenis',   v: tennis?.rating ?? '—' },
              { l: 'Partidos',    v: pp?.matchesPlayed ?? 0 },
              { l: 'Win rate',    v: (pp?.matchesPlayed ?? 0) > 0 ? `${Math.round((pp.matchesWon / pp.matchesPlayed) * 100)}%` : '—' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]"
                   style={{ color: 'rgba(242,237,222,0.55)', fontFamily: 'var(--font-mono), monospace' }}>
                  {s.l}
                </p>
                <p className="font-bold tabular leading-none mt-1 tracking-[-0.04em]"
                   style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 30, color: 'var(--v5-cream)' }}>
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <TimelineClient userId={profile.id} initialPosts={posts} ownerName={profile.firstName} />

        <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid var(--v5-paper-2)' }}>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}>
            Anotá tu próximo partido en pelotitas
          </p>
          <Link href="/register" className="mt-4 inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
                style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}>
            Crear cuenta gratis
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
