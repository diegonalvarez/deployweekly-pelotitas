'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Play, ChevronLeft, ChevronRight, Plus, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth';

/* Real photos via Unsplash — fall back to a colored block on error.
   Each url includes auto-format/quality/sizing params. */
const PHOTO = {
  heroBg:        'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&w=1200&q=80', // padel/tennis court
  cardGrass:     'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',     // tennis ball on grass
  cardPlayer:    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80',  // athlete running
  cardRacket:    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80',  // racket / padel
  olgaBig:       'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1400&q=85', // orange sneakers court
  olgaSide:      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=85',     // tennis arm racket
};

function Photo({
  src, alt, fallback, className = '', style,
}: {
  src: string; alt: string; fallback: string; className?: string; style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ background: fallback, ...style }}
      loading="lazy"
      onError={(e) => {
        // hide the broken image, keep the fallback color
        (e.currentTarget as HTMLImageElement).style.opacity = '0';
      }}
    />
  );
}

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
      <CTASlides />
      <ClosingCTA />
      <FooterBar />
    </div>
  );
}

/* ╭───────────── NAV ─────────────╮ */
function NavBar() {
  return (
    <header className="max-w-[1320px] mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
      <Link href="/" className="text-[22px] sm:text-[26px] font-bold tracking-[-0.025em]"
            style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', color: INK }}>
        PELOTITAS<span style={{ color: ORANGE }}>.</span>
      </Link>
      <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold uppercase tracking-[0.04em]"
           style={{ color: INK }}>
        <Link href="/" className="hover:opacity-60 transition-opacity">Inicio</Link>
        <Link href="/scoreboards" className="hover:opacity-60 transition-opacity">Anotador</Link>
        <Link href="/reservations" className="hover:opacity-60 transition-opacity">Reservas</Link>
        <Link href="/tournaments" className="hover:opacity-60 transition-opacity">Torneos</Link>
        <Link href="/ranking" className="hover:opacity-60 transition-opacity">Ranking</Link>
      </nav>
      <NavRightActions />
    </header>
  );
}

