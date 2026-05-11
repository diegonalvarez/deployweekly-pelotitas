'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   LANDING C (v2) — Apple/Notion-style bento grid on cream paper.
   Soft pastel tiles, squircle corners (24px), one product mock
   per tile. Hero stays small. Type sizes capped — the visual
   richness comes from the tile collage, not from giant letters.
   ───────────────────────────────────────────────────────────── */

const PAPER  = '#F4EFE6';
const PAPER2 = '#EBE4D5';
const INK    = '#0A0E14';
const INK2   = '#3A3F47';
const DIM    = '#6B7280';
const FAINT  = '#9CA0A6';

const TILES = {
  lime:     { bg: '#E5F0BD', fg: '#1F2A0A', accent: '#7AA82B' },
  peach:    { bg: '#FFD9C2', fg: '#3D1B0A', accent: '#D9532C' },
  sky:      { bg: '#CDDFFA', fg: '#0A1F3D', accent: '#3F7CD4' },
  lavender: { bg: '#E3D5F5', fg: '#220A3D', accent: '#7B4ECC' },
  butter:   { bg: '#FCEFB8', fg: '#3D2D0A', accent: '#B8842B' },
  sage:     { bg: '#D2E8CC', fg: '#0A2A1A', accent: '#3F8453' },
  rose:     { bg: '#F5D2D8', fg: '#3D0A14', accent: '#C44A5E' },
  ink:      { bg: '#15171C', fg: '#F4EFE6', accent: '#D4FF3F' },
};

