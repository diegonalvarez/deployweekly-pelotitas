import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type UserBrief = { id: string; firstName: string; lastName: string; avatarUrl: string | null };
type Sport = 'PADEL' | 'TENNIS';
type Last5 = {
  id: string;
  sport: Sport;
  date: string;
  city: string | null;
  venue: string | null;
  scoreA: string | null;
  scoreB: string | null;
  winner: 'A' | 'B' | 'DRAW' | null;
};
type H2H = {
  userA: UserBrief;
  userB: UserBrief;
  total: number;
  winsA: number;
  winsB: number;
  draws: number;
  detailVisible: boolean;
  last5: Last5[];
};

async function getH2H(a: string, b: string): Promise<H2H | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/h2h/${a}/vs/${b}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as H2H;
  } catch {
    return null;
  }
}

const fullName = (u: UserBrief) => `${u.firstName} ${u.lastName}`;

export async function generateMetadata({
  params,
}: {
  params: { a: string; b: string };
}): Promise<Metadata> {
  const data = await getH2H(params.a, params.b);
  if (!data) return { title: 'Head to Head — pelotitas' };
  const title = `${fullName(data.userA)} vs ${fullName(data.userB)}`;
  const desc = `${data.winsA}-${data.winsB}${data.draws ? ` (${data.draws})` : ''} · ${data.total} ${data.total === 1 ? 'partido' : 'partidos'}`;
  return {
    title: `${title} — pelotitas`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      images: [{ url: `/h2h/${params.a}/vs/${params.b}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [`/h2h/${params.a}/vs/${params.b}/opengraph-image`],
    },
  };
}

export default async function H2HPage({ params }: { params: { a: string; b: string } }) {
  const data = await getH2H(params.a, params.b);
  if (!data) notFound();

  const aLeads = data.winsA > data.winsB;
  const bLeads = data.winsB > data.winsA;

  return (
    <div className="min-h-screen bg-base bg-court-lines">
      <div className="max-w-3xl mx-auto px-5 py-10 sm:py-16">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="font-display font-bold text-lg tracking-tight-2 text-text-primary">
            pelotitas<span className="text-brand">.</span>
          </Link>
          <span className="text-text-muted/40">·</span>
          <span className="font-mono text-2xs uppercase text-text-muted tracking-[0.2em]">
            Head to head
          </span>
        </div>

        {/* Hero — the score line */}
        <article className="card-elevated p-0 overflow-hidden mb-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
            <PlayerCol user={data.userA} leads={aLeads} side="left" />
            <div className="flex flex-col items-center justify-center px-2 sm:px-6 py-6 border-x border-border-dark">
              <span className="font-mono text-2xs uppercase tracking-widest text-text-muted mb-1">
                Total
              </span>
              <span className="score-digit text-5xl sm:text-7xl text-text-primary">
                {data.winsA}
                <span className="text-text-muted mx-1 sm:mx-2">-</span>
                {data.winsB}
              </span>
              {data.draws > 0 && (
                <span className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-1">
                  Empates · {data.draws}
                </span>
              )}
              <span className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-2">
                {data.total} {data.total === 1 ? 'partido' : 'partidos'}
              </span>
            </div>
            <PlayerCol user={data.userB} leads={bLeads} side="right" />
          </div>
        </article>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat label="Partidos" value={String(data.total)} />
          <Stat label={`Wins ${data.userA.firstName}`} value={String(data.winsA)} accent={aLeads} />
          <Stat label={`Wins ${data.userB.firstName}`} value={String(data.winsB)} accent={bLeads} />
        </div>

        {/* Last 5 */}
        {data.detailVisible && data.last5.length > 0 && (
          <section className="card-elevated">
            <h2 className="font-display text-xl font-semibold tracking-tight-2 mb-4">Últimos partidos</h2>
            <div className="divide-y divide-border-dark">
              {data.last5.map((m) => {
                const d = new Date(m.date);
                const winLabel = m.winner === 'A' ? fullName(data.userA) : m.winner === 'B' ? fullName(data.userB) : 'Empate';
                return (
                  <div key={m.id} className="py-3 flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-2xs uppercase tracking-widest text-text-muted w-24 shrink-0">
                      {d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    <span className={m.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                      {m.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                    </span>
                    <span className="text-sm text-text-secondary truncate">
                      {m.venue || m.city || 'Sin lugar'}
                    </span>
                    <span className="ml-auto font-mono text-sm tabular text-text-primary">
                      {m.scoreA || '—'}
                      <span className="text-text-muted mx-2">·</span>
                      {m.scoreB || '—'}
                    </span>
                    <span className={`font-mono text-2xs uppercase tracking-widest font-semibold shrink-0 ${
                      m.winner === 'DRAW' ? 'text-warning' : 'text-brand'
                    }`}>
                      ▸ {winLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!data.detailVisible && data.total > 0 && (
          <p className="font-mono text-2xs uppercase tracking-widest text-text-muted text-center mt-6">
            Histórico privado · uno de los jugadores tiene su historial oculto
          </p>
        )}

        {data.total === 0 && (
          <p className="font-mono text-2xs uppercase tracking-widest text-text-muted text-center mt-6">
            Sin partidos registrados entre estos jugadores
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            Histórico en pelotitas
          </p>
          <Link href="/" className="btn-primary text-xs">
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlayerCol({ user, leads, side }: { user: UserBrief; leads: boolean; side: 'left' | 'right' }) {
  return (
    <div className={`p-5 sm:p-7 flex flex-col items-center text-center gap-3 ${leads ? 'bg-brand/5' : ''}`}>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={fullName(user)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-border-dark object-cover"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-light border-2 border-border-dark flex items-center justify-center font-display text-2xl font-bold text-text-secondary">
          {user.firstName[0]}{user.lastName[0]}
        </div>
      )}
      <div>
        <p className={`font-display font-semibold tracking-tight-2 text-lg sm:text-2xl leading-tight ${leads ? 'text-brand' : 'text-text-primary'}`}>
          {user.firstName}
        </p>
        <p className={`font-display font-medium tracking-tight-2 text-base sm:text-xl leading-tight ${leads ? 'text-brand/80' : 'text-text-secondary'}`}>
          {user.lastName}
        </p>
        {leads && (
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brand font-semibold mt-2">
            ▸ Lidera
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`stat-card ${accent ? 'border-brand/30' : ''}`}>
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${accent ? 'text-brand' : ''}`}>{value}</p>
    </div>
  );
}
