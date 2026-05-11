'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Play, ChevronLeft, ChevronRight, Plus, Menu } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   LANDING E v2 — Flonea + Olga inspired.
   White outer page → deep-brown hero card with rounded notch
   corners → row of pastel product cards with notch shape →
   Olga-style image collage (blue + orange) → CTA / footer.
   The hero center column is a 9:16 VIDEO SLOT meant to host
   a real padel clip; everything else is real product content.
   ───────────────────────────────────────────────────────────── */

const PAGE   = '#FFFFFF';
const PAGE_2 = '#F4EFE6';
const INK    = '#1A1208';
const BROWN  = '#3B1F0F';
const BROWN2 = '#2A1408';
const CREAM  = '#F2EDDE';
const YELLOW = '#FFD23F';
const ORANGE = '#FF7A3D';
const LIME   = '#DCEC9D';
const RED    = '#E04A3C';
const PINK   = '#EFD2D2';
const BLUE   = '#2A6BB0';
const SKY    = '#A6D4F2';

export default function LandingE() {
  return (
    <div className="min-h-screen" style={{ background: PAGE, color: INK }}>
      <NavBar />
      <Hero />
      <SubheroRow />
      <OlgaSection />
      <ClosingCTA />
      <FooterBar />
    </div>
  );
}

/* ╭───────────── NAV ─────────────╮ */
function NavBar() {
  return (
    <header className="max-w-[1320px] mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
      <Link href="/v5" className="text-[22px] sm:text-[26px] font-bold tracking-[-0.025em]"
            style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', color: INK }}>
        PELOTITAS<span style={{ color: ORANGE }}>.</span>
      </Link>
      <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold uppercase tracking-[0.04em]"
           style={{ color: INK }}>
        <a href="#" className="hover:opacity-60 transition-opacity">Home</a>
        <a href="#anotador" className="hover:opacity-60 transition-opacity">Anotador</a>
        <a href="#reservas" className="hover:opacity-60 transition-opacity">Reservas</a>
        <a href="#facilities" className="hover:opacity-60 transition-opacity">Torneos</a>
        <a href="#footer" className="hover:opacity-60 transition-opacity">About</a>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/" className="hidden md:inline-flex text-[11px] uppercase tracking-[0.15em] font-medium opacity-50 hover:opacity-100" style={{ color: INK }}>A</Link>
        <Link href="/v2" className="hidden md:inline-flex text-[11px] uppercase tracking-[0.15em] font-medium opacity-50 hover:opacity-100" style={{ color: INK }}>B</Link>
        <Link href="/v3" className="hidden md:inline-flex text-[11px] uppercase tracking-[0.15em] font-medium opacity-50 hover:opacity-100" style={{ color: INK }}>C</Link>
        <Link href="/v4" className="hidden md:inline-flex text-[11px] uppercase tracking-[0.15em] font-medium opacity-50 hover:opacity-100" style={{ color: INK }}>D</Link>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] pl-5 pr-1.5 py-1.5 rounded-full transition-all hover:bg-black/[0.03]"
          style={{ color: INK, border: `1.5px solid ${ORANGE}` }}
        >
          CREAR CUENTA
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: ORANGE, color: INK }}>
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    </header>
  );
}

