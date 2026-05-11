'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   LANDING D — Linear/Vercel-style minimal analytics.
   Smaller, denser type. Real product UI as the hero. Bento grid
   of feature tiles with inline charts and mini-mocks instead of
   essay copy. Tight spacing, subtle accents, one focused gradient.
   ───────────────────────────────────────────────────────────── */

const BG          = '#0B0D10';
const PANEL       = '#14171C';
const PANEL_2     = '#1A1D23';
const BORDER      = '#22262C';
const BORDER_DIM  = '#191C21';
const TEXT        = '#F5F5F4';
const TEXT_DIM    = '#9CA3AF';
const TEXT_FAINT  = '#5B6271';
const BRAND       = '#D4FF3F';
const SKY         = '#6BA9FF';
const CLAY        = '#FF7A4D';

export default function LandingD() {
  return (
    <div className="min-h-screen relative" style={{ background: BG, color: TEXT }}>
      {/* Subtle radial highlight behind hero */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[600px]"
        style={{
          background:
            'radial-gradient(800px 360px at 50% -10%, rgba(212,255,63,0.10) 0%, transparent 70%)',
        }}
      />
      <Nav />
      <Hero />
      <Logos />
      <Bento />
      <SecondSplit />
      <StatsRow />
      <Cta />
      <Footer />
    </div>
  );
}

/* ─── NAV ────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md" style={{ background: 'rgba(11,13,16,0.72)', borderBottom: `1px solid ${BORDER_DIM}` }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/v4" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight" style={{ color: TEXT }}>
          pelotitas<span style={{ color: BRAND }}>.</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-7 text-[13px]" style={{ color: TEXT_DIM }}>
          <a href="#anotador"  className="hover:text-white transition-colors">Anotador</a>
          <a href="#features"  className="hover:text-white transition-colors">Features</a>
          <a href="#pricing"   className="hover:text-white transition-colors">Pricing</a>
          <Link href="/"       className="hover:text-white transition-colors">A</Link>
          <Link href="/v2"     className="hover:text-white transition-colors">B</Link>
          <Link href="/v3"     className="hover:text-white transition-colors">C</Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="text-[13px] px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors" style={{ color: TEXT_DIM }}>
            Ingresar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-[13px] font-medium px-3 py-1.5 rounded-md transition-all"
            style={{ background: TEXT, color: BG }}
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
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12 text-center">
        {/* Pill */}
        <a
          href="#anotador"
          className="inline-flex items-center gap-2 text-[12px] px-3 py-1 rounded-full transition-colors hover:border-white/30"
          style={{ border: `1px solid ${BORDER}`, color: TEXT_DIM, background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full animate-ping opacity-70" style={{ background: BRAND }} />
            <span className="relative rounded-full w-1.5 h-1.5" style={{ background: BRAND }} />
          </span>
          Anotador en vivo, ELO automático y reservas — ya disponible
          <ArrowRight className="w-3 h-3" />
        </a>

        <h1 className="mt-6 text-[44px] sm:text-[64px] font-semibold tracking-[-0.025em] leading-[1.04]"
            style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          La capa de datos del<br />
          <span style={{ background: 'linear-gradient(90deg, #D4FF3F 0%, #6BA9FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            padel y el tenis
          </span>
          .
        </h1>

        <p className="mt-5 max-w-xl mx-auto text-[15px] leading-relaxed" style={{ color: TEXT_DIM }}>
          Anotador en vivo, reservas en 30 segundos, torneos completos y ranking ELO
          automático — en una sola app. Sin comisión, sin formularios.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2">
          <Link href="/register" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-md" style={{ background: TEXT, color: BG }}>
            Crear cuenta gratis <ArrowRight className="w-3 h-3" />
          </Link>
          <a href="#anotador" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-md hover:bg-white/[0.04] transition-colors" style={{ color: TEXT_DIM, border: `1px solid ${BORDER}` }}>
            Ver el anotador <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Product showcase — main dashboard mock */}
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pb-20">
        <div
          aria-hidden
          className="absolute -inset-x-4 -top-6 -bottom-10 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(800px 280px at 50% 0%, rgba(212,255,63,0.10) 0%, transparent 70%)' }}
        />
        <DashboardMock />
      </div>
    </section>
  );
}

/* The hero dashboard — pretends to be the actual product UI */
function DashboardMock() {
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: PANEL, border: `1px solid ${BORDER}`, boxShadow: '0 30px 90px -30px rgba(0,0,0,0.7)' }}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 h-9 border-b" style={{ borderColor: BORDER_DIM, background: PANEL_2 }}>
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f47' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f47' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3f47' }} />
        </span>
        <span className="text-[11px] mx-auto" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
          pelotitas.app / dashboard
        </span>
      </div>

      <div className="grid grid-cols-[180px_1fr] min-h-[420px]">
        {/* Sidebar */}
        <aside className="border-r px-3 py-4 hidden sm:block" style={{ borderColor: BORDER_DIM, background: PANEL_2 }}>
          {[
            { l: 'Inicio',      active: true  },
            { l: 'Anotador',    active: false },
            { l: 'Reservas',    active: false },
            { l: 'Torneos',     active: false },
            { l: 'Ranking',     active: false },
            { l: 'Rivalidades', active: false },
            { l: 'Perfil',      active: false },
          ].map((i) => (
            <div
              key={i.l}
              className="text-[12px] px-2.5 py-1.5 rounded-md mb-0.5 flex items-center gap-2"
              style={{
                background: i.active ? 'rgba(212,255,63,0.08)' : 'transparent',
                color: i.active ? BRAND : TEXT_DIM,
              }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: i.active ? BRAND : TEXT_FAINT }} />
              {i.l}
            </div>
          ))}
          <div className="mt-4 pt-3 border-t text-[10px] uppercase tracking-widest" style={{ borderColor: BORDER_DIM, color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
            Tus stats
          </div>
        </aside>

        {/* Main */}
        <main className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
                Performance · Padel · últimos 30 días
              </p>
              <h3 className="text-[18px] font-semibold tracking-tight">Tu rendimiento</h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,255,63,0.08)', color: BRAND, fontFamily: 'var(--font-mono), monospace' }}>
              +124 ELO ↑
            </span>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { l: 'ELO actual', v: '1284', d: '+124' },
              { l: 'Win rate',   v: '64%',  d: '+8'   },
              { l: 'Partidos',   v: '23',   d: '+9'   },
              { l: 'Racha',      v: '5',    d: 'W'    },
            ].map((k) => (
              <div key={k.l} className="rounded-lg p-2.5" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>{k.l}</p>
                <p className="text-[20px] font-semibold mt-0.5 tabular tracking-tight" style={{ fontFamily: 'var(--font-mono), monospace' }}>{k.v}</p>
                <p className="text-[10px]" style={{ color: BRAND, fontFamily: 'var(--font-mono), monospace' }}>{k.d}</p>
              </div>
            ))}
          </div>

          {/* Chart + recent matches */}
          <div className="grid sm:grid-cols-[1.4fr_1fr] gap-3">
            <div className="rounded-lg p-3" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: TEXT_DIM, fontFamily: 'var(--font-mono), monospace' }}>ELO progression</p>
                <p className="text-[11px]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>30d</p>
              </div>
              <LineChart />
            </div>
            <div className="rounded-lg p-3" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: TEXT_DIM, fontFamily: 'var(--font-mono), monospace' }}>Últimos partidos</p>
                <p className="text-[11px]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>5</p>
              </div>
              <div className="space-y-1.5">
                {[
                  { r: 'W', name: 'vs Lucas',  score: '6-4 6-3',   d: '+12' },
                  { r: 'W', name: 'vs Pablo',  score: '7-5 4-6 6-2', d: '+9'  },
                  { r: 'L', name: 'vs Diego',  score: '4-6 6-7',   d: '-7'  },
                  { r: 'W', name: 'vs Lucas',  score: '6-2 6-4',   d: '+11' },
                  { r: 'W', name: 'vs Sofia',  score: '6-3 6-2',   d: '+14' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="w-4 text-center font-semibold tabular" style={{ color: m.r === 'W' ? BRAND : CLAY, fontFamily: 'var(--font-mono), monospace' }}>{m.r}</span>
                    <span className="flex-1 truncate" style={{ color: TEXT }}>{m.name}</span>
                    <span className="tabular" style={{ color: TEXT_DIM, fontFamily: 'var(--font-mono), monospace' }}>{m.score}</span>
                    <span className="w-7 text-right tabular" style={{ color: m.r === 'W' ? BRAND : CLAY, fontFamily: 'var(--font-mono), monospace' }}>{m.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* Lightweight inline line chart — SVG, no library */
function LineChart() {
  // 12 weekly ELO datapoints, generally rising
  const data = [1160, 1148, 1175, 1190, 1170, 1208, 1215, 1232, 1228, 1255, 1270, 1284];
  const min = Math.min(...data), max = Math.max(...data);
  const w = 100, h = 100;
  const norm = (v: number, i: number) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return [x, y] as const;
  };
  const path = data.map((v, i) => {
    const [x, y] = norm(v, i);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-28">
      {/* Grid */}
      {[0, 25, 50, 75].map((y) => (
        <line key={y} x1="0" y1={y} x2={w} y2={y} stroke={BORDER_DIM} strokeWidth="0.4" />
      ))}
      <defs>
        <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity="0.4" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grd)" />
      <path d={path} fill="none" stroke={BRAND} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point */}
      {(() => {
        const [x, y] = norm(data[data.length - 1], data.length - 1);
        return <circle cx={x} cy={y} r="1.8" fill={BRAND} stroke={BG} strokeWidth="0.8" />;
      })()}
    </svg>
  );
}

/* ─── Logo / social proof strip ──────────────────────────────── */
function Logos() {
  const logos = ['Club Almagro', 'Padel Belgrano', 'Boca Tenis', 'Tigre Open', 'Norte Padel Club', 'Recoleta Sports'];
  return (
    <section className="border-y" style={{ borderColor: BORDER_DIM }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <p className="text-[11px] uppercase tracking-[0.2em] shrink-0" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
          Usado por clubes en
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] font-medium" style={{ color: TEXT_DIM }}>
          {logos.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </section>
  );
}

/* ─── Bento grid of features ─────────────────────────────────── */
function Bento() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
            Lo que hace pelotitas
          </p>
          <h2 className="mt-2 text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] leading-[1.1]" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            Cinco apps que reemplazás con una.
          </h2>
          <p className="mt-3 text-[14px]" style={{ color: TEXT_DIM }}>
            Cada feature está pensado para el flujo real de un jugador o de un club, no para
            llenar una tabla comparativa.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {/* Tile — Anotador (big) */}
          <Tile className="sm:col-span-2 sm:row-span-2 min-h-[280px]"
            eyebrow="ANOTADOR"
            title="Punto por punto. Con audit log."
            desc="Apoyá el celu, tap para sumar. Modo Cancha pantalla completa, wake lock, doubles, golden point."
          >
            <MiniScoreboard />
          </Tile>

          {/* Tile — ELO */}
          <Tile eyebrow="RANKING ELO" title="Sube solo." desc="Cada partido recalcula tu rating sin que toques nada.">
            <ElOMini />
          </Tile>

          {/* Tile — Reservas */}
          <Tile eyebrow="RESERVAS" title="30 segundos." desc="Cancha en un tap. Si te faltan jugadores, abrís cupos.">
            <ReservaMini />
          </Tile>

          {/* Tile — Match cards */}
          <Tile eyebrow="MATCH CARDS" title="Para Instagram." desc="Imagen 1200×630 al cerrar el partido. Linkeable y con OG.">
            <CardMini />
          </Tile>

          {/* Tile — Rivalidades */}
          <Tile eyebrow="RIVALIDADES" title="Se arman solas." desc="A los 3 partidos contra el mismo, se crea la rivalry y la cuenta sola.">
            <RivalryMini />
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ children, eyebrow, title, desc, className = '' }: {
  children?: React.ReactNode; eyebrow: string; title: string; desc: string; className?: string;
}) {
  return (
    <div
      className={`relative rounded-xl p-5 overflow-hidden group transition-colors ${className}`}
      style={{ background: PANEL, border: `1px solid ${BORDER}` }}
    >
      <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
        {eyebrow}
      </p>
      <h3 className="mt-1 text-[18px] font-semibold tracking-tight leading-snug" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
        {title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: TEXT_DIM }}>{desc}</p>
      {children && <div className="mt-4">{children}</div>}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `linear-gradient(90deg, transparent, ${BRAND}55, transparent)` }} />
    </div>
  );
}

