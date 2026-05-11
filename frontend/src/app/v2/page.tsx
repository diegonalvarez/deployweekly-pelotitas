'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   LANDING B — high-impact marketing variant.
   Editorial-meets-stadium aesthetic. Heavy display + mono mix,
   asymmetric grids, brutal numbers, marquee tickers, product
   mockups baked into the hero. No nav, no footer fluff —
   single-page sell.
   ───────────────────────────────────────────────────────────── */

const TICKER = [
  { l: 'D. Alvarez', r: 'F. Castro', s: '6-4 3-6 6-3', live: false },
  { l: 'J. Perez',   r: 'L. Romero', s: '4-2',         live: true  },
  { l: 'M. Sosa',    r: 'C. Ibarra', s: '7-5 4-1',     live: true  },
  { l: 'P. Lopez',   r: 'A. Diaz',   s: '6-2 6-1',     live: false },
  { l: 'N. Vega',    r: 'R. Torres', s: '5-3',         live: true  },
  { l: 'O. Suarez',  r: 'E. Mora',   s: '6-4',         live: false },
  { l: 'I. Cruz',    r: 'B. Aguero', s: '7-6 6-3',     live: false },
];

const FEATURE_DOTS = [
  { k: '01', t: 'Anotador',     d: 'Punto por punto con audit log. Apoyá el celu y anotá sin perder un game.' },
  { k: '02', t: 'Reservas',     d: 'Cancha en 30 segundos. Si te faltan jugadores, abrí cupos y se anotan otros.' },
  { k: '03', t: 'Torneos',      d: 'Inscripción, fixtures, anotadores oficiales y match cards compartibles.' },
  { k: '04', t: 'Ranking ELO',  d: 'Cada partido te mueve. Sin auto-reportar — sale del anotador.' },
  { k: '05', t: 'Rivalidades',  d: 'A los 3 partidos contra el mismo se arma sola. H2H público compartible.' },
  { k: '06', t: 'Pro Player',   d: 'Stats avanzados, historial ilimitado, URL propia. Para los que entrenan en serio.' },
];

export default function LandingB() {
  return (
    <div className="min-h-screen bg-base text-text-primary overflow-x-clip">
      <TopTicker />
      <TopBar />
      <Hero />
      <BrutalCounters />
      <ScoreboardShowcase />
      <Features />
      <ShareCardPreview />
      <FinalCTA />
      <BottomMarquee />
    </div>
  );
}