/* ╭───────────── HERO ─────────────╮ */
function Hero() {
  return (
    <section className="px-2 sm:px-4 pb-4">
      <div className="max-w-[1320px] mx-auto">
        <div
          className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden"
          style={{ background: BROWN, color: CREAM }}
        >
          {/* Top-right notch indent (where a CTA chip lives) */}
          <NotchCorner />

          {/* Hero inner grid */}
          <div className="relative grid lg:grid-cols-[1fr_1.2fr_1.4fr] gap-6 lg:gap-8 p-6 sm:p-8 lg:p-10 lg:pr-12">

            {/* LEFT — bouncing ball + tagline + carousel arrows */}
            <div className="relative flex flex-col gap-8 lg:gap-12 lg:py-6">
              <div className="flex flex-col items-center text-center max-w-[220px] mx-auto">
                <BounceArc />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] leading-snug">
                  EL MEJOR<br />ANOTADOR PARA<br />PADEL Y TENIS
                </p>
                <div className="mt-4 inline-flex items-center gap-1 rounded-full p-1" style={{ background: '#5C3320' }}>
                  <button className="w-7 h-7 rounded-full inline-flex items-center justify-center hover:opacity-80" style={{ background: ORANGE, color: INK }} aria-label="Anterior">
                    <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <button className="w-7 h-7 rounded-full inline-flex items-center justify-center hover:opacity-80" style={{ background: '#3B1F0F', color: CREAM }} aria-label="Siguiente">
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center text-center max-w-[220px] mx-auto mt-auto">
                <TrophyDoodle />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] leading-snug">
                  HERRAMIENTAS<br />HECHAS PARA<br />GANADORES
                </p>
              </div>
            </div>

            {/* CENTER — video slot (the user will drop a real padel clip here) */}
            <div className="relative">
              <VideoSlot />
            </div>

            {/* RIGHT — eyebrow + chunky headline + footer copy */}
            <div className="relative flex flex-col gap-6 lg:py-2">
              <span
                className="self-start inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] px-3.5 py-1.5 rounded-full"
                style={{ background: '#5C3320', color: CREAM }}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: ORANGE, color: INK }}>
                  <span className="block w-2 h-2 rounded-full" style={{ background: INK }} />
                </span>
                ANOTADOR EN VIVO
              </span>

              <h1
                className="font-bold uppercase tracking-[-0.04em] leading-[0.86]"
                style={{
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 'clamp(44px, 5.6vw, 84px)',
                  transform: 'scaleX(0.96)',
                  transformOrigin: 'left',
                }}
              >
                ANOTÁ EL{' '}
                <span style={{
                  background: YELLOW, color: INK,
                  display: 'inline-block', padding: '0 0.12em 0.06em',
                  borderRadius: '12px', verticalAlign: 'baseline',
                  fontSize: '0.7em', lineHeight: 1, marginLeft: '0.1em',
                }}>
                  🎾 LIVE
                </span>
                <br />
                MEJOR PARTIDO
                <br />
                DE <span style={{ color: YELLOW }}>TU SEMANA.</span>
              </h1>

              <div className="mt-2 flex items-start gap-6 sm:gap-8 flex-wrap pt-6" style={{ borderTop: `1px solid #5C3320` }}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full" style={{ background: ORANGE, color: INK }}>
                    <ArrowRight className="w-4 h-4" strokeWidth={3} />
                  </span>
                  <Link href="/register" className="text-[14px] font-bold uppercase tracking-[0.06em]" style={{ color: CREAM }}>
                    EMPEZAR GRATIS
                  </Link>
                </div>
                <p className="max-w-xs text-[11px] font-medium uppercase tracking-[0.08em] leading-relaxed opacity-75">
                  DESDE LA RESERVA DE CANCHA HASTA EL ÚLTIMO PUNTO DEL MATCH —
                  TODO QUEDA REGISTRADO EN PELOTITAS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Notch corner — the small CTA chip area on the top-right of the hero card */
function NotchCorner() {
  return (
    <div className="absolute top-0 right-0 z-10 hidden lg:flex">
      <div
        className="flex items-center pl-5 pr-1.5 py-1.5 gap-3"
        style={{
          background: PAGE,
          color: INK,
          borderBottomLeftRadius: '999px',
          borderTopRightRadius: '36px',
        }}
      >
        <span className="text-[12px] font-bold uppercase tracking-[0.12em]">CONTACTO</span>
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full" style={{ background: ORANGE, color: INK }}>
          <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
        </span>
      </div>
    </div>
  );
}