function NavRightActions() {
  const { user, loading } = useAuth();
  if (loading) {
    // Hold space so navbar doesn't jump on hydration.
    return <div style={{ width: 160, height: 44 }} />;
  }

  if (user) {
    const isAdmin = user.roles?.includes('ADMIN');
    const isClubOwner = user.roles?.includes('CLUB_OWNER');
    const dashboardHref = isAdmin || isClubOwner ? '/dashboard/club' : '/dashboard/player';
    return (
      <div className="flex items-center gap-3">
        <span
          className="hidden sm:inline text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{ color: INK, opacity: 0.7 }}
        >
          Hola, {user.firstName}
        </span>
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] pl-5 pr-1.5 py-1.5 rounded-full transition-all hover:bg-black/[0.03]"
          style={{ color: INK, border: `1.5px solid ${ORANGE}` }}
        >
          MI PANEL
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: ORANGE, color: INK }}
          >
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Link
        href="/login"
        className="hidden sm:inline text-[12px] font-bold uppercase tracking-[0.1em] transition-opacity hover:opacity-60"
        style={{ color: INK }}
      >
        Iniciar sesión
      </Link>
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
      <Photo
        src={PHOTO.heroBg}
        alt="Cancha de padel"
        fallback="#3B1F0F"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.62) saturate(1.05)' }}
      />
      {/* Vignette over photo to keep CTA legible */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(59,31,15,0.0) 30%, rgba(26,18,8,0.85) 100%)' }}
      />

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
        ● EN VIVO
      </span>
      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(26,18,8,0.65)', color: YELLOW, backdropFilter: 'blur(8px)', fontFamily: 'var(--font-mono), monospace' }}>
        02:14
      </span>

      <span
        className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.12em] font-bold px-2 py-0.5 rounded"
        style={{ background: YELLOW, color: INK, fontFamily: 'var(--font-mono), monospace' }}
      >
        ← VIDEO AQUÍ · 9:16
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
            title="MI HISTORIAL"
            stat="∞"
            statLabel="HISTORIAL"
            art="player"
          />
          <ProductCard
            theme={{ bg: PINK, ink: '#3D1F12', accent: '#7A4036' }}
            eyebrow="TORNEOS"
            title="RAQUETAS"
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
  const src = kind === 'grass' ? PHOTO.cardGrass : kind === 'player' ? PHOTO.cardPlayer : PHOTO.cardRacket;
  const alt = kind === 'grass' ? 'Tennis ball' : kind === 'player' ? 'Athlete running' : 'Racket close-up';

  return (
    <div className="relative h-36 sm:h-44 overflow-hidden">
      <Photo
        src={src}
        alt={alt}
        fallback={theme.bg}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ mixBlendMode: kind === 'racket' ? 'multiply' : 'normal' }}
      />
      {/* tint */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `${theme.bg}55`, mixBlendMode: 'multiply' }}
      />
      {/* outline text for racket */}
      {kind === 'racket' && (
        <span
          aria-hidden
          className="absolute left-2 bottom-1 font-bold uppercase pointer-events-none"
          style={{
            fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
            fontSize: 64,
            letterSpacing: '-0.06em',
            color: 'transparent',
            WebkitTextStroke: `1.2px ${theme.ink}`,
            opacity: 0.6,
            lineHeight: 0.9,
          }}
        >
          SPORT
        </span>
      )}
      {/* stickers for racket */}
      {kind === 'racket' && (
        <>
          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                style={{ background: '#FFFFFF', color: theme.ink }}>
            CÓMODA
          </span>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                style={{ background: '#FFFFFF', color: theme.ink }}>
            FUERTE
          </span>
        </>
      )}
    </div>
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
  return (
    <>
      <Photo
        src={PHOTO.olgaBig}
        alt="Jugador con zapatillas naranjas en cancha"
        fallback={BLUE}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* slight blue tint to keep continuity with the section accent */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, rgba(42,107,176,0.15) 0%, rgba(42,107,176,0.35) 100%)` }}
      />
    </>
  );
}

function SideImageMock() {
  return (
    <>
      <Photo
        src={PHOTO.olgaSide}
        alt="Jugador con raqueta"
        fallback={BLUE}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, rgba(42,107,176,0.2) 0%, rgba(42,107,176,0.5) 100%)` }}
      />
    </>
  );
}

/* ╭───────────── CTA SLIDES — 3 horizontal cards with bg media ─────────────╮ */
/* Background imagery: Unsplash + Pexels CC0 (free to use, no attribution
   required). Each slide gets a still photo by default; a short video URL
   (Pexels MP4) can be pasted in CTA_SLIDES below and the component will
   prefer it. Search Pexels: https://www.pexels.com/search/videos/padel/ */

const CTA_SLIDES = [
  {
    eyebrow: '01 · CLUBES',
    title: 'REGISTRÁ\nTU COMPLEJO.',
    body: 'Publicá tus canchas, recibí reservas online sin comisión y manejá tu agenda en una sola app.',
    cta: 'Registrar complejo',
    href: '/register?role=CLUB_OWNER',
    photo: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=85',
    video: '', // e.g. 'https://videos.pexels.com/video-files/XXXXX/XXXXX-hd_1920_1080_30fps.mp4'
    tint: 'rgba(59,31,15,0.55)',
    badge: 'PARA DUEÑOS',
  },
  {
    eyebrow: '02 · JUGADORES',
    title: 'ANOTATE A UN\nTORNEO HOY.',
    body: 'Filtrá por nivel, ciudad y deporte. Inscripción en 30 segundos, fixture y resultados en vivo.',
    cta: 'Ver torneos abiertos',
    href: '/tournaments',
    photo: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1400&q=85',
    video: '',
    tint: 'rgba(42,107,176,0.55)',
    badge: 'COMPETÍ',
  },
  {
    eyebrow: '03 · ORGANIZADORES',
    title: 'CREÁ EL\nTORNEO DEL AÑO.',
    body: 'Grupos, llaves, anotador oficial, reglas custom y match cards listas para Instagram.',
    cta: 'Crear torneo',
    href: '/tournaments/create',
    photo: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1400&q=85',
    video: '',
    tint: 'rgba(26,18,8,0.55)',
    badge: 'PRODUCÍ',
  },
];