export default function LandingC() {
  return (
    <div className="min-h-screen relative overflow-x-clip" style={{ background: PAPER, color: INK }}>
      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Nav />
      <Hero />
      <Bento />
      <SecondSection />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

/* ─── NAV ────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md" style={{ background: 'rgba(244,239,230,0.78)', borderBottom: `1px solid ${PAPER2}` }}>
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/v3" className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          pelotitas<span style={{ color: '#D9532C' }}>.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[13px]" style={{ color: INK2 }}>
          <a href="#features" className="hover:opacity-100 opacity-80">Features</a>
          <a href="#pricing"  className="hover:opacity-100 opacity-80">Pricing</a>
          <Link href="/"   className="hover:opacity-100 opacity-80">A</Link>
          <Link href="/v2" className="hover:opacity-100 opacity-80">B</Link>
          <Link href="/v4" className="hover:opacity-100 opacity-80">D</Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="text-[13px] px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-colors" style={{ color: INK2 }}>
            Ingresar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-all"
            style={{ background: INK, color: PAPER }}
          >
            Empezar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 pt-16 sm:pt-24 pb-10 text-center">
        <a
          href="#features"
          className="inline-flex items-center gap-2 text-[12px] px-3 py-1 rounded-full transition-colors"
          style={{ background: PAPER2, color: INK2 }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D9532C' }} />
          Anotador, ELO y reservas — todo en una sola app
          <ArrowRight className="w-3 h-3" />
        </a>

        <h1 className="mt-6 text-[40px] sm:text-[56px] font-semibold tracking-[-0.025em] leading-[1.04]"
            style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          El padel y el tenis,<br />
          <span style={{ color: TILES.peach.accent }}>en su mejor versión</span>.
        </h1>

        <p className="mt-5 max-w-xl mx-auto text-[15px] leading-relaxed" style={{ color: INK2 }}>
          Anotás en vivo, reservás en 30 segundos, competís en torneos serios y tu ranking
          ELO se ajusta solo. Sin comisión. Sin formularios eternos.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2">
          <Link href="/register" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-full" style={{ background: INK, color: PAPER }}>
            Crear cuenta gratis <ArrowRight className="w-3 h-3" />
          </Link>
          <a href="#features" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-full hover:bg-black/[0.04] transition-colors" style={{ color: INK2, border: `1px solid ${PAPER2}` }}>
            Ver features <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── BENTO ──────────────────────────────────────────────────── */
function Bento() {
  return (
    <section id="features" className="relative">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-4 auto-rows-[180px] gap-3 sm:gap-4">

          {/* Big — Anotador (2x2) */}
          <Tile
            className="sm:col-span-2 sm:row-span-2"
            theme={TILES.lime}
            eyebrow="ANOTADOR EN VIVO"
            title="Anotás con un tap. Sin perder un game."
          >
            <MockScoreboard />
          </Tile>

          {/* Reservas (1x1) */}
          <Tile
            theme={TILES.peach}
            eyebrow="RESERVAS"
            title="Cancha en 30 segundos."
          >
            <MockSlots />
          </Tile>

          {/* ELO (1x1) */}
          <Tile
            theme={TILES.sky}
            eyebrow="RANKING ELO"
            title="Sube solo cada partido."
          >
            <MockEloMini />
          </Tile>

          {/* Match cards vertical (1x2) */}
          <Tile
            className="sm:col-span-1 sm:row-span-2"
            theme={TILES.lavender}
            eyebrow="MATCH CARDS"
            title="Compartibles que se ven caras."
          >
            <MockCard />
          </Tile>

          {/* Rivalidades horizontal (1x1) */}
          <Tile
            theme={TILES.butter}
            eyebrow="RIVALIDADES"
            title="Se arman solas."
          >
            <MockRivalry />
          </Tile>

          {/* Torneos (1x1) */}
          <Tile
            theme={TILES.sage}
            eyebrow="TORNEOS"
            title="Fixture, llaves y oficiales."
          >
            <MockBracket />
          </Tile>

          {/* Ink tile — Pro */}
          <Tile
            className="sm:col-span-2"
            theme={TILES.ink}
            eyebrow="PRO PLAYER"
            title="Stats avanzados, historial sin tope, URL propia."
            link="/billing"
          >
            <MockPro />
          </Tile>

          {/* Modo Cancha (1x1) */}
          <Tile
            theme={TILES.rose}
            eyebrow="MODO CANCHA"
            title="Pantalla full, tap zones grandes."
          >
            <MockCourtMode />
          </Tile>
        </div>
      </div>
    </section>
  );
}

/* ─── Tile wrapper ───────────────────────────────────────────── */
function Tile({
  children, theme, eyebrow, title, className = '', link,
}: {
  children?: React.ReactNode;
  theme: { bg: string; fg: string; accent: string };
  eyebrow: string;
  title: string;
  className?: string;
  link?: string;
}) {
  const inner = (
    <div
      className={`relative h-full rounded-[22px] p-4 sm:p-5 overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
      style={{ background: theme.bg, color: theme.fg }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-mono), monospace', color: theme.accent }}>
          {eyebrow}
        </p>
      </div>
      <h3
        className="text-[18px] sm:text-[20px] font-semibold leading-[1.15] tracking-[-0.015em]"
        style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}
      >
        {title}
      </h3>
      <div className="flex-1 min-h-0 mt-3">{children}</div>
    </div>
  );
  return link
    ? <Link href={link} className={className}>{inner}</Link>
    : <div className={className}>{inner}</div>;
}

/* ─── Tile mocks ─────────────────────────────────────────────── */
function MockScoreboard() {
  return (
    <div
      className="h-full rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid rgba(0,0,0,0.06)` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#5C6B26', fontFamily: 'var(--font-mono), monospace' }}>
          Set 2 / 3
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#7AA82B', fontFamily: 'var(--font-mono), monospace' }}>
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: '#7AA82B' }} />
            <span className="relative rounded-full w-1.5 h-1.5" style={{ background: '#7AA82B' }} />
          </span>
          LIVE
        </span>
      </div>

      <Row name="Diego / Juan"   sets={[6, 4]} pt="40" accent="#7AA82B" winning />
      <Row name="Lucas / Pablo"  sets={[3, 3]} pt="30" accent="#7AA82B" />

      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em]" style={{ color: '#5C6B26', fontFamily: 'var(--font-mono), monospace' }}>
        <span>Club Almagro · Cancha 3</span>
        <span>Tap para sumar</span>
      </div>
    </div>
  );
}
function Row({ name, sets, pt, accent, winning }: { name: string; sets: number[]; pt: string; accent: string; winning?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: winning ? accent : 'rgba(0,0,0,0.2)' }} />
      <p
        className="text-[14px] sm:text-[15px] font-semibold flex-1 truncate"
        style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}
      >
        {name}
      </p>
      {sets.map((s, i) => (
        <span key={i} className="w-5 text-center text-[14px] tabular" style={{ fontFamily: 'var(--font-mono), monospace', opacity: winning && i === sets.length - 1 ? 1 : 0.6 }}>
          {s}
        </span>
      ))}
      <span className="w-12 text-right text-[32px] sm:text-[36px] leading-none font-semibold tabular tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-mono), monospace', color: winning ? accent : 'rgba(0,0,0,0.45)' }}>
        {pt}
      </span>
    </div>
  );
}