/* The big video slot — placeholder until the user pastes a real padel clip */
function VideoSlot() {
  return (
    <div
      className="relative h-full min-h-[420px] rounded-[24px] overflow-hidden flex items-end justify-center"
      style={{ background: 'linear-gradient(180deg, #6B3922 0%, #2A1408 100%)' }}
    >
      {/* Court silhouette / stadium illustration */}
      <svg viewBox="0 0 400 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="court-glow" cx="50%" cy="60%" r="55%">
            <stop offset="0%"  stopColor={YELLOW} stopOpacity="0.18" />
            <stop offset="100%" stopColor={BROWN2} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="600" fill="url(#court-glow)" />
        {/* Padel court */}
        <g stroke={CREAM} strokeWidth="1.5" fill="none" opacity="0.22">
          <rect x="80" y="200" width="240" height="280" rx="4" />
          <line x1="80" y1="340" x2="320" y2="340" />
          <line x1="200" y1="200" x2="200" y2="480" strokeDasharray="3 6" />
          <rect x="40" y="200" width="40" height="280" />
          <rect x="320" y="200" width="40" height="280" />
        </g>
        {/* Player silhouette */}
        <g opacity="0.85">
          <circle cx="200" cy="260" r="22" fill={CREAM} opacity="0.92" />
          <path d="M180 280 L220 280 L235 380 L210 460 L200 460 L195 380 L165 380 L180 280 Z" fill={CREAM} opacity="0.92" />
          <path d="M195 380 L165 380 L175 460 L185 460 L195 410 Z" fill={CREAM} opacity="0.92" />
          {/* Racket */}
          <ellipse cx="265" cy="240" rx="22" ry="28" fill="none" stroke={CREAM} strokeWidth="3" />
          <line x1="245" y1="252" x2="220" y2="278" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
          {/* Strings */}
          <g stroke={CREAM} strokeWidth="0.8" opacity="0.6">
            <line x1="248" y1="220" x2="282" y2="220" />
            <line x1="246" y1="232" x2="284" y2="232" />
            <line x1="246" y1="244" x2="284" y2="244" />
            <line x1="248" y1="256" x2="282" y2="256" />
            <line x1="258" y1="214" x2="258" y2="262" />
            <line x1="267" y1="212" x2="267" y2="264" />
            <line x1="276" y1="214" x2="276" y2="262" />
          </g>
        </g>
        {/* Tennis ball */}
        <circle cx="290" cy="200" r="14" fill={YELLOW} />
        <path d="M278 196 Q290 188 302 196 M278 204 Q290 212 302 204" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.65" />
      </svg>

      {/* Centered play button */}
      <button
        type="button"
        aria-label="Reproducir video"
        className="absolute inset-0 flex items-center justify-center group"
      >
        <span
          className="inline-flex items-center justify-center w-20 h-20 rounded-full transition-transform group-hover:scale-105"
          style={{ background: YELLOW, color: INK, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.5)' }}
        >
          <Play className="w-7 h-7 ml-1" fill={INK} strokeWidth={0} />
        </span>
      </button>

      {/* Corner chips */}
      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(26,18,8,0.65)', color: CREAM, backdropFilter: 'blur(8px)', fontFamily: 'var(--font-mono), monospace' }}>
        ● LIVE FEED
      </span>
      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(26,18,8,0.65)', color: YELLOW, backdropFilter: 'blur(8px)', fontFamily: 'var(--font-mono), monospace' }}>
        02:14
      </span>

      <span
        className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.12em] font-bold px-2 py-0.5 rounded"
        style={{ background: YELLOW, color: INK, fontFamily: 'var(--font-mono), monospace' }}
      >
        ← VIDEO SLOT · 9:16
      </span>
    </div>
  );
}

/* Decorative tennis-ball bouncing arc */
function BounceArc() {
  return (
    <svg viewBox="0 0 160 110" className="w-full max-w-[160px]">
      <defs>
        <radialGradient id="ball" cx="35%" cy="35%" r="65%">
          <stop offset="0%"  stopColor="#F5FA9A" />
          <stop offset="100%" stopColor="#A8C040" />
        </radialGradient>
      </defs>
      <path d="M10 95 Q 80 -10 150 95" stroke={CREAM} strokeWidth="1.4" strokeDasharray="3 4" fill="none" />
      <polygon points="6,90 14,90 10,100" fill={CREAM} />
      <polygon points="146,90 154,90 150,100" fill={CREAM} />
      <circle cx="80" cy="22" r="18" fill="url(#ball)" />
      <path d="M64 18 Q 80 10 96 18 M64 28 Q 80 36 96 28" fill="none" stroke="#3D5500" strokeWidth="1.4" opacity="0.5" />
    </svg>
  );
}

