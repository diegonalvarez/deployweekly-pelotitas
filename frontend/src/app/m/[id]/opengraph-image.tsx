import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pelotitas — match card';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type PublicScoreboard = {
  id: string;
  isOfficial: boolean;
  sport: 'PADEL' | 'TENNIS';
  homeLabel: string;
  awayLabel: string;
  homeSetGames: number[];
  awaySetGames: number[];
  winner: 'HOME' | 'AWAY' | null;
  finishedAt: string | null;
  createdAt: string;
  tournamentMatch: { tournament: { id: string; name: string } } | null;
};

function splitDoubles(label: string): [string, string | null] {
  const parts = label.split(/\s*\/\s*/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return [parts[0].trim(), parts.slice(1).join(' / ').trim()];
  }
  return [label.trim(), null];
}

export default async function Image({ params }: { params: { id: string } }) {
  let sb: PublicScoreboard | null = null;
  try {
    const res = await fetch(`${API_URL}/api/public/scoreboards/${params.id}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) sb = (await res.json()) as PublicScoreboard;
  } catch {
    /* fall through */
  }

  if (!sb) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#0A0E14',
            color: '#F4F6FB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
          }}
        >
          pelotitas
        </div>
      ),
      { ...size },
    );
  }

  const [homeA, homeB] = splitDoubles(sb.homeLabel);
  const [awayA, awayB] = splitDoubles(sb.awayLabel);
  const homeWin = sb.winner === 'HOME';
  const awayWin = sb.winner === 'AWAY';
  const sportLabel = sb.sport === 'PADEL' ? 'PADEL' : 'TENIS';
  const accentColor = sb.sport === 'PADEL' ? '#6BA9FF' : '#FF5C2B';
  const finishedAt = sb.finishedAt ? new Date(sb.finishedAt) : new Date(sb.createdAt);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0E14',
          color: '#F4F6FB',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 70px',
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#F4F6FB',
            }}
          >
            pelotitas
            <span style={{ color: '#D4FF3F' }}>.</span>
          </div>
          <div style={{ width: 1, height: 28, background: '#2A3142' }} />
          <div
            style={{
              fontSize: 18,
              letterSpacing: '0.25em',
              color: '#94A0B5',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {sportLabel}
            {sb.isOfficial && '  ·  OFICIAL'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: '0.18em',
                color: '#5A6478',
                textTransform: 'uppercase',
              }}
            >
              {finishedAt.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Two giant rows */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            justifyContent: 'center',
          }}
        >
          <Row
            a={homeA}
            b={homeB}
            setGames={sb.homeSetGames}
            isWinner={homeWin}
            accent={accentColor}
          />
          <div style={{ height: 1, background: '#1E2532', display: 'flex' }} />
          <Row
            a={awayA}
            b={awayB}
            setGames={sb.awaySetGames}
            isWinner={awayWin}
            accent={accentColor}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 24,
          }}
        >
          {sb.tournamentMatch ? (
            <div
              style={{
                fontSize: 18,
                color: '#94A0B5',
                letterSpacing: '0.05em',
              }}
            >
              {sb.tournamentMatch.tournament.name}
            </div>
          ) : (
            <div />
          )}
          <div
            style={{
              fontSize: 16,
              letterSpacing: '0.3em',
              color: '#5A6478',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            anotalo en pelotitas
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Row({
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
  accent: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 24px',
        borderRadius: 18,
        background: isWinner ? 'rgba(212,255,63,0.06)' : 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxWidth: 600,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: isWinner ? '#D4FF3F' : '#F4F6FB',
            lineHeight: 1.05,
          }}
        >
          {a}
        </div>
        {b && (
          <div
            style={{
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: isWinner ? 'rgba(212,255,63,0.85)' : '#94A0B5',
              lineHeight: 1.05,
            }}
          >
            {b}
          </div>
        )}
        {isWinner && (
          <div
            style={{
              fontSize: 18,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#D4FF3F',
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            ▸ GANADOR
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
        {setGames.map((g, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 16,
                letterSpacing: '0.25em',
                color: '#5A6478',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              S{i + 1}
            </div>
            <div
              style={{
                fontSize: 110,
                fontWeight: 700,
                letterSpacing: '-0.05em',
                color: isWinner ? accent : '#5A6478',
                lineHeight: 0.85,
                fontFamily: 'monospace',
              }}
            >
              {g}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