/* Mini mocks */
function MiniScoreboard() {
  return (
    <div className="rounded-lg p-3 sm:p-4" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
        <span>Set 2 / 3</span>
        <span style={{ color: BRAND }}>● LIVE</span>
      </div>
      <Row name="Diego / Juan"  sets={[6, 4]} pts={40} winning />
      <div className="h-px my-2" style={{ background: BORDER_DIM }} />
      <Row name="Lucas / Pablo" sets={[3, 3]} pts={30} />
    </div>
  );
}
function Row({ name, sets, pts, winning }: { name: string; sets: number[]; pts: number; winning?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: winning ? BRAND : TEXT_FAINT }} />
      <span className="text-[13px] flex-1 truncate" style={{ color: winning ? TEXT : TEXT_DIM, fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>{name}</span>
      {sets.map((s, i) => (
        <span key={i} className="w-5 text-center text-[13px] tabular" style={{ color: winning && i === sets.length - 1 ? BRAND : TEXT_DIM, fontFamily: 'var(--font-mono), monospace' }}>{s}</span>
      ))}
      <span className="w-9 text-right text-[26px] leading-none font-semibold tabular tracking-tight"
            style={{ color: winning ? TEXT : TEXT_DIM, fontFamily: 'var(--font-mono), monospace' }}>{pts}</span>
    </div>
  );
}

