import type { Metadata } from 'next';
import Link from 'next/link';
import LeadForm from './LeadForm';

export const metadata: Metadata = {
  title: 'Pelotitas — el sistema operativo de tu club de padel y tenis',
  description:
    'Reservas, torneos, anotador en vivo, ranking ELO, app mobile y landing pública para tu complejo. Probalo gratis.',
  openGraph: {
    title: 'Pelotitas — gestioná tu club entero desde un solo lugar',
    description:
      'Reservas sin comisión, anotador profesional, torneos automáticos y mucho más. Pedí una demo.',
    type: 'website',
  },
};

const FEATURES: { icon: string; title: string; desc: string; accent: string }[] = [
  {
    icon: '📅',
    title: 'Reservas con disponibilidad real',
    desc: 'Slot picker semanal por cancha, recurrentes, alternativas automáticas y lista de espera.',
    accent: 'var(--v5-lime)',
  },
  {
    icon: '🏆',
    title: 'Torneos con fixture automático',
    desc: 'Fase de grupos + eliminación, inscripciones online, cuadros que se actualizan solos.',
    accent: 'var(--v5-yellow)',
  },
  {
    icon: '📊',
    title: 'Anotador en vivo punto a punto',
    desc: 'Audit log completo, score sincronizado al torneo, links públicos para compartir resultados.',
    accent: 'var(--v5-orange)',
  },
  {
    icon: '📈',
    title: 'Ranking ELO automático',
    desc: 'Cada partido oficial mueve el ELO por deporte. Categorías sugeridas según puntaje.',
    accent: 'var(--v5-sky)',
  },
  {
    icon: '🌐',
    title: 'Landing pública del complejo',
    desc: 'Una URL chromeless con fotos, video, horarios, mapa, WhatsApp y reserva en un click.',
    accent: 'var(--v5-pink)',
  },
  {
    icon: '🧑‍🏫',
    title: 'Profesores con agenda y reviews',
    desc: 'Coaches conectados al club, clases reservables y opiniones verificadas de alumnos.',
    accent: 'var(--v5-cream)',
  },
  {
    icon: '📝',
    title: 'Match log y conexiones',
    desc: 'Diario privado de partidos con rival "fantasma" + red de jugadores conectados al club.',
    accent: 'var(--v5-lime)',
  },
  {
    icon: '💬',
    title: 'Notificaciones por WhatsApp',
    desc: 'Recordatorios de turno, confirmaciones de torneo y avisos de cancha lista. Opt-in.',
    accent: 'var(--v5-yellow)',
  },
  {
    icon: '📱',
    title: 'App mobile (PWA + iOS/Android)',
    desc: 'Mismo código, instalable desde el navegador o de las stores. Push notifications nativas.',
    accent: 'var(--v5-orange)',
  },
  {
    icon: '🤝',
    title: 'Multi-complejo + multi-rol',
    desc: 'Un dueño con varios clubes, jugadores que también son coaches, organizadores externos.',
    accent: 'var(--v5-sky)',
  },
  {
    icon: '🔒',
    title: 'Identidad + verificación',
    desc: 'DNI único por usuario, email verificado, control de quién reserva (abierto o conectados).',
    accent: 'var(--v5-pink)',
  },
  {
    icon: '💳',
    title: 'Pagos con Stripe (privacy & premium)',
    desc: 'Suscripciones para destrabar features pro: stats avanzadas, IG embeds, sin anuncios.',
    accent: 'var(--v5-cream)',
  },
];

const STEPS = [
  { n: '01', title: 'Te pedimos 15 minutos', desc: 'Llamada o demo en vivo. Te mostramos la app real con datos.' },
  { n: '02', title: 'Cargamos tu complejo', desc: 'Subimos fotos, canchas, horarios y precios. En 1 día queda activo.' },
  { n: '03', title: 'Empezás a operar', desc: 'Tus jugadores reservan, anotás partidos, generás torneos. Sin comisión.' },
];