/* Decorative little trophy doodle */
function TrophyDoodle() {
  return (
    <svg viewBox="0 0 80 90" className="w-[70px]">
      <defs>
        <linearGradient id="trophy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#FFE08A" />
          <stop offset="100%" stopColor="#B07523" />
        </linearGradient>
      </defs>
      <path d="M25 8 L55 8 L55 32 Q55 48 40 50 Q25 48 25 32 Z" fill="url(#trophy)" />
      <path d="M25 14 L18 14 Q12 14 14 22 Q16 30 25 30" fill="none" stroke="#B07523" strokeWidth="3" />
      <path d="M55 14 L62 14 Q68 14 66 22 Q64 30 55 30" fill="none" stroke="#B07523" strokeWidth="3" />
      <rect x="34" y="50" width="12" height="10" fill="url(#trophy)" />
      <rect x="28" y="60" width="24" height="6" rx="1" fill="url(#trophy)" />
      <rect x="22" y="66" width="36" height="8" rx="1" fill="url(#trophy)" />
    </svg>
  );
}

/* ╭───────────── SUBHERO ROW — Flonea-style 3 product cards ─────────────╮ */
function SubheroRow() {
  return (
    <section className="px-2 sm:px-4 py-6 sm:py-10">
      <div className="max-w-[1320px] mx-auto grid lg:grid-cols-[1fr_3fr] gap-6 lg:gap-8 items-start">
        {/* Left text column */}
        <div className="lg:pl-4 lg:py-4">
          <h2
            className="font-bold uppercase tracking-[-0.025em] leading-[0.95]"
            style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 'clamp(28px, 3.4vw, 44px)' }}
          >
            ANOTADOR CON
            <br />
            ENERGÍA DE
            <br />
            MAIN CHARACTER.
          </h2>
          <p className="mt-5 text-[13px] leading-relaxed max-w-xs" style={{ color: '#4F3924' }}>
            Punto por punto. Audit log. Doubles, golden point, super tiebreak.
            Cada partido se vuelve datos que después te juegan a favor.
          </p>
          <AvatarRow />
          <Link href="/register" className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: INK, borderBottom: `2px solid ${INK}` }}>
            ANOTÁ TU PARTIDO
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Right — 3 product cards */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          <ProductCard
            theme={{ bg: LIME, ink: '#2E3B0A', accent: '#5C7A1E' }}
            eyebrow="ANOTADOR"
            title="ANOTÁ EN VIVO"
            stat="475+"
            statLabel="PUNTOS HOY"
            art="grass"
          />
          <ProductCard
            theme={{ bg: RED, ink: '#FFFFFF', accent: '#FFC4B5' }}
            eyebrow="JUGADOR"
            title="MATCH JOURNAL"
            stat="∞"
            statLabel="HISTORIAL"
            art="player"
          />
          <ProductCard
            theme={{ bg: PINK, ink: '#3D1F12', accent: '#7A4036' }}
            eyebrow="TORNEOS"
            title="TENNIS BATS"
            stat="6"
            statLabel="EVENTOS LIVE"
            art="racket"
          />
        </div>
      </div>
    </section>
  );
}

function AvatarRow() {
  const avs = [
    { color: '#FFD23F' },
    { color: '#2A6BB0' },
    { color: '#E04A3C' },
  ];
  return (
    <div className="mt-6 flex items-center gap-2">
      <div className="flex -space-x-2">
        {avs.map((a, i) => (
          <span
            key={i}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[11px] font-bold"
            style={{ background: a.color, color: INK, border: `2.5px solid ${PAGE}` }}
          >
            {['D','S','L'][i]}
          </span>
        ))}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: '#4F3924' }}>
        +8.3K JUGADORES
      </span>
    </div>
  );
}

function ProductCard({ theme, eyebrow, title, stat, statLabel, art }: {
  theme: { bg: string; ink: string; accent: string };
  eyebrow: string; title: string; stat: string; statLabel: string; art: 'grass' | 'player' | 'racket';
}) {
  return (
    <article
      className="relative rounded-[24px] p-5 sm:p-6 overflow-hidden min-h-[320px] flex flex-col"
      style={{ background: theme.bg, color: theme.ink }}
    >
      {/* notch arrow chip */}
      <span
        className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.6)', color: theme.ink }}
      >
        <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
      </span>

      {/* eyebrow icon row */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{ background: theme.accent, color: theme.bg }}>
          <Plus className="w-4 h-4" strokeWidth={2.8} />
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold">{eyebrow}</span>
      </div>

      <h3
        className="font-bold uppercase tracking-[-0.025em] leading-[0.95] mb-2"
        style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 28 }}
      >
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-[40px] sm:text-[44px] font-bold tabular leading-none tracking-[-0.04em]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
          {stat}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-70">{statLabel}</span>
      </div>

      {/* art block */}
      <div className="mt-auto pt-6 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6">
        <CardArt kind={art} theme={theme} />
      </div>
    </article>
  );
}