function ElOMini() {
  return (
    <div className="rounded-lg p-3" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
      <div className="flex items-end justify-between">
        <p className="text-[28px] font-semibold tabular tracking-tight" style={{ fontFamily: 'var(--font-mono), monospace' }}>1284</p>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,255,63,0.1)', color: BRAND, fontFamily: 'var(--font-mono), monospace' }}>+124</span>
      </div>
      <LineChart />
    </div>
  );
}

function ReservaMini() {
  const slots = ['08:00','09:00','10:00','11:00','12:00','13:00'];
  const taken = [1, 3];
  return (
    <div className="rounded-lg p-3" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>Cancha 3 · Hoy</p>
      <div className="grid grid-cols-3 gap-1">
        {slots.map((s, i) => {
          const isTaken = taken.includes(i);
          const isPick  = i === 2;
          return (
            <div
              key={s}
              className="text-[11px] text-center py-1.5 rounded-md tabular"
              style={{
                background: isPick ? BRAND : isTaken ? 'rgba(255,255,255,0.04)' : PANEL,
                color:      isPick ? BG    : isTaken ? TEXT_FAINT                 : TEXT,
                border:     `1px solid ${isPick ? BRAND : BORDER_DIM}`,
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardMini() {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
      <div className="p-3" style={{ aspectRatio: '1200/630' }}>
        <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.18em]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
          <span>pelotitas.</span><span>PADEL · OFICIAL</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[14px] font-semibold leading-none" style={{ color: BRAND, fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>Diego</span>
          <span className="text-[20px] font-semibold tabular" style={{ color: BRAND, fontFamily: 'var(--font-mono), monospace' }}>6 3 6</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[14px] font-semibold leading-none" style={{ color: TEXT_DIM, fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>Lucas</span>
          <span className="text-[20px] font-semibold tabular" style={{ color: TEXT_DIM, fontFamily: 'var(--font-mono), monospace' }}>4 6 3</span>
        </div>
        <p className="text-[8px] uppercase tracking-[0.22em] mt-2" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>anotalo en pelotitas</p>
      </div>
    </div>
  );
}

function RivalryMini() {
  return (
    <div className="rounded-lg p-3" style={{ background: PANEL_2, border: `1px solid ${BORDER_DIM}` }}>
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>Diego vs Lucas</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>VOS</p>
          <p className="text-[28px] font-semibold tabular leading-none" style={{ color: BRAND, fontFamily: 'var(--font-mono), monospace' }}>4</p>
        </div>
        <span className="text-[18px]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>—</span>
        <div className="text-right">
          <p className="text-[10px]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>ÉL</p>
          <p className="text-[28px] font-semibold tabular leading-none" style={{ color: TEXT_DIM, fontFamily: 'var(--font-mono), monospace' }}>2</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {['W','W','L','W','W','L','W','W'].map((r, i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: r === 'W' ? BRAND : 'rgba(255,122,77,0.5)' }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Second split section ──────────────────────────────────── */
function SecondSplit() {
  return (
    <section id="anotador" className="relative py-20 sm:py-24 border-t" style={{ borderColor: BORDER_DIM }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
            Match insights · 02
          </p>
          <h2 className="mt-2 text-[28px] sm:text-[40px] font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            Cada partido te dice algo nuevo.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: TEXT_DIM }}>
            El anotador genera el data set sin que pienses en él. Después aparece todo:
            tu performance contra cada rival, racha activa, win-rate por cancha, tendencia
            de ELO de las últimas semanas. Pro Player desbloquea histórico ilimitado.
          </p>

          <ul className="mt-6 space-y-2.5 text-[13px]">
            {[
              'Head-to-head completo y compartible',
              'Win-rate por sport / club / superficie',
              'Tendencia de ELO con K-factor adaptativo',
              'Match cards exportables sin watermark (Pro)',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5" style={{ color: TEXT_DIM }}>
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BRAND }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <Link href="/register" className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-md" style={{ background: TEXT, color: BG }}>
            Probar gratis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Stats panel */}
        <div className="rounded-xl p-5" style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
              Insights · Diego · Padel
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: TEXT_DIM, border: `1px solid ${BORDER_DIM}` }}>
              30d
            </span>
          </div>

          {/* Distribution bars */}
          <div className="space-y-2.5">
            {[
              { l: 'Lucas',  w: 7, lo: 2 },
              { l: 'Pablo',  w: 4, lo: 1 },
              { l: 'Sofia',  w: 3, lo: 3 },
              { l: 'Carlos', w: 2, lo: 4 },
            ].map((r) => {
              const total = r.w + r.lo;
              const wRatio = (r.w / total) * 100;
              return (
                <div key={r.l}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span style={{ color: TEXT }}>{r.l}</span>
                    <span style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>{r.w}-{r.lo}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex" style={{ background: BORDER_DIM }}>
                    <span style={{ background: BRAND, width: `${wRatio}%` }} />
                    <span style={{ background: CLAY, width: `${100 - wRatio}%`, opacity: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t grid grid-cols-3 gap-3 text-center" style={{ borderColor: BORDER_DIM }}>
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>Sets won</p>
              <p className="text-[20px] font-semibold tabular" style={{ fontFamily: 'var(--font-mono), monospace' }}>34</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>Best streak</p>
              <p className="text-[20px] font-semibold tabular" style={{ color: BRAND, fontFamily: 'var(--font-mono), monospace' }}>9W</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>Avg dur.</p>
              <p className="text-[20px] font-semibold tabular" style={{ fontFamily: 'var(--font-mono), monospace' }}>74m</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats row ──────────────────────────────────────────────── */
function StatsRow() {
  const stats = [
    { v: '0%',   l: 'Comisión' },
    { v: '30s',  l: 'En registrarte' },
    { v: '8.3k', l: 'Jugadores online' },
    { v: '18k',  l: 'Sets hoy' },
  ];
  return (
    <section className="border-y" style={{ borderColor: BORDER_DIM }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.l}>
            <p className="text-[28px] sm:text-[32px] font-semibold tabular tracking-tight" style={{ fontFamily: 'var(--font-mono), monospace' }}>{s.v}</p>
            <p className="text-[11px] uppercase tracking-[0.2em] mt-1" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────── */
function Cta() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
          Empezá hoy
        </p>
        <h2 className="mt-2 text-[34px] sm:text-[48px] font-semibold tracking-[-0.025em] leading-[1.08]" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
          Tu primer partido te toma{' '}
          <span style={{ background: 'linear-gradient(90deg, #D4FF3F 0%, #6BA9FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            30 segundos
          </span>.
        </h2>
        <p className="mt-4 text-[14px]" style={{ color: TEXT_DIM }}>
          Cuenta gratis. Sin tarjeta. El anotador y el ranking ELO incluidos.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link href="/register" className="inline-flex items-center gap-1.5 text-[14px] font-medium px-4 py-2.5 rounded-md" style={{ background: TEXT, color: BG }}>
            Crear cuenta gratis <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/billing" className="inline-flex items-center gap-1.5 text-[14px] font-medium px-4 py-2.5 rounded-md hover:bg-white/[0.04] transition-colors" style={{ color: TEXT_DIM, border: `1px solid ${BORDER}` }}>
            <Sparkles className="w-3.5 h-3.5" /> Ver Pro Player
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: BORDER_DIM }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10 flex flex-wrap items-center justify-between gap-4">
        <Link href="/v4" className="text-[14px] font-semibold">
          pelotitas<span style={{ color: BRAND }}>.</span>
        </Link>
        <p className="text-[11px]" style={{ color: TEXT_FAINT, fontFamily: 'var(--font-mono), monospace' }}>
          © 2026 · Pelotitas OS · Buenos Aires
        </p>
        <div className="flex items-center gap-3 text-[12px]" style={{ color: TEXT_DIM }}>
          <Link href="/terms"   className="hover:text-white">Términos</Link>
          <Link href="/privacy" className="hover:text-white">Privacidad</Link>
          <span style={{ color: TEXT_FAINT }}>·</span>
          <Link href="/"   className="hover:text-white">A</Link>
          <Link href="/v2" className="hover:text-white">B</Link>
          <Link href="/v3" className="hover:text-white">C</Link>
        </div>
      </div>
    </footer>
  );
}