function MockSlots() {
  const slots = ['08','09','10','11','12','13','14','15'];
  const taken = [0, 4, 7];
  const pick = 2;
  return (
    <div className="h-full rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid rgba(0,0,0,0.06)` }}>
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#A0451E', fontFamily: 'var(--font-mono), monospace' }}>
        Hoy · Cancha 3
      </p>
      <div className="grid grid-cols-4 gap-1">
        {slots.map((s, i) => {
          const isTaken = taken.includes(i);
          const isPick = i === pick;
          return (
            <div
              key={s}
              className="text-[11px] text-center py-1.5 rounded-md tabular font-semibold"
              style={{
                background: isPick   ? '#D9532C' : isTaken ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.7)',
                color:      isPick   ? PAPER     : isTaken ? 'rgba(0,0,0,0.35)' : '#3D1B0A',
                fontFamily: 'var(--font-mono), monospace',
                textDecoration: isTaken ? 'line-through' : 'none',
              }}
            >
              {s}:00
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MockEloMini() {
  const data = [1148, 1175, 1190, 1170, 1208, 1232, 1255, 1284];
  const min = Math.min(...data), max = Math.max(...data);
  const w = 100, h = 60;
  const norm = (v: number, i: number) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h * 0.9 - 2;
    return [x, y] as const;
  };
  const path = data.map((v, i) => {
    const [x, y] = norm(v, i);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <div className="h-full rounded-2xl p-3 flex flex-col" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid rgba(0,0,0,0.06)` }}>
      <div className="flex items-end justify-between mb-2">
        <span className="text-[28px] font-semibold tabular leading-none" style={{ fontFamily: 'var(--font-mono), monospace', color: '#0A1F3D' }}>
          1284
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: '#3F7CD4', color: PAPER, fontFamily: 'var(--font-mono), monospace' }}>
          +124
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full flex-1">
        <defs>
          <linearGradient id="elo-grd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3F7CD4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3F7CD4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#elo-grd)" />
        <path d={path} fill="none" stroke="#3F7CD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {(() => {
          const [x, y] = norm(data[data.length - 1], data.length - 1);
          return <circle cx={x} cy={y} r="2.2" fill="#3F7CD4" stroke={TILES.sky.bg} strokeWidth="0.8" />;
        })()}
      </svg>
    </div>
  );
}

function MockCard() {
  return (
    <div
      className="h-full rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid rgba(0,0,0,0.06)` }}
    >
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em]" style={{ color: '#5A2A8C', fontFamily: 'var(--font-mono), monospace' }}>
        <span>pelotitas.</span>
        <span>PADEL · OFICIAL</span>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(123,78,204,0.12)' }}>
          <p className="text-[16px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', color: '#5A2A8C' }}>Diego</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-[13px] font-medium leading-tight opacity-80" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>Juan</p>
            <div className="flex gap-1.5 items-end">
              {['6','3','6'].map((v) => (
                <span key={v} className="text-[22px] font-semibold tabular leading-none" style={{ fontFamily: 'var(--font-mono), monospace', color: '#5A2A8C' }}>{v}</span>
              ))}
            </div>
          </div>
          <p className="text-[8px] uppercase tracking-[0.22em] font-semibold mt-1.5" style={{ color: '#5A2A8C', fontFamily: 'var(--font-mono), monospace' }}>▸ GANADOR</p>
        </div>
        <div className="rounded-xl p-2.5">
          <p className="text-[16px] font-semibold leading-tight opacity-70" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>Lucas</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-[13px] font-medium leading-tight opacity-50" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>Pablo</p>
            <div className="flex gap-1.5 items-end">
              {['4','6','3'].map((v) => (
                <span key={v} className="text-[22px] font-semibold tabular leading-none opacity-50" style={{ fontFamily: 'var(--font-mono), monospace' }}>{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[9px] uppercase tracking-[0.22em] text-center" style={{ color: '#5A2A8C', fontFamily: 'var(--font-mono), monospace', opacity: 0.7 }}>
        anotalo en pelotitas
      </p>
    </div>
  );
}

function MockRivalry() {
  const seq = ['W','W','L','W','W','L','W','W'];
  return (
    <div className="h-full rounded-2xl p-3 flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid rgba(0,0,0,0.06)` }}>
      <p className="text-[10px] uppercase tracking-widest" style={{ color: '#876020', fontFamily: 'var(--font-mono), monospace' }}>
        Diego vs Lucas
      </p>
      <div className="flex items-end justify-between">
        <span className="text-[36px] font-semibold tabular leading-none" style={{ fontFamily: 'var(--font-mono), monospace', color: '#B8842B' }}>4</span>
        <span className="text-[20px] opacity-50" style={{ fontFamily: 'var(--font-mono), monospace' }}>—</span>
        <span className="text-[36px] font-semibold tabular leading-none opacity-50" style={{ fontFamily: 'var(--font-mono), monospace' }}>2</span>
      </div>
      <div className="flex items-center gap-1">
        {seq.map((r, i) => (
          <span key={i} className="w-3 h-3 rounded-sm" style={{ background: r === 'W' ? '#B8842B' : 'rgba(0,0,0,0.15)' }} />
        ))}
      </div>
    </div>
  );
}

function MockBracket() {
  return (
    <div className="h-full rounded-2xl p-3 flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid rgba(0,0,0,0.06)` }}>
      <p className="text-[10px] uppercase tracking-widest" style={{ color: '#1F5333', fontFamily: 'var(--font-mono), monospace' }}>
        Almagro Open · Semis
      </p>
      <div className="flex items-center gap-2 text-[11px] flex-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>
        <div className="flex-1 space-y-1">
          <div className="rounded px-2 py-1 font-semibold" style={{ background: '#3F8453', color: PAPER }}>Diego ✓</div>
          <div className="rounded px-2 py-1 opacity-60" style={{ background: 'rgba(0,0,0,0.06)' }}>Lucas</div>
          <div className="rounded px-2 py-1 font-semibold" style={{ background: '#3F8453', color: PAPER }}>Sofia ✓</div>
          <div className="rounded px-2 py-1 opacity-60" style={{ background: 'rgba(0,0,0,0.06)' }}>Pablo</div>
        </div>
        <div className="flex flex-col gap-2 text-[10px] items-center justify-around h-full" style={{ color: '#3F8453' }}>
          <span>→</span>
          <span>→</span>
        </div>
        <div className="flex-1 flex flex-col justify-around">
          <div className="rounded px-2 py-1 font-semibold" style={{ background: '#3F8453', color: PAPER }}>Diego ✓</div>
          <div className="rounded px-2 py-1 opacity-60" style={{ background: 'rgba(0,0,0,0.06)' }}>Sofia</div>
        </div>
      </div>
    </div>
  );
}

function MockPro() {
  return (
    <div className="h-full rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(212,255,63,0.18)` }}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {['Stats', 'URL propia', 'Sin watermark', 'Historial ∞'].map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,255,63,0.12)', color: '#D4FF3F', fontFamily: 'var(--font-mono), monospace' }}>
              {t}
            </span>
          ))}
        </div>
        <p className="text-[13px] opacity-80 leading-relaxed">
          Para los que entrenan y compiten en serio. Cancela cuando quieras.
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[44px] font-semibold tabular leading-none" style={{ color: '#D4FF3F', fontFamily: 'var(--font-mono), monospace' }}>4<span className="text-[18px] opacity-70">$</span></p>
        <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>/ mes</p>
      </div>
    </div>
  );
}

function MockCourtMode() {
  return (
    <div className="h-full rounded-2xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid rgba(0,0,0,0.06)` }}>
      <span className="text-[42px] sm:text-[52px] font-semibold tabular leading-none" style={{ fontFamily: 'var(--font-mono), monospace', color: '#9F2D3D' }}>
        40
      </span>
      <span className="text-[10px] uppercase tracking-widest mt-2 font-semibold" style={{ color: '#9F2D3D', fontFamily: 'var(--font-mono), monospace' }}>
        Tap zone activa
      </span>
      <div className="absolute inset-1 rounded-xl pointer-events-none" style={{ border: '2px dashed rgba(196,74,94,0.35)' }} />
    </div>
  );
}

/* ─── Second section — manifesto + stats ─────────────────────── */
function SecondSection() {
  return (
    <section className="relative">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: FAINT, fontFamily: 'var(--font-mono), monospace' }}>
            Manifiesto
          </p>
          <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] leading-[1.12]"
              style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            El padel y el tenis se merecen{' '}
            <span style={{ background: TILES.butter.bg, padding: '0 0.08em', borderRadius: 6 }}>software de verdad</span>{' '}
            — no un Excel con descuentos.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: INK2 }}>
            Lo que jugaste, queda. Datos en vivo, comunidad real, cero comisión. Construido por
            jugadores, no por inversores.
          </p>
          <ul className="mt-6 space-y-2 text-[13px]">
            {[
              'Anotador con audit log y modo cancha',
              'Reservas sin comisión',
              'ELO y rivalidades automáticas',
              'Match cards listas para Insta',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5" style={{ color: INK2 }}>
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TILES.sage.accent }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat n="0%"   l="Comisión"        theme={TILES.lime}    />
          <Stat n="30s"  l="Para empezar"     theme={TILES.sky}     />
          <Stat n="∞"    l="Partidos en Pro"  theme={TILES.lavender}/>
          <Stat n="24/7" l="Anotás cuando quieras" theme={TILES.peach}/>
        </div>
      </div>
    </section>
  );
}
function Stat({ n, l, theme }: { n: string; l: string; theme: { bg: string; fg: string; accent: string } }) {
  return (
    <div className="rounded-[18px] p-4 flex flex-col justify-between aspect-square" style={{ background: theme.bg, color: theme.fg }}>
      <span className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: theme.accent, fontFamily: 'var(--font-mono), monospace' }}>
        {l}
      </span>
      <span className="text-[44px] sm:text-[56px] font-semibold tabular leading-none tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-mono), monospace' }}>
        {n}
      </span>
    </div>
  );
}