function CTASlides() {
  return (
    <section className="px-2 sm:px-4 pb-6 sm:pb-10">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 px-4 sm:px-6 mb-5">
          <h2
            className="font-bold uppercase tracking-[-0.03em] leading-[0.92]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              color: INK,
            }}
          >
            ELEGÍ <span style={{ color: ORANGE }}>TU JUGADA</span>.
          </h2>
          <p className="text-[13px] font-bold uppercase tracking-[0.1em] max-w-xs" style={{ color: '#4F3924' }}>
            Tres caminos, una sola plataforma. Cero comisión, cero formularios eternos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {CTA_SLIDES.map((s, i) => <SlideCard key={i} {...s} />)}
        </div>

        <p className="px-4 sm:px-6 mt-4 text-[10px] uppercase tracking-[0.18em] font-bold opacity-50" style={{ color: INK, fontFamily: 'var(--font-mono), monospace' }}>
          Imágenes: Unsplash + Pexels · CC0
        </p>
      </div>
    </section>
  );
}

function SlideCard({
  eyebrow, title, body, cta, href, photo, video, tint, badge,
}: typeof CTA_SLIDES[number]) {
  return (
    <article
      className="relative rounded-[28px] overflow-hidden group"
      style={{ minHeight: 480, background: BROWN }}
    >
      {/* Background media — video preferred, photo fallback */}
      {video ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={photo}
        />
      ) : (
        <img
          src={photo}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
        />
      )}

      {/* Tint overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${tint} 0%, rgba(26,18,8,0.85) 100%)` }}
      />

      {/* Top badge */}
      <span
        className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 rounded-full backdrop-blur-md"
        style={{ background: 'rgba(244,239,230,0.85)', color: INK, fontFamily: 'var(--font-mono), monospace' }}
      >
        ● {badge}
      </span>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 sm:p-7 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: '#FFD23F', fontFamily: 'var(--font-mono), monospace' }}>
          {eyebrow}
        </p>
        <h3
          className="font-bold uppercase tracking-[-0.035em] leading-[0.88] whitespace-pre-line"
          style={{
            fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 3.6vw, 44px)',
            color: '#F2EDDE',
          }}
        >
          {title}
        </h3>
        <p className="mt-3 text-[13px] leading-relaxed max-w-xs" style={{ color: 'rgba(242,237,222,0.88)' }}>
          {body}
        </p>

        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full self-start transition-transform group-hover:translate-x-0.5"
          style={{ background: '#F2EDDE', color: INK }}
        >
          <span className="text-[12px] font-bold uppercase tracking-[0.1em]">{cta}</span>
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: ORANGE, color: INK }}>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </span>
        </Link>
      </div>
    </article>
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
              <Link href="/c" className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: CREAM, borderBottom: `2px solid ${CREAM}` }}>
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
      <Link href="/" className="text-[18px] font-bold tracking-[-0.025em]" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', color: INK }}>
        PELOTITAS<span style={{ color: ORANGE }}>.</span>
      </Link>
      <p className="text-[11px] uppercase tracking-[0.18em] font-bold opacity-60">
        © 2026 · HECHO EN ARGENTINA · OPEN BETA
      </p>
      <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] font-bold">
        <Link href="/terms"   className="opacity-60 hover:opacity-100">Términos</Link>
        <Link href="/privacy" className="opacity-60 hover:opacity-100">Privacidad</Link>
        <span className="opacity-30">·</span>
      </div>
    </footer>
  );
}
