'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   LANDING C — Brutalist light variant.
   Hard opposite of /v2: cream paper background, jet-black ink,
   chunky 2-3px borders, no gradients, no glow, no glass.
   Mono is treated as a real typeface (not just for numbers).
   Stickers and tape-style accents in clay + sticker-yellow.
   Built around the idea that a sports tool is a notebook, not
   a SaaS dashboard.
   ───────────────────────────────────────────────────────────── */

const PAPER  = '#F4EFE6'; // warm cream
const INK    = '#0A0E14';
const CLAY   = '#FF5C2B';
const YELLOW = '#FFD23F';
const SKY    = '#6BA9FF';
const LIME   = '#C8F23F';

export default function LandingC() {
  return (
    <div
      className="min-h-screen relative overflow-x-clip"
      style={{ background: PAPER, color: INK, fontFamily: 'var(--font-mono), JetBrains Mono, ui-monospace, monospace' }}
    >
      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.65 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <TopRule />
      <Header />
      <Hero />
      <FactSlabs />
      <Numbered />
      <ScribbleBlock />
      <PriceBlock />
      <ClosingMarquee />
      <Footer />
    </div>
  );
}

/* ─── Top thin marquee — small mono ticker ───────────────────── */
function TopRule() {
  const items = [
    'EST. 2026', 'PADEL × TENIS', 'BUENOS AIRES', 'ANOTÁ SIN INSTALAR',
    '0% COMISIÓN', 'MODO CANCHA', 'OPEN BETA', 'ARGENTINA · URUGUAY · CHILE',
    'RANKING ELO REAL', 'COMUNIDAD',
  ];
  return (
    <div className="relative border-b-2 overflow-hidden" style={{ borderColor: INK, background: INK, color: PAPER }}>
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="mx-6 text-[11px] font-bold tracking-[0.2em]">
            {t} <span style={{ color: YELLOW }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Header — flat bar, no glass ────────────────────────────── */
function Header() {
  return (
    <header className="relative z-30 border-b-2" style={{ borderColor: INK }}>
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
        <Link href="/v3" className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          pelotitas<span style={{ color: CLAY }}>.</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-xs font-bold uppercase tracking-[0.18em]">
          <Link href="/" className="hidden md:inline-flex px-3 py-2 hover:bg-black/5 transition-colors">A</Link>
          <Link href="/v2" className="hidden md:inline-flex px-3 py-2 hover:bg-black/5 transition-colors">B</Link>
          <Link href="/login" className="px-3 py-2 hover:bg-black/5 transition-colors">Ingresar</Link>
          <Link
            href="/register"
            className="px-4 py-2.5 border-2 transition-colors hover:bg-black hover:text-[#F4EFE6]"
            style={{ borderColor: INK }}
          >
            CREAR CUENTA →
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ─── Hero — chunky type + stickers + paper-collage scoreboard ─ */
function Hero() {
  return (
    <section className="relative border-b-2" style={{ borderColor: INK }}>
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 pt-12 sm:pt-20 pb-10 sm:pb-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          {/* Type column */}
          <div className="lg:col-span-8 relative">
            {/* Number tag */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span
                className="border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: INK }}
              >
                Vol. 01 / Issue 26
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">
                Buenos Aires · 09-may-2026
              </span>
            </div>

            <h1
              className="font-black uppercase leading-[0.82]"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                letterSpacing: '-0.04em',
                fontSize: 'clamp(56px, 11vw, 180px)',
              }}
            >
              UNA <span style={{ background: YELLOW, padding: '0 0.08em' }}>NETA</span> APP
              <br />
              PARA{' '}
              <span style={{ textDecoration: 'underline', textDecorationThickness: '6px', textUnderlineOffset: '0.12em', textDecorationColor: CLAY }}>
                EL JUEGO
              </span>
              <br />
              QUE JUGÁS.
            </h1>

            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
              Anotador en vivo · Reservas en 30 segundos · Torneos con producción real.
              No es un dashboard. Es la libreta que llevás a la cancha — pero rápida,
              compartible y conectada con tu agenda y tu ranking.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-4 border-2 text-sm font-bold uppercase tracking-[0.15em] transition-colors hover:bg-black hover:text-[#F4EFE6]"
                style={{ borderColor: INK, background: INK, color: PAPER }}
              >
                EMPEZAR GRATIS →
              </Link>
              <Link
                href="#anotador"
                className="text-sm font-bold uppercase tracking-[0.15em] underline underline-offset-4 hover:no-underline"
              >
                Ver el anotador
              </Link>
            </div>
          </div>

          {/* Paper-collage scoreboard */}
          <div className="lg:col-span-4 relative">
            <PaperScoreboard />
            {/* Stickers */}
            <div
              className="absolute -top-4 -left-4 rotate-[-6deg] border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: INK, background: YELLOW }}
            >
              ★ Best of 3
            </div>
            <div
              className="absolute -bottom-4 -right-4 rotate-[4deg] border-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: INK, background: CLAY, color: PAPER }}
            >
              LIVE · 02:14
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Paper-card scoreboard mock — looks photocopied / handwritten */
function PaperScoreboard() {
  return (
    <div className="relative" style={{ transform: 'rotate(-1.5deg)' }}>
      <div
        className="relative border-2 p-5"
        style={{
          borderColor: INK,
          background: PAPER,
          boxShadow: `6px 6px 0 0 ${INK}`,
        }}
      >
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] mb-4 pb-3 border-b-2 border-dashed" style={{ borderColor: INK }}>
          <span>MATCH SHEET</span>
          <span style={{ color: CLAY }}>● PADEL</span>
        </div>

        <div className="space-y-4">
          <PaperRow name="Diego / Juan"   sets={[6, 4]} pts="40" winning />
          <div className="border-t-2 border-dashed" style={{ borderColor: INK, opacity: 0.4 }} />
          <PaperRow name="Lucas / Pablo"  sets={[3, 3]} pts="30" />
        </div>

        <div className="mt-5 pt-3 border-t-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]" style={{ borderColor: INK }}>
          <span>CLUB ALMAGRO</span>
          <span>SET 2/3</span>
        </div>

        <div className="absolute -top-3 right-6 text-[9px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 border-2" style={{ borderColor: INK, background: PAPER }}>
          PELOTITAS / OFFICIAL
        </div>
      </div>
    </div>
  );
}

function PaperRow({ name, sets, pts, winning }: { name: string; sets: number[]; pts: string; winning?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-3 h-3 shrink-0 border-2"
        style={{ borderColor: INK, background: winning ? CLAY : 'transparent' }}
      />
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-bold truncate"
          style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', textDecoration: winning ? 'underline' : 'none', textDecorationThickness: '2px', textUnderlineOffset: '3px', textDecorationColor: CLAY }}
        >
          {name}
        </p>
      </div>
      {sets.map((s, i) => (
        <span key={i} className="w-5 text-center text-base font-black">{s}</span>
      ))}
      <span
        className="w-12 text-center font-black"
        style={{ fontSize: 38, lineHeight: 0.9, letterSpacing: '-0.04em' }}
      >
        {pts}
      </span>
    </div>
  );
}

/* ─── Fact slabs — alternating wide rows with one number each ── */
function FactSlabs() {
  const slabs = [
    { lbl: '0%',    sub: 'Comisión por reserva',           bg: PAPER,  fg: INK,    accent: CLAY },
    { lbl: '30s',   sub: 'En crear cuenta y reservar',     bg: INK,    fg: PAPER,  accent: YELLOW },
    { lbl: '∞',     sub: 'Partidos guardados en Pro',      bg: CLAY,   fg: PAPER,  accent: INK },
    { lbl: '24 / 7',sub: 'Anotás cuando quieras',          bg: YELLOW, fg: INK,    accent: INK },
  ];
  return (
    <section>
      {slabs.map((s, i) => (
        <div
          key={i}
          className="border-b-2 relative"
          style={{ background: s.bg, color: s.fg, borderColor: INK }}
        >
          <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-10 sm:py-14 flex items-center justify-between gap-8 flex-wrap">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-80"
            >
              FACT N°{String(i + 1).padStart(2, '0')}
            </span>
            <span
              className="font-black text-center order-3 lg:order-2 w-full lg:w-auto leading-none"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                fontSize: 'clamp(80px, 16vw, 240px)',
                letterSpacing: '-0.05em',
              }}
            >
              {s.lbl}
            </span>
            <span
              className="text-sm font-bold uppercase tracking-[0.18em] text-right max-w-[220px] order-2 lg:order-3"
              style={{ color: s.accent }}
            >
              {s.sub}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ─── Numbered features — old encyclopedia layout ────────────── */
function Numbered() {
  const items = [
    { n: '01', t: 'Anotador en vivo',   d: 'Cargá un punto con un tap. Modo Cancha pantalla completa, wake lock activado, doubles 2v2, audit log de cada cambio. Funciona con o sin internet la mayor parte del set.' },
    { n: '02', t: 'Reservas sin fricción', d: 'La cancha aparece y la apretás. Si te faltan jugadores abrís cupos y se anotan otros con tu nivel. Sin comisión. Sin formulario eterno.' },
    { n: '03', t: 'Torneos completos',  d: 'Fixtures, grupos, llaves, anotadores oficiales sincronizados, reglas custom (best of 3/5, pro set, golden point). El organizador maneja todo de una página.' },
    { n: '04', t: 'Ranking ELO real',   d: 'Se calcula desde lo que pasó en cancha, no desde una autoreporte. K-factor provisional hasta los 30 partidos. Una sola tabla para padel, otra para tenis.' },
    { n: '05', t: 'Match cards',        d: 'Al cerrar un partido sale una imagen 1200×630 lista para Instagram. Linkeable y con OpenGraph — se ve como un poster real, no como un meme.' },
    { n: '06', t: 'Rivalidades',        d: 'A los tres partidos contra el mismo se crea la rivalidad sola. Cargás la página H2H pública y compartís el chiste con el ganador de la última.' },
  ];
  return (
    <section id="anotador" className="border-b-2" style={{ borderColor: INK }}>
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-80 mb-3">
              CAPÍTULO 01 / SEIS PRIMITIVAS
            </p>
            <h2
              className="font-black uppercase leading-[0.88]"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                fontSize: 'clamp(40px, 7vw, 96px)',
                letterSpacing: '-0.035em',
              }}
            >
              SEIS COSAS,
              <br />
              CINCO APPS{' '}
              <span style={{ color: CLAY }}>MENOS</span>.
            </h2>
          </div>
          <div className="lg:col-span-5 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            <p className="mb-3">
              Pelotitas no es un marketplace de canchas. Es la libreta + el cronómetro
              + el ranking + el organizador + el grupo de WhatsApp + el filtro de jugadores
              cercanos — combinados.
            </p>
            <p className="opacity-70">
              Cada feature de esta lista existe porque algo en el flujo real estaba roto.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-2" style={{ borderColor: INK }}>
          {items.map((f, i) => (
            <div
              key={f.n}
              className={`p-7 sm:p-8 relative ${i % 3 !== 2 ? 'sm:border-r-2' : ''} ${i < items.length - 3 ? 'lg:border-b-2' : ''} border-b-2 lg:border-b-2`}
              style={{ borderColor: INK, ...(i === items.length - 1 ? { borderBottom: 'none' } : {}) }}
            >
              <div className="flex items-baseline justify-between mb-6">
                <span
                  className="font-black"
                  style={{
                    fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                    fontSize: 56,
                    lineHeight: 0.85,
                    letterSpacing: '-0.05em',
                    color: i % 2 ? CLAY : INK,
                  }}
                >
                  {f.n}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60">
                  feature
                </span>
              </div>
              <h3
                className="font-black uppercase mb-3"
                style={{
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 26,
                  letterSpacing: '-0.025em',
                  lineHeight: 0.95,
                }}
              >
                {f.t}
              </h3>
              <p className="text-sm leading-relaxed opacity-90" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Scribble manifesto — handwritten-feeling text block ───── */
function ScribbleBlock() {
  return (
    <section className="border-b-2" style={{ borderColor: INK, background: INK, color: PAPER }}>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-20 sm:py-28 relative">
        <div className="absolute -left-1 top-10 hidden sm:flex items-center justify-center"
             style={{ width: 60, height: 60, background: YELLOW, color: INK, borderRadius: 999, transform: 'rotate(-12deg)' }}>
          <span className="font-black text-xs uppercase tracking-widest">★ pelotitas</span>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70 mb-6">
          MANIFIESTO
        </p>
        <p
          className="font-black uppercase leading-[0.92]"
          style={{
            fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 4.5vw, 64px)',
            letterSpacing: '-0.025em',
          }}
        >
          “El padel y el tenis se merecen{' '}
          <span style={{ background: YELLOW, color: INK, padding: '0 0.12em' }}>software</span>{' '}
          <span style={{ textDecoration: 'underline', textDecorationThickness: '4px', textUnderlineOffset: '0.1em', textDecorationColor: CLAY }}>
            de verdad
          </span>
          . No un Excel con descuentos. No un grupo de WhatsApp con resultados que se pierden.
          No una app que parece pensada para inversores.
          <br />
          <br />
          Lo que jugaste,{' '}
          <span style={{ color: YELLOW }}>queda.</span>”
        </p>
        <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.25em] opacity-70">
          — El equipo de pelotitas, escrito al lado de una cancha
        </p>
      </div>
    </section>
  );
}

/* ─── Price block — two cards with hard borders ──────────────── */
function PriceBlock() {
  return (
    <section className="border-b-2" style={{ borderColor: INK }}>
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <h2
            className="font-black uppercase leading-[0.88]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(40px, 7vw, 96px)',
              letterSpacing: '-0.035em',
            }}
          >
            DOS PLANES.
            <br />
            <span style={{ color: CLAY }}>UNO ES GRATIS.</span>
          </h2>
          <p className="text-sm max-w-md" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            El plan gratis cubre lo que un jugador normal necesita. Pro es para
            los que entrenan y quieren stats serios + URL propia + cards sin marca.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-0 border-2" style={{ borderColor: INK }}>
          {/* Free */}
          <div className="p-8 sm:p-10 border-b-2 md:border-b-0 md:border-r-2 relative" style={{ borderColor: INK }}>
            <div className="flex items-baseline justify-between mb-8">
              <h3 className="font-black uppercase" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 32, letterSpacing: '-0.025em' }}>
                FREE
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">para empezar</span>
            </div>
            <p className="font-black leading-none mb-2" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 120, letterSpacing: '-0.05em' }}>
              0
              <span style={{ fontSize: 32, marginLeft: 6 }}>$/mes</span>
            </p>
            <ul className="mt-8 space-y-2.5 text-sm" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
              {['Anotador en vivo','Modo Cancha','Reservas en clubes públicos','Match cards (con marca)','Últimos 50 partidos en historial','Ranking ELO público'].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 w-3 h-3 border-2 shrink-0" style={{ borderColor: INK }} />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-10 inline-flex items-center gap-2 px-6 py-3 border-2 text-xs font-bold uppercase tracking-[0.18em] hover:bg-black hover:text-[#F4EFE6] transition-colors" style={{ borderColor: INK }}>
              EMPEZAR →
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 sm:p-10 relative" style={{ background: INK, color: PAPER }}>
            <div
              className="absolute -top-3 right-6 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border-2"
              style={{ background: YELLOW, color: INK, borderColor: INK }}
            >
              POPULAR
            </div>
            <div className="flex items-baseline justify-between mb-8">
              <h3 className="font-black uppercase" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 32, letterSpacing: '-0.025em', color: YELLOW }}>
                PRO PLAYER
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">para entrenar en serio</span>
            </div>
            <p className="font-black leading-none mb-2" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 120, letterSpacing: '-0.05em' }}>
              4
              <span style={{ fontSize: 32, marginLeft: 6 }}>$/mes</span>
            </p>
            <ul className="mt-8 space-y-2.5 text-sm" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
              {[
                'Todo lo del plan Free',
                'Stats avanzados (win-rate, racha, H2H total)',
                'Historial ilimitado',
                'Match cards sin watermark',
                'URL propia (pelotitas.app/p/vos)',
                'Insignia Pro en perfil',
                'Controles de privacidad finos',
                'Soporte prioritario',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 w-3 h-3 border-2 shrink-0" style={{ borderColor: PAPER, background: YELLOW }} />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/billing" className="mt-10 inline-flex items-center gap-2 px-6 py-3 border-2 text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#FFD23F] hover:text-[#0A0E14] transition-colors" style={{ borderColor: PAPER, background: PAPER, color: INK }}>
              IR A PRO →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Closing marquee — paper-strip with rotated big text ───── */
function ClosingMarquee() {
  const items = ['ANOTÁ.', 'JUGÁ.', 'GANÁ.', 'REPETIR.'];
  return (
    <section className="relative overflow-hidden border-b-2" style={{ borderColor: INK, background: PAPER }}>
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-24 sm:py-32 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70 mb-6">
            ÚLTIMA LLAMADA
          </p>
          <h2
            className="font-black uppercase leading-[0.82]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(56px, 10vw, 144px)',
              letterSpacing: '-0.04em',
            }}
          >
            {items.map((t, i) => (
              <span key={t} className="block">
                {i === 0 ? <span style={{ background: YELLOW, padding: '0 0.06em' }}>{t}</span> :
                 i === 2 ? <span style={{ color: CLAY }}>{t}</span> :
                 t}
              </span>
            ))}
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 border-2 text-base font-bold uppercase tracking-[0.15em] transition-colors hover:bg-[#FF5C2B] hover:text-[#F4EFE6]" style={{ borderColor: INK, background: INK, color: PAPER }}>
              CREAR CUENTA →
            </Link>
            <Link href="/clubs" className="text-sm font-bold uppercase tracking-[0.18em] underline underline-offset-4 hover:no-underline">
              VER COMPLEJOS
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          {/* Stacked stickers */}
          <div className="relative w-full max-w-md mx-auto" style={{ aspectRatio: '4/5' }}>
            <Sticker style={{ top: '0%',   left: '5%',  rotate: -8, bg: YELLOW, fg: INK,    text: '0% comisión'    }} />
            <Sticker style={{ top: '18%',  left: '40%', rotate: 6,  bg: CLAY,   fg: PAPER,  text: 'Pro: 4$/mes'    }} />
            <Sticker style={{ top: '40%',  left: '10%', rotate: -3, bg: LIME,   fg: INK,    text: 'Anotás en 1 tap'}} />
            <Sticker style={{ top: '58%',  left: '45%', rotate: 9,  bg: PAPER,  fg: INK,    text: 'ELO real'       }} />
            <Sticker style={{ top: '75%',  left: '15%', rotate: -6, bg: SKY,    fg: INK,    text: 'Padel + Tenis'  }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Sticker({ style, text }: { style: { top: string; left: string; rotate: number; bg: string; fg: string; text: string }; text?: string }) {
  return (
    <div
      className="absolute border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
      style={{
        top: style.top,
        left: style.left,
        transform: `rotate(${style.rotate}deg)`,
        background: style.bg,
        color: style.fg,
        borderColor: INK,
        boxShadow: `3px 3px 0 0 ${INK}`,
      }}
    >
      {text || style.text}
    </div>
  );
}

/* ─── Footer — hard rule ─────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t-2" style={{ borderColor: INK, background: INK, color: PAPER }}>
      <div className="max-w-[1480px] mx-auto px-6 sm:px-10 py-10 flex flex-wrap items-center justify-between gap-6">
        <Link href="/v3" className="text-xl font-bold" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          pelotitas<span style={{ color: CLAY }}>.</span>
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">
          © 2026 · Pelotitas OS · Hecho en Argentina
        </p>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
          <Link href="/terms" className="hover:opacity-100">Términos</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:opacity-100">Privacidad</Link>
          <span>·</span>
          <Link href="/" className="hover:opacity-100">Landing A</Link>
          <span>·</span>
          <Link href="/v2" className="hover:opacity-100">Landing B</Link>
        </div>
      </div>
    </footer>
  );
}