function CardArt({ kind, theme }: { kind: 'grass' | 'player' | 'racket'; theme: { bg: string; ink: string; accent: string } }) {
  if (kind === 'grass') {
    return (
      <svg viewBox="0 0 320 130" className="w-full h-32 sm:h-36">
        <rect width="320" height="130" fill={theme.bg} />
        {/* Grass blades */}
        <g fill={theme.accent} opacity="0.9">
          {Array.from({ length: 30 }).map((_, i) => (
            <path key={i} d={`M${i * 11 + 4} 130 L${i * 11 + 8} 100 L${i * 11 + 12} 130 Z`} />
          ))}
        </g>
        {/* Flag */}
        <line x1="60" y1="40" x2="60" y2="120" stroke={theme.accent} strokeWidth="3" />
        <polygon points="60,40 90,52 60,64" fill="#E04A3C" />
        {/* Tennis ball on tee */}
        <ellipse cx="220" cy="118" rx="14" ry="4" fill={INK} opacity="0.15" />
        <circle cx="220" cy="104" r="13" fill="#FFFFFF" stroke={theme.accent} strokeWidth="1" />
        <path d="M210 100 Q220 92 230 100 M210 108 Q220 116 230 108" fill="none" stroke={theme.accent} strokeWidth="1.2" />
        <rect x="216" y="115" width="8" height="10" fill={theme.accent} />
      </svg>
    );
  }
  if (kind === 'player') {
    return (
      <svg viewBox="0 0 320 160" className="w-full h-36 sm:h-40">
        <rect width="320" height="160" fill={theme.bg} />
        {/* Grid background */}
        <g stroke="#FFFFFF" strokeWidth="1" opacity="0.15">
          {[40, 80, 120, 160, 200, 240, 280].map(x => <line key={x} x1={x} y1="0" x2={x} y2="160" />)}
          {[40, 80, 120].map(y => <line key={y} x1="0" y1={y} x2="320" y2={y} />)}
        </g>
        {/* Player silhouette running with ball */}
        <g fill={theme.ink}>
          {/* head */}
          <circle cx="170" cy="32" r="14" />
          {/* helmet */}
          <path d="M156 30 Q170 18 184 30 L184 38 L156 38 Z" fill={INK} />
          {/* body */}
          <path d="M152 48 L188 48 L196 100 L182 145 L172 145 L170 105 L158 105 L154 145 L144 145 Z" />
          {/* arm holding ball */}
          <path d="M192 60 L220 70 L226 78 L210 76 L196 70 Z" />
          {/* ball (football-shape) */}
          <ellipse cx="232" cy="78" rx="14" ry="9" fill="#7A2A20" stroke={theme.ink} strokeWidth="1.5" />
          <line x1="225" y1="78" x2="239" y2="78" stroke={theme.ink} strokeWidth="1.2" />
        </g>
      </svg>
    );
  }
  // racket
  return (
    <svg viewBox="0 0 320 170" className="w-full h-36 sm:h-44">
      <rect width="320" height="170" fill={theme.bg} />
      {/* "SPORT" outline text behind racket */}
      <text x="160" y="110" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="800"
            fontSize="84" fill="none" stroke={theme.accent} strokeWidth="1.5" letterSpacing="-3">
        SPORT
      </text>
      {/* Racket */}
      <g transform="translate(40, 30) rotate(-22 130 60)">
        <ellipse cx="80" cy="50" rx="46" ry="56" fill="none" stroke={theme.ink} strokeWidth="3" />
        <g stroke={theme.ink} strokeWidth="1" opacity="0.6">
          {[44, 56, 68, 80, 92, 104, 116].map(x => <line key={x} x1={x} y1="0" x2={x} y2="100" />)}
          {[14, 26, 38, 50, 62, 74, 86].map(y => <line key={y} x1="38" y1={y} x2="122" y2={y} />)}
        </g>
        <line x1="80" y1="106" x2="80" y2="160" stroke={theme.ink} strokeWidth="5" strokeLinecap="round" />
        <rect x="74" y="156" width="12" height="22" rx="2" fill={theme.ink} />
      </g>
      {/* stickers */}
      <g fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="10">
        <rect x="10" y="100" width="76" height="20" rx="10" fill="#FFFFFF" />
        <text x="48" y="113" textAnchor="middle" fill={theme.ink} letterSpacing="1.5">COMFORT</text>
        <rect x="240" y="130" width="66" height="20" rx="10" fill="#FFFFFF" />
        <text x="273" y="143" textAnchor="middle" fill={theme.ink} letterSpacing="1.5">STRONG</text>
      </g>
    </svg>
  );
}