export default function BrochurePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--v5-paper)', color: 'var(--v5-ink)' }}>
      {/* Top bar */}
      <header
        className="px-5 sm:px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--v5-paper-2)' }}
      >
        <Link
          href="/"
          className="text-[20px] font-bold tracking-[-0.025em]"
          style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}
        >
          PELOTITAS<span style={{ color: 'var(--v5-orange)' }}>.</span>
        </Link>
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
        >
          Pedir demo
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </a>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-14">
        {/* Hero */}
        <section className="v5-hero-card p-8 sm:p-14 relative overflow-hidden mb-12">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.24em] mb-5"
            style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}
          >
            Pelotitas · brochure 2026
          </p>
          <h1
            className="font-bold uppercase tracking-[-0.035em] leading-[0.88]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(40px, 7vw, 88px)',
              color: 'var(--v5-cream)',
            }}
          >
            EL SISTEMA <span style={{ color: 'var(--v5-yellow)' }}>OPERATIVO</span>
            <br />
            DE TU CLUB.
          </h1>
          <p
            className="mt-7 text-[15px] sm:text-[17px] max-w-2xl leading-relaxed"
            style={{ color: 'rgba(242,237,222,0.82)' }}
          >
            Reservas, torneos, anotador en vivo, ranking ELO, landing pública del complejo y app
            mobile — todo en un solo lugar, sin comisión por reserva.
          </p>

          {/* Quick stats */}
          <div
            className="mt-10 pt-7 grid grid-cols-2 sm:grid-cols-4 gap-3"
            style={{ borderTop: '1px solid #5C3320' }}
          >
            {[
              { l: 'Features integradas', v: '12+' },
              { l: 'Deportes', v: 'Padel · Tenis' },
              { l: 'Setup del club', v: '< 1 día' },
              { l: 'Comisión por reserva', v: '0%' },
            ].map((s) => (
              <div key={s.l}>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(242,237,222,0.55)', fontFamily: 'var(--font-mono), monospace' }}
                >
                  {s.l}
                </p>
                <p
                  className="font-bold tabular leading-none mt-1.5 tracking-[-0.04em]"
                  style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 28, color: 'var(--v5-cream)' }}
                >
                  {s.v}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-9 flex items-center gap-3 flex-wrap">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
              style={{ background: 'var(--v5-cream)', color: 'var(--v5-brown)' }}
            >
              Pedir demo gratis
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
              >
                →
              </span>
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
              style={{
                background: 'transparent',
                color: 'var(--v5-cream)',
                border: '1.5px solid rgba(242,237,222,0.35)',
              }}
            >
              Ver funcionalidades
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: 'var(--v5-yellow)', color: 'var(--v5-ink)' }}
              >
                ↓
              </span>
            </a>
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="mb-14 scroll-mt-10">
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Funcionalidades
            </p>
            <h2
              className="font-bold mt-1"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                fontSize: 'clamp(28px, 4vw, 44px)',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}
            >
              Todo lo que tu club necesita
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-5"
                style={{
                  background: 'var(--v5-card-bg)',
                  border: '1px solid var(--v5-paper-2)',
                  borderRadius: 24,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: f.accent }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-bold leading-tight"
                  style={{
                    fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                    fontSize: 18,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.title}
                </h3>
                <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'var(--v5-ink-2)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-14">
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Cómo arrancás
            </p>
            <h2
              className="font-bold mt-1"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                fontSize: 'clamp(28px, 4vw, 44px)',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}
            >
              En 3 pasos
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="p-6"
                style={{
                  background:
                    i === 0
                      ? 'var(--v5-lime)'
                      : i === 1
                        ? 'var(--v5-pink)'
                        : 'var(--v5-yellow)',
                  color: 'var(--v5-ink)',
                  borderRadius: 28,
                }}
              >
                <p
                  className="font-bold leading-none tracking-[-0.04em]"
                  style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 48, opacity: 0.6 }}
                >
                  {s.n}
                </p>
                <h3
                  className="font-bold mt-3 leading-tight"
                  style={{
                    fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                    fontSize: 22,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {s.title}
                </h3>
                <p className="text-[13px] mt-2 leading-relaxed" style={{ opacity: 0.78 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Lead form */}
        <section id="contacto" className="mb-12 scroll-mt-10">
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Pedí la demo
            </p>
            <h2
              className="font-bold mt-1"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                fontSize: 'clamp(28px, 4vw, 44px)',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}
            >
              Te contactamos en menos de 24hs
            </h2>
            <p className="mt-4 text-[14px] max-w-xl" style={{ color: 'var(--v5-ink-2)' }}>
              Dejanos tu email y un teléfono. Si hay alguna funcionalidad que no viste y la
              necesitás, contanos en el comentario — nos sirve un montón para priorizar.
            </p>
          </div>
          <LeadForm />
        </section>

        {/* Footer */}
        <div
          className="mt-14 pt-8 text-center"
          style={{ borderTop: '1px solid var(--v5-paper-2)' }}
        >
          <p
            className="text-[12px] font-bold uppercase tracking-[0.18em]"
            style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
          >
            Pelotitas · brochure.pelotitas.com
          </p>
          <div className="mt-6 flex items-center justify-center gap-5 flex-wrap">
            <Link
              href="/"
              className="text-[12px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              ← Ir a la app
            </Link>
            <Link
              href="/c"
              className="text-[12px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Ver complejos cargados
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