/* ─── Top live ticker — Bloomberg/ATP-style band ─────────────── */
function TopTicker() {
  return (
    <div className="border-b border-border-dark/80 bg-base/90 backdrop-blur-md overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...TICKER, ...TICKER].map((m, i) => (
          <span
            key={i}
            className="mx-6 font-mono text-2xs uppercase tracking-[0.18em] inline-flex items-center gap-3"
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.live ? 'bg-brand' : 'bg-text-faint'}`} />
            <span className="text-text-secondary">{m.l}</span>
            <span className="text-text-muted">vs</span>
            <span className="text-text-secondary">{m.r}</span>
            <span className="text-text-primary font-semibold tabular">{m.s}</span>
            {m.live && <span className="text-brand">· LIVE</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Top bar — minimal: logo + 2 CTAs ───────────────────────── */
function TopBar() {
  return (
    <header className="relative z-30 max-w-[1400px] mx-auto px-6 sm:px-8 pt-6 pb-2 flex items-center justify-between">
      <Link href="/v2" className="font-display text-2xl font-bold tracking-tight-2 text-text-primary">
        pelotitas<span className="text-brand">.</span>
      </Link>
      <nav className="flex items-center gap-1 sm:gap-3">
        <Link href="/" className="hidden sm:inline-flex font-mono text-2xs uppercase tracking-[0.18em] text-text-muted hover:text-text-primary px-3 py-2 transition-colors">
          Landing A
        </Link>
        <Link href="/login" className="font-mono text-2xs uppercase tracking-[0.18em] text-text-muted hover:text-text-primary px-3 py-2 transition-colors">
          Ingresar
        </Link>
        <Link href="/register" className="btn-primary text-xs h-9">
          Crear cuenta <ArrowRight className="w-3 h-3" />
        </Link>
      </nav>
    </header>
  );
}

/* ─── Hero — typographic explosion + product mock ────────────── */
function Hero() {
  return (
    <section className="relative max-w-[1400px] mx-auto px-6 sm:px-8 pt-12 sm:pt-16 pb-8">
      <div className="absolute inset-0 bg-court-lines opacity-30 pointer-events-none" />
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,255,63,0.4) 0%, transparent 60%)' }}
      />
      <div
        className="absolute top-1/2 -left-32 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(107,169,255,0.35) 0%, transparent 60%)' }}
      />

      <div className="relative grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-end">
        {/* Type column */}
        <div className="relative">
          <p className="font-mono text-2xs uppercase tracking-[0.3em] text-text-muted mb-6">
            v2 · Padel & Tenis · Argentina &amp; LATAM
          </p>
          <h1 className="font-display font-bold tracking-tightest leading-[0.82] text-text-primary"
              style={{ fontSize: 'clamp(64px, 12vw, 200px)' }}>
            ANOTÁ.
            <br />
            <span className="text-text-secondary">JUGÁ.</span>
            <br />
            <span className="text-gradient">GANÁ.</span>
          </h1>

          <p className="font-display text-2xl sm:text-3xl text-text-secondary mt-10 max-w-2xl leading-tight tracking-tight-2">
            El sistema operativo del padel y el tenis.
            <span className="text-text-primary"> Anotador en vivo, reservas, torneos, ranking ELO</span> —
            todo en un solo lugar.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/register" className="btn-primary text-sm h-12 px-6">
              Crear cuenta gratis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="#scoreboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group h-12">
              Ver el anotador en acción
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-12 pt-8 border-t border-border-dark/80 grid grid-cols-3 gap-4 max-w-xl">
            <div>
              <p className="score-digit text-3xl text-text-primary">0<span className="text-brand">%</span></p>
              <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-1">Comisión</p>
            </div>
            <div>
              <p className="score-digit text-3xl text-text-primary">30<span className="text-sky">s</span></p>
              <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-1">Para empezar</p>
            </div>
            <div>
              <p className="score-digit text-3xl text-text-primary">24<span className="text-clay">/7</span></p>
              <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-1">Online</p>
            </div>
          </div>
        </div>

        {/* Product mock column */}
        <div className="relative lg:translate-y-6">
          <ScoreboardMock />
        </div>
      </div>
    </section>
  );
}

/* ─── Scoreboard mock — looks like the real product ──────────── */
function ScoreboardMock({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const ptSize = size === 'lg' ? 'text-7xl sm:text-8xl' : size === 'sm' ? 'text-3xl' : 'text-5xl sm:text-6xl';
  const setSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-xl';
  return (
    <div className="relative">
      <div
        className="absolute -inset-6 rounded-3xl opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #D4FF3F 0%, #6BA9FF 100%)' }}
      />
      <div className="relative bg-base border border-border-dark rounded-2xl overflow-hidden bg-court-lines">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-dark bg-surface/50">
          <span className="font-mono text-2xs uppercase tracking-[0.18em] text-text-muted">
            Set 2/3 · Padel
          </span>
          <span className="font-mono text-2xs text-brand inline-flex items-center gap-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60" />
              <span className="relative rounded-full bg-brand w-1.5 h-1.5" />
            </span>
            LIVE
          </span>
        </div>

        {/* Row HOME — winning */}
        <div className="px-5 py-5 flex items-center gap-4 bg-brand/[0.05]">
          <span className="w-3 h-3 rounded-full bg-brand shrink-0" style={{ boxShadow: '0 0 12px rgba(212,255,63,0.7)' }} />
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-text-primary leading-tight truncate">Diego</p>
            <p className="font-display text-text-secondary leading-tight truncate">Juan</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mt-1">Sacando</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`score-digit ${setSize} text-text-muted w-6 text-center`}>6</span>
            <span className={`score-digit ${setSize} text-brand w-6 text-center`}>4</span>
          </div>
          <span className={`score-digit ${ptSize} text-text-primary w-16 text-center`}
                style={{ textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>40</span>
        </div>

        {/* Row AWAY */}
        <div className="px-5 py-5 flex items-center gap-4 border-t border-border-dark">
          <span className="w-3 h-3 rounded-full bg-sky/40 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-text-primary leading-tight truncate">Lucas</p>
            <p className="font-display text-text-secondary leading-tight truncate">Pablo</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mt-1">Equipo B</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`score-digit ${setSize} text-text-muted w-6 text-center`}>3</span>
            <span className={`score-digit ${setSize} text-text-muted w-6 text-center`}>3</span>
          </div>
          <span className={`score-digit ${ptSize} text-text-muted w-16 text-center`}>30</span>
        </div>

        {/* Audit caption */}
        <div className="px-5 py-3 border-t border-border-dark bg-surface/30 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Club Almagro · Cancha 3
          </span>
          <span className="font-mono text-[10px] text-text-secondary">
            13:42 → tap para sumar
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Brutal counters — Bloomberg HUD strip ──────────────────── */
function BrutalCounters() {
  const counters = [
    { k: 'matches_live',   v: '1,247' },
    { k: 'users_online',   v: '8.3k'  },
    { k: 'sets_today',     v: '18,429' },
    { k: 'cupos_abiertos', v: '94'    },
  ];
  return (
    <section className="border-y border-border-dark bg-surface/30">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {counters.map((c) => (
          <div key={c.k} className="sideline">
            <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mb-1">
              {c.k}
            </p>
            <p className="score-digit text-5xl sm:text-7xl text-text-primary">
              {c.v}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Scoreboard showcase — full bleed product hero ──────────── */
function ScoreboardShowcase() {
  return (
    <section id="scoreboard" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-court-lines opacity-25 pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 relative">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.3em] text-text-muted mb-4">
              01 · Anotador en vivo
            </p>
            <h2 className="font-display font-bold tracking-tightest leading-[0.9] text-text-primary"
                style={{ fontSize: 'clamp(48px, 8vw, 120px)' }}>
              El anotador
              <br />
              <span className="text-gradient">más rápido</span>
              <br />
              del padel.
            </h2>
            <p className="font-display text-xl sm:text-2xl text-text-secondary mt-8 max-w-xl leading-tight tracking-tight-2">
              Apoyá el celu al lado de la cancha. Tap para sumar. Modo Cancha pantalla completa,
              audit log de cada punto, super tiebreak, golden point, doubles.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {['Modo Cancha', 'Doubles 2v2', 'Audit log', 'Compartible'].map((t) => (
                <span key={t} className="font-mono text-2xs uppercase tracking-widest px-3 py-1.5 rounded-full bg-surface-light border border-border-dark text-text-secondary">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <ScoreboardMock size="lg" />
            {/* Floating badges */}
            <div className="absolute -left-6 top-1/4 hidden sm:block">
              <div className="bg-base border border-border-dark rounded-xl px-4 py-2.5 shadow-heavy">
                <p className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                  Audit log
                </p>
                <p className="font-mono text-xs text-text-primary mt-0.5">+ POINT_HOME 13:42</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 hidden sm:block">
              <div className="bg-base border border-brand/40 rounded-xl px-4 py-2.5 shadow-heavy">
                <p className="font-mono text-2xs uppercase tracking-widest text-brand">
                  Wake lock
                </p>
                <p className="font-mono text-xs text-text-primary mt-0.5">pantalla on</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features grid — 6 capabilities in newspaper-style cards ─ */
function Features() {
  return (
    <section className="relative py-24 sm:py-32 border-y border-border-dark bg-surface/30">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-16">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.3em] text-text-muted mb-4">
              Capacidades
            </p>
            <h2 className="font-display font-bold tracking-tightest leading-[0.92] text-text-primary"
                style={{ fontSize: 'clamp(40px, 6.5vw, 88px)' }}>
              Seis cosas
              <br />
              <span className="text-text-secondary">que reemplazan</span>
              <br />
              <span className="text-gradient">cinco apps.</span>
            </h2>
          </div>
          <p className="font-display text-xl text-text-secondary max-w-md tracking-tight-2 leading-tight">
            Cada feature está pensada para el flujo real de un jugador o de un club —
            no para llenar una tabla comparativa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-dark border border-border-dark rounded-2xl overflow-hidden">
          {FEATURE_DOTS.map((f, i) => (
            <div
              key={f.k}
              className="bg-base p-7 sm:p-8 group hover:bg-surface transition-colors duration-300 relative"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                  {f.k}
                </span>
                <span className="w-2 h-2 rounded-full bg-text-faint group-hover:bg-brand transition-colors" />
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight-2 leading-none mb-3">
                {f.t}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.d}</p>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Share card preview — viral hook ────────────────────────── */
function ShareCardPreview() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Mock share card */}
          <div className="relative aspect-[1200/630] bg-base border border-border-dark rounded-2xl overflow-hidden p-7 sm:p-10 flex flex-col bg-court-lines">
            <div className="flex items-center gap-3 mb-auto">
              <span className="font-display font-bold text-2xl">pelotitas<span className="text-brand">.</span></span>
              <span className="w-px h-5 bg-border-default" />
              <span className="font-mono text-2xs uppercase tracking-[0.25em] text-text-muted">
                Padel · Oficial
              </span>
              <span className="font-mono text-2xs uppercase tracking-widest text-text-muted ml-auto">
                09-may-2026
              </span>
            </div>

            <div className="my-4 sm:my-6 space-y-3 sm:space-y-5">
              <div className="flex items-center justify-between bg-brand/[0.06] rounded-lg p-3 sm:p-4">
                <div>
                  <p className="font-display text-2xl sm:text-4xl font-bold leading-none text-brand">Diego</p>
                  <p className="font-display text-xl sm:text-3xl font-medium leading-none text-brand/80 mt-1">Juan</p>
                  <p className="font-mono text-2xs uppercase tracking-[0.25em] text-brand font-semibold mt-2">▸ GANADOR</p>
                </div>
                <div className="flex items-end gap-3 sm:gap-5">
                  {['6', '3', '6'].map((v, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">S{i+1}</span>
                      <span className="score-digit text-3xl sm:text-5xl text-brand">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg p-3 sm:p-4">
                <div>
                  <p className="font-display text-2xl sm:text-4xl font-bold leading-none text-text-primary">Lucas</p>
                  <p className="font-display text-xl sm:text-3xl font-medium leading-none text-text-secondary mt-1">Pablo</p>
                </div>
                <div className="flex items-end gap-3 sm:gap-5">
                  {['4', '6', '3'].map((v, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">S{i+1}</span>
                      <span className="score-digit text-3xl sm:text-5xl text-text-muted">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <span className="font-mono text-2xs uppercase tracking-widest text-text-muted">
                Torneo Almagro Open 2026
              </span>
              <span className="font-mono text-2xs uppercase tracking-[0.3em] text-text-muted">
                anotalo en pelotitas
              </span>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-mono text-2xs uppercase tracking-[0.3em] text-text-muted mb-4">
            03 · Compartibles
          </p>
          <h2 className="font-display font-bold tracking-tightest leading-[0.9] text-text-primary"
              style={{ fontSize: 'clamp(40px, 7vw, 100px)' }}>
            Match cards
            <br />
            que se ven
            <br />
            <span className="text-gradient">caras.</span>
          </h2>
          <p className="font-display text-xl sm:text-2xl text-text-secondary mt-8 max-w-xl leading-tight tracking-tight-2">
            Al cerrar un partido en el anotador, generamos una imagen lista para Instagram Stories
            y WhatsApp. Te ahorra un PowerPoint y queda como un poster.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA — giant score ──────────────────────────────── */
function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-40 overflow-hidden border-t border-border-dark">
      <div className="absolute inset-0 bg-court-lines opacity-30 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(at 50% 50%, rgba(212,255,63,0.08) 0%, transparent 60%)' }}
      />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 relative text-center">
        <p className="font-mono text-2xs uppercase tracking-[0.3em] text-text-muted mb-6">
          Empezá ahora
        </p>
        <h2 className="font-display font-bold tracking-tightest leading-[0.85] text-text-primary"
            style={{ fontSize: 'clamp(72px, 16vw, 280px)' }}>
          ANOTÁ
          <br />
          <span className="text-gradient">TU PRIMER</span>
          <br />
          PARTIDO.
        </h2>
        <p className="font-display text-xl sm:text-2xl text-text-secondary mt-10 max-w-2xl mx-auto leading-tight tracking-tight-2">
          Crear cuenta toma 30 segundos. El anotador está listo en el siguiente click.
          Sin tarjeta. Sin compromiso.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base h-14 px-8">
            Crear cuenta gratis <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/clubs" className="inline-flex items-center gap-2 text-base font-medium text-text-secondary hover:text-text-primary transition-colors group h-14">
            Explorar complejos
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-20 pt-8 border-t border-border-dark/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { k: 'reservas',   v: '0%',  s: 'comisión' },
            { k: 'tiempo',     v: '30s', s: 'crear cuenta' },
            { k: 'anotador',   v: '∞',   s: 'partidos' },
            { k: 'soporte',    v: '24/7',s: 'online' },
          ].map((s) => (
            <div key={s.k} className="text-center">
              <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mb-2">{s.k}</p>
              <p className="score-digit text-4xl sm:text-5xl text-text-primary">{s.v}</p>
              <p className="font-mono text-2xs uppercase tracking-widest text-text-muted mt-1">{s.s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Bottom infinite marquee — closer with brand line ─────── */
function BottomMarquee() {
  const items = [
    'ANOTÁ EN VIVO', 'SIN COMISIÓN', '0% FRICCIÓN', 'PADEL · TENIS',
    'RANKING ELO AUTOMÁTICO', 'MATCH CARDS COMPARTIBLES', 'MODO CANCHA',
    'TORNEOS EN UN CLICK', 'RIVALIDADES AUTOMÁTICAS', 'COMUNIDAD',
  ];
  return (
    <div className="border-t border-border-dark bg-base overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-5">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="mx-8 font-display font-bold tracking-tightest inline-flex items-center gap-6"
            style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}
          >
            <span className="text-text-primary">{t}</span>
            <span className="w-2 h-2 rounded-full bg-brand" />
          </span>
        ))}
      </div>
    </div>
  );
}