/* ╭───────────── OLGA SECTION — image collage + huge brand ─────────────╮ */
function OlgaSection() {
  return (
    <section id="reservas" className="px-2 sm:px-4 py-6 sm:py-10">
      <div className="max-w-[1320px] mx-auto rounded-[28px] sm:rounded-[36px] p-3 sm:p-4 lg:p-5"
           style={{ background: PAGE_2 }}>

        {/* Image strip */}
        <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_320px] gap-3 sm:gap-4">
          {/* Side rail */}
          <div className="hidden sm:flex flex-col items-center justify-between py-2 gap-3">
            <div className="flex flex-col gap-2.5">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full" style={{ background: BLUE, color: '#FFFFFF' }}>
                <Menu className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full" style={{ background: PAGE, color: INK }}>
                <span className="text-[14px] font-bold">📞</span>
              </span>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full" style={{ background: PAGE, color: INK }}>
                <span className="text-[14px] font-bold">?</span>
              </span>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full" style={{ background: ORANGE, color: INK }}>
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </div>
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-bold"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: INK }}
            >
              JUGÁ · ENTRENÁ · GANÁ · TODO EN PELOTITAS
            </p>
          </div>

          {/* Big image */}
          <div className="relative rounded-[20px] overflow-hidden" style={{ background: BLUE, aspectRatio: '4/3', minHeight: 360 }}>
            <BigImageMock />
            <span className="absolute top-4 left-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: '#FFFFFF' }}>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: BLUE, color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                ◎
              </span>
              <span>
                <span className="block">PELOTITAS</span>
                <span className="block opacity-80 tracking-[0.08em]">RESERVAS · 07:00 - 24:00</span>
              </span>
            </span>

            {/* Floating sport tags */}
            <div className="absolute top-1/3 right-6 hidden sm:flex flex-col gap-2 text-right">
              <span className="text-white font-bold uppercase text-[20px] tracking-tight opacity-90">// PADEL</span>
              <span className="text-white font-bold uppercase text-[20px] tracking-tight opacity-90">// TENIS</span>
            </div>

            {/* Bottom tags */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end gap-3 justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-white font-bold uppercase text-[14px] sm:text-[18px] tracking-tight">// MATCH FÁCIL</span>
                <span className="text-white font-bold uppercase text-[14px] sm:text-[18px] tracking-tight">// CUPOS ABIERTOS</span>
              </div>
              <span className="text-white font-bold uppercase text-[14px] sm:text-[18px] tracking-tight">// CANCHAS PRO //</span>
            </div>

            {/* Floating tennis ball overlap */}
            <div className="absolute -right-8 top-1/3 hidden sm:block" style={{ width: 130, height: 130 }}>
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill={YELLOW} stroke="#FFFFFF" strokeWidth="2" />
                <path d="M14 38 Q50 18 86 38 M14 62 Q50 82 86 62" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                <path d="M14 38 Q50 18 86 38 M14 62 Q50 82 86 62" fill="none" stroke="#A8C040" strokeWidth="1.2" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Right slim image */}
          <div className="relative rounded-[20px] overflow-hidden" style={{ background: BLUE, minHeight: 360 }}>
            <SideImageMock />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: ORANGE, color: INK }}>
                <span className="block text-[14px]">★</span>
              </span>
              {['👤','😎','🎾'].map((c, i) => (
                <span key={i} className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: '#FFFFFF', color: INK, border: '1.5px solid rgba(0,0,0,0.06)' }}>
                  <span className="text-[12px]">{c}</span>
                </span>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white font-bold uppercase text-[11px] tracking-[0.12em] leading-snug">
                SUMATE A MÁS DE<br />8.3K JUGADORES EN<br />NUESTRA COMUNIDAD
              </p>
              <Link href="/register" className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full" style={{ background: '#FFFFFF', color: INK }}>
                SUMARME →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom row — huge brand + booking + offer chip */}
        <div className="mt-4 grid sm:grid-cols-[auto_1fr_auto] gap-4 items-center px-2 sm:px-4 pb-4 pt-2">
          <h2
            className="font-bold uppercase leading-[0.85]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(56px, 9vw, 128px)',
              color: INK,
              letterSpacing: '-0.05em',
            }}
          >
            PELOTITAS
          </h2>
          <p className="text-[13px] font-bold uppercase tracking-[0.08em] max-w-xs" style={{ color: INK }}>
            PELOTITAS OFRECE INSTALACIONES PRO PARA TODOS LOS DEPORTES DE RAQUETA.
          </p>
          <Link href="/reservations" className="inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full" style={{ background: BLUE, color: '#FFFFFF' }}>
            <span className="text-[12px] font-bold uppercase tracking-[0.1em]">RESERVAR AHORA</span>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: INK, color: '#FFFFFF' }}>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </span>
          </Link>
        </div>

        <div className="px-2 sm:px-4 pb-4">
          <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: '#FFFFFF' }}>
            <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: BLUE }}>25% OFF →</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: YELLOW }} />
            <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: INK }}>OPEN BETA · PRIMER MES</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function BigImageMock() {
  // Sky blue background with player silhouette legs + orange sneakers running
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={SKY} />
          <stop offset="100%" stopColor={BLUE} />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#sky)" />
      {/* Clouds */}
      <g fill="#FFFFFF" opacity="0.75">
        <ellipse cx="160" cy="120" rx="60" ry="22" />
        <ellipse cx="220" cy="110" rx="50" ry="18" />
        <ellipse cx="600" cy="180" rx="70" ry="20" />
        <ellipse cx="660" cy="170" rx="50" ry="16" />
      </g>
      {/* Player legs (centered) */}
      <g>
        {/* shorts */}
        <path d="M340 220 L460 220 L470 360 L420 360 L410 280 L380 280 L370 360 L320 360 Z" fill="#FFFFFF" />
        {/* left leg */}
        <path d="M320 360 L370 360 L380 540 L335 540 Z" fill="#F2D4B5" />
        {/* right leg */}
        <path d="M420 360 L470 360 L455 540 L410 540 Z" fill="#F2D4B5" />
        {/* socks */}
        <rect x="335" y="525" width="45" height="35" fill="#FFFFFF" />
        <rect x="408" y="525" width="50" height="35" fill="#FFFFFF" />
        {/* sneakers — orange */}
        <path d="M325 555 L390 555 L395 580 L390 595 L320 595 Z" fill={ORANGE} />
        <path d="M400 555 L470 555 L475 595 L405 595 L398 580 Z" fill={ORANGE} />
        <path d="M325 575 L390 575" stroke="#FFFFFF" strokeWidth="3" />
        <path d="M400 575 L475 575" stroke="#FFFFFF" strokeWidth="3" />
        {/* arm holding racket */}
        <path d="M510 200 L560 240 L585 295 L595 315 L575 320 L555 290 L500 240 Z" fill="#F2D4B5" />
        <rect x="555" y="280" width="40" height="14" rx="4" fill="#FFFFFF" transform="rotate(34 575 287)" />
      </g>
      {/* Racket — top right */}
      <g transform="translate(560 70) rotate(28)">
        <ellipse cx="60" cy="80" rx="42" ry="56" fill="none" stroke="#FFFFFF" strokeWidth="6" />
        <g stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7">
          {[24, 36, 48, 60, 72, 84, 96].map(x => <line key={x} x1={x} y1="30" x2={x} y2="130" />)}
          {[36, 48, 60, 72, 84, 96, 108, 120].map(y => <line key={y} x1="18" y1={y} x2="102" y2={y} />)}
        </g>
        <line x1="60" y1="138" x2="60" y2="195" stroke={ORANGE} strokeWidth="10" strokeLinecap="round" />
        <rect x="54" y="188" width="12" height="22" rx="3" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function SideImageMock() {
  return (
    <svg viewBox="0 0 320 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="600" fill={BLUE} />
      {/* arm holding racket */}
      <g>
        <path d="M200 30 L270 100 L295 220 L260 230 L240 130 L180 80 Z" fill="#FFFFFF" />
        <g transform="translate(40 70) rotate(-12)">
          <ellipse cx="80" cy="80" rx="50" ry="62" fill="none" stroke={ORANGE} strokeWidth="6" />
          <g stroke={ORANGE} strokeWidth="1.2" opacity="0.7">
            {[36, 48, 60, 72, 84, 96, 108, 120].map(x => <line key={x} x1={x} y1="24" x2={x} y2="140" />)}
            {[36, 48, 60, 72, 84, 96, 108, 120].map(y => <line key={y} x1="34" y1={y} x2="126" y2={y} />)}
          </g>
          <line x1="80" y1="146" x2="80" y2="220" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
        </g>
      </g>
      {/* leg + orange sneaker at bottom */}
      <g>
        <path d="M70 360 L150 360 L165 520 L100 520 Z" fill="#FFFFFF" />
        <path d="M100 510 L165 510 L175 550 L95 550 Z" fill="#F2D4B5" />
        <rect x="98" y="540" width="80" height="18" fill="#FFFFFF" />
        <path d="M90 560 L185 560 L190 590 L85 590 Z" fill={ORANGE} />
        <line x1="90" y1="575" x2="190" y2="575" stroke="#FFFFFF" strokeWidth="3" />
      </g>
    </svg>
  );
}

/* ╭───────────── CLOSING CTA ─────────────╮ */
function ClosingCTA() {
  return (
    <section id="facilities" className="px-2 sm:px-4 pb-6 sm:pb-10">
      <div
        className="max-w-[1320px] mx-auto rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 lg:p-16 relative overflow-hidden"
        style={{ background: BROWN, color: CREAM }}
      >
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <h2
            className="font-bold uppercase tracking-[-0.04em] leading-[0.85]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(40px, 6.5vw, 96px)',
            }}
          >
            EL PRÓXIMO PARTIDO
            <br />
            YA EMPEZÓ
            <br />
            <span style={{ color: YELLOW }}>SIN VOS.</span>
          </h2>

          <div className="space-y-5">
            <p className="text-[14px] leading-relaxed opacity-80">
              Cuenta gratis, sin tarjeta. En 30 segundos estás anotando tu primer partido.
              Tu ranking ELO arranca solo desde el primer punto.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full" style={{ background: YELLOW, color: INK }}>
                <span className="text-[13px] font-bold uppercase tracking-[0.1em]">CREAR CUENTA</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: INK, color: YELLOW }}>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </Link>
              <Link href="/clubs" className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: CREAM, borderBottom: `2px solid ${CREAM}` }}>
                VER COMPLEJOS <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute -right-20 -bottom-20 hidden lg:block opacity-30" style={{ width: 360, height: 360 }}>
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill={YELLOW} />
            <path d="M14 38 Q50 18 86 38 M14 62 Q50 82 86 62" fill="none" stroke="#3D5500" strokeWidth="1.8" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ╭───────────── FOOTER ─────────────╮ */
function FooterBar() {
  return (
    <footer id="footer" className="px-5 sm:px-8 py-10 max-w-[1320px] mx-auto flex flex-wrap items-center justify-between gap-6">
      <Link href="/v5" className="text-[18px] font-bold tracking-[-0.025em]" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', color: INK }}>
        PELOTITAS<span style={{ color: ORANGE }}>.</span>
      </Link>
      <p className="text-[11px] uppercase tracking-[0.18em] font-bold opacity-60">
        © 2026 · HECHO EN ARGENTINA · OPEN BETA
      </p>
      <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] font-bold">
        <Link href="/terms"   className="opacity-60 hover:opacity-100">Términos</Link>
        <Link href="/privacy" className="opacity-60 hover:opacity-100">Privacidad</Link>
        <span className="opacity-30">·</span>
        <Link href="/"   className="opacity-60 hover:opacity-100">A</Link>
        <Link href="/v2" className="opacity-60 hover:opacity-100">B</Link>
        <Link href="/v3" className="opacity-60 hover:opacity-100">C</Link>
        <Link href="/v4" className="opacity-60 hover:opacity-100">D</Link>
      </div>
    </footer>
  );
}
