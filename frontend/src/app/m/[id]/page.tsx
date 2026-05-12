import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type PublicScoreboard = {
  id: string;
  isOfficial: boolean;
  sport: 'PADEL' | 'TENNIS';
  homeLabel: string;
  awayLabel: string;
  totalSets: number;
  superTieBreak: boolean;
  status: 'COMPLETED';
  homeSetGames: number[];
  awaySetGames: number[];
  winner: 'HOME' | 'AWAY' | null;
  finishedAt: string | null;
  createdAt: string;
  tournamentMatch: { tournament: { id: string; name: string } } | null;
};

async function getScoreboard(id: string): Promise<PublicScoreboard | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/scoreboards/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicScoreboard;
  } catch {
    return null;
  }
}

function splitDoubles(label: string): [string, string | null] {
  const parts = label.split(/\s*\/\s*/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return [parts[0].trim(), parts.slice(1).join(' / ').trim()];
  }
  return [label.trim(), null];
}

function formatScore(sb: PublicScoreboard) {
  return sb.homeSetGames
    .map((h, i) => `${h}-${sb.awaySetGames[i] ?? 0}`)
    .join(', ');
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sb = await getScoreboard(params.id);
  if (!sb) return { title: 'Partido — pelotitas' };

  const winLabel = sb.winner === 'HOME' ? sb.homeLabel : sb.awayLabel;
  const score = formatScore(sb);
  const title = `${winLabel} ganó · ${score}`;
  const desc = `${sb.homeLabel} vs ${sb.awayLabel} — ${sb.sport === 'PADEL' ? 'Padel' : 'Tenis'}${
    sb.tournamentMatch ? ` · ${sb.tournamentMatch.tournament.name}` : ''
  }`;

  return {
    title: `${title} — pelotitas`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      images: [{ url: `/m/${sb.id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [`/m/${sb.id}/opengraph-image`],
    },
  };
}

export default async function MatchPublicPage({ params }: { params: { id: string } }) {
  const sb = await getScoreboard(params.id);
  if (!sb) notFound();

  const [homeA, homeB] = splitDoubles(sb.homeLabel);
  const [awayA, awayB] = splitDoubles(sb.awayLabel);
  const homeWin = sb.winner === 'HOME';
  const awayWin = sb.winner === 'AWAY';
  const sportLabel = sb.sport === 'PADEL' ? 'Padel' : 'Tenis';
  const finishedAt = sb.finishedAt ? new Date(sb.finishedAt) : new Date(sb.createdAt);

  return (
    <div className="min-h-screen bg-base bg-court-lines">
      <div className="max-w-3xl mx-auto px-5 py-10 sm:py-16">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="font-display font-bold text-lg tracking-tight-2 text-text-primary">
            pelotitas<span className="text-brand">.</span>
          </Link>
          <span className="text-text-muted/40">·</span>
          <span className="font-mono text-2xs uppercase text-text-muted tracking-[0.2em]">
            Partido finalizado
          </span>
          {sb.isOfficial && (
            <span className="font-mono text-2xs uppercase text-warning tracking-widest">· Oficial</span>
          )}
        </div>

        {/* Match card */}
        <article className="card-elevated p-0 overflow-hidden">
          <header className={`p-5 sm:p-7 ${sb.sport === 'PADEL' ? 'bg-padel-glass' : 'bg-clay'} relative`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={sb.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                {sportLabel}
              </span>
              {sb.tournamentMatch && (
                <Link
                  href={`/tournaments/${sb.tournamentMatch.tournament.id}`}
                  className="font-mono text-2xs uppercase tracking-widest text-text-secondary hover:text-text-primary"
                >
                  {sb.tournamentMatch.tournament.name}
                </Link>
              )}
              <span className="font-mono text-2xs uppercase tracking-widest text-text-muted ml-auto">
                {finishedAt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </header>

          <div className="divide-y divide-border-dark">
            <SideBlock
              a={homeA}
              b={homeB}
              setGames={sb.homeSetGames}
              isWinner={homeWin}
              accent={sb.sport === 'PADEL' ? 'sky' : 'clay'}
            />
            <SideBlock
              a={awayA}
              b={awayB}
              setGames={sb.awaySetGames}
              isWinner={awayWin}
              accent={sb.sport === 'PADEL' ? 'sky' : 'clay'}
            />
          </div>
        </article>

        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            Marcador en pelotitas
          </p>
          <Link href="/" className="btn-primary text-xs">
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </div>
  );
}

function SideBlock({
  a,
  b,
  setGames,
  isWinner,
  accent,
}: {
  a: string;
  b: string | null;
  setGames: number[];
  isWinner: boolean;
  accent: 'sky' | 'clay';
}) {
  const accentColor = accent === 'sky' ? '#6BA9FF' : '#FF5C2B';
  return (
    <div className={`p-5 sm:p-8 flex items-center justify-between gap-5 ${isWinner ? 'bg-brand/5' : ''}`}>
      <div className="min-w-0 flex-1">
        <p
          className="font-display font-semibold tracking-tight-2 text-2xl sm:text-4xl leading-tight truncate"
          style={{ color: isWinner ? '#D4FF3F' : '#F4F6FB' }}
        >
          {a}
        </p>
        {b && (
          <p
            className="font-display font-medium tracking-tight-2 text-xl sm:text-3xl leading-tight truncate"
            style={{ color: isWinner ? 'rgba(212,255,63,0.85)' : '#94A0B5' }}
          >
            {b}
          </p>
        )}
        {isWinner && (
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brand mt-2 font-semibold">
            ▸ Ganador
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {setGames.map((g, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
              S{i + 1}
            </span>
            <span
              className="score-digit text-3xl sm:text-5xl"
              style={{ color: isWinner ? accentColor : '#5A6478' }}
            >
              {g}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