/* ─── Pricing block ──────────────────────────────────────────── */
function Pricing() {
  return (
    <section id="pricing" className="relative">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: FAINT, fontFamily: 'var(--font-mono), monospace' }}>
            Pricing
          </p>
          <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            Dos planes. Uno es gratis.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          <PlanCard
            theme={TILES.peach}
            label="FREE"
            price="0"
            currency="$"
            cycle="/ mes"
            cta="Empezar"
            href="/register"
            features={['Anotador en vivo','Modo Cancha','Reservas gratis','Match cards (con marca)','50 partidos en historial','Ranking ELO público']}
          />
          <PlanCard
            theme={TILES.ink}
            label="PRO PLAYER"
            badge="popular"
            price="4"
            currency="$"
            cycle="/ mes"
            cta="Ir a Pro"
            href="/billing"
            features={['Todo del Free','Stats avanzados','Historial ilimitado','Match cards sin watermark','URL propia (pelotitas.app/p/vos)','Insignia Pro y soporte 24h']}
          />
        </div>
      </div>
    </section>
  );
}
function PlanCard({ theme, label, badge, price, currency, cycle, cta, href, features }: {
  theme: { bg: string; fg: string; accent: string };
  label: string; badge?: string; price: string; currency: string; cycle: string;
  cta: string; href: string; features: string[];
}) {
  return (
    <div className="rounded-[22px] p-6 relative" style={{ background: theme.bg, color: theme.fg }}>
      {badge && (
        <span className="absolute -top-2 right-5 text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full" style={{ background: TILES.butter.bg, color: TILES.butter.accent, fontFamily: 'var(--font-mono), monospace' }}>
          {badge}
        </span>
      )}
      <p className="text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: theme.accent, fontFamily: 'var(--font-mono), monospace' }}>
        {label}
      </p>
      <div className="flex items-end gap-1 mt-2">
        <span className="text-[64px] font-semibold tabular leading-none tracking-[-0.04em]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
          {currency}{price}
        </span>
        <span className="text-[12px] mb-2 opacity-70" style={{ fontFamily: 'var(--font-mono), monospace' }}>{cycle}</span>
      </div>
      <ul className="mt-5 space-y-1.5 text-[13px]">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 mt-1 shrink-0" style={{ color: theme.accent }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full transition-colors"
            style={{ background: theme.fg, color: theme.bg }}>
        {cta} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

/* ─── CTA ────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="relative">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 pb-16 sm:pb-20">
        <div className="rounded-[24px] px-6 sm:px-10 py-12 sm:py-16 text-center" style={{ background: TILES.ink.bg, color: TILES.ink.fg }}>
          <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: TILES.ink.accent, fontFamily: 'var(--font-mono), monospace' }}>
            Listo para empezar
          </p>
          <h2 className="mt-3 text-[30px] sm:text-[44px] font-semibold tracking-[-0.025em] leading-[1.08]"
              style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            Tu primer partido te toma{' '}
            <span style={{ color: TILES.ink.accent }}>30 segundos.</span>
          </h2>
          <p className="mt-4 text-[14px] opacity-80 max-w-md mx-auto">
            Cuenta gratis. Sin tarjeta. El anotador y el ranking ELO incluidos.
          </p>
          <div className="mt-7 flex items-center justify-center gap-2">
            <Link href="/register" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-full"
                  style={{ background: TILES.ink.fg, color: TILES.ink.bg }}>
              Crear cuenta gratis <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/clubs" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-full hover:bg-white/[0.06] transition-colors"
                  style={{ color: TILES.ink.fg, border: `1px solid rgba(244,239,230,0.18)` }}>
              Explorar complejos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative border-t" style={{ borderColor: PAPER2 }}>
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/v3" className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          pelotitas<span style={{ color: '#D9532C' }}>.</span>
        </Link>
        <p className="text-[11px]" style={{ color: FAINT, fontFamily: 'var(--font-mono), monospace' }}>
          © 2026 · Hecho en Argentina
        </p>
        <div className="flex items-center gap-3 text-[12px]" style={{ color: INK2 }}>
          <Link href="/terms"   className="hover:opacity-70">Términos</Link>
          <Link href="/privacy" className="hover:opacity-70">Privacidad</Link>
          <span style={{ color: FAINT }}>·</span>
          <Link href="/"   className="hover:opacity-70">A</Link>
          <Link href="/v2" className="hover:opacity-70">B</Link>
          <Link href="/v4" className="hover:opacity-70">D</Link>
        </div>
      </div>
    </footer>
  );
}
