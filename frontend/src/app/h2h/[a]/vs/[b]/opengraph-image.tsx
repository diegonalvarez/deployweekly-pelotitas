import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pelotitas — head to head';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type H2H = {
  userA: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  userB: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  total: number;
  winsA: number;
  winsB: number;
  draws: number;
};

export default async function Image({ params }: { params: { a: string; b: string } }) {
  let data: H2H | null = null;
  try {
    const res = await fetch(`${API_URL}/api/public/h2h/${params.a}/vs/${params.b}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) data = (await res.json()) as H2H;
  } catch {
    /* fall through */
  }

  if (!data) {
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
          pelotitas — head to head
        </div>
      ),
      { ...size },
    );
  }

  const aLeads = data.winsA > data.winsB;
  const bLeads = data.winsB > data.winsA;

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
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 40,
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
            Head to Head
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 40,
          }}
        >
          {/* User A */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              padding: 24,
              borderRadius: 22,
              background: aLeads ? 'rgba(212,255,63,0.06)' : 'transparent',
              border: aLeads ? '1px solid rgba(212,255,63,0.25)' : '1px solid #1E2532',
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: aLeads ? '#D4FF3F' : '#F4F6FB',
                textAlign: 'center',
                lineHeight: 1.05,
              }}
            >
              {data.userA.firstName}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: aLeads ? 'rgba(212,255,63,0.8)' : '#94A0B5',
                textAlign: 'center',
                lineHeight: 1,
              }}
            >
              {data.userA.lastName}
            </div>
          </div>

          {/* Score */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0 20px',
            }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: '0.3em',
                color: '#5A6478',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              total
            </div>
            <div
              style={{
                fontSize: 200,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.85,
                color: '#F4F6FB',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ color: aLeads ? '#D4FF3F' : '#F4F6FB' }}>{data.winsA}</span>
              <span style={{ color: '#5A6478', margin: '0 18px' }}>-</span>
              <span style={{ color: bLeads ? '#D4FF3F' : '#F4F6FB' }}>{data.winsB}</span>
            </div>
            <div
              style={{
                fontSize: 22,
                letterSpacing: '0.25em',
                color: '#94A0B5',
                textTransform: 'uppercase',
                marginTop: 14,
              }}
            >
              {data.total} {data.total === 1 ? 'partido' : 'partidos'}
            </div>
          </div>

          {/* User B */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              padding: 24,
              borderRadius: 22,
              background: bLeads ? 'rgba(212,255,63,0.06)' : 'transparent',
              border: bLeads ? '1px solid rgba(212,255,63,0.25)' : '1px solid #1E2532',
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: bLeads ? '#D4FF3F' : '#F4F6FB',
                textAlign: 'center',
                lineHeight: 1.05,
              }}
            >
              {data.userB.firstName}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: bLeads ? 'rgba(212,255,63,0.8)' : '#94A0B5',
                textAlign: 'center',
                lineHeight: 1,
              }}
            >
              {data.userB.lastName}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 24,
            fontSize: 16,
            letterSpacing: '0.3em',
            color: '#5A6478',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          h2h en pelotitas
        </div>
      </div>
    ),
    { ...size },
  );
}
