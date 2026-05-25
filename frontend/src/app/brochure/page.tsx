import type { Metadata } from 'next';
import Link from 'next/link';
import LeadForm from './LeadForm';
import WhatsAppMockup from './WhatsAppMockup';

export const metadata: Metadata = {
  title: 'Pelotitas — el club, en automático',
  description:
    'Reservas, recordatorios por WhatsApp, torneos, ranking ELO y app mobile. Sin comisión. Setup en 1 día.',
  openGraph: {
    title: 'Pelotitas · tu club en automático',
    description:
      'WhatsApp para confirmar reservas, recordar partidos y anunciar al grupo. Más torneos, menos no-shows, cero papel.',
    type: 'website',
  },
};

const WA_USES = [
  {
    tag: '🎾 Confirmación al reservar',
    desc: 'Tu jugador toca "Reservar" y le llega el WhatsApp al toque con día, hora, cancha y precio. Cero llamadas para confirmar.',
  },
  {
    tag: '⏰ Recordatorio 2hs antes',
    desc: 'Mensaje automático antes del partido. Si no puede ir, cancela desde el link y la cancha vuelve a estar disponible.',
  },
  {
    tag: '🏆 ¿Quién ganó?',
    desc: 'Apenas termina el partido, los dos jugadores reciben el prompt para cargar el score. El ranking ELO se actualiza solo.',
  },
  {
    tag: '📣 Anuncios al grupo',
    desc: '¿Lanzaste torneo, abriste un horario, cerraste por lluvia? Un click y le llega a todos los socios.',
  },
];

const FEATURES: { icon: string; title: string; desc: string; accent: string }[] = [
  {
    icon: '📅',
    title: 'Llená tu cancha 24/7',
    desc: 'Slot picker semanal con disponibilidad real. Reservas recurrentes, alternativas automáticas y lista de espera.',
    accent: 'var(--v5-lime)',
  },
  {
    icon: '⏰',
    title: 'Cero no-shows',
    desc: 'Recordatorios por WhatsApp 2hs antes. Si no van, la cancha vuelve a aparecer libre en segundos.',
    accent: 'var(--v5-yellow)',
  },
  {
    icon: '🏆',
    title: 'Torneos en 5 minutos',
    desc: 'Configurás el torneo y Pelotitas arma el fixture, abre inscripciones online y actualiza los cuadros solo.',
    accent: 'var(--v5-orange)',
  },
  {
    icon: '📊',
    title: 'Score en vivo, sin papel',
    desc: 'Anotador punto-a-punto profesional. Cada partido genera un link público que tus jugadores comparten.',
    accent: 'var(--v5-sky)',
  },
  {
    icon: '📈',
    title: 'Ranking ELO automático',
    desc: 'Cada partido oficial mueve el ELO por deporte. Categorías sugeridas según el puntaje. Tus jugadores compiten más.',
    accent: 'var(--v5-pink)',
  },
  {
    icon: '🌐',
    title: 'Tu club tiene URL propia',
    desc: 'Landing pública chromeless con fotos, video, horarios, mapa, WhatsApp y botón de reserva. SEO incluido.',
    accent: 'var(--v5-cream)',
  },
  {
    icon: '🧑‍🏫',
    title: 'Profesores con agenda',
    desc: 'Coaches conectados al club, clases reservables, reviews verificadas y comisión configurable.',
    accent: 'var(--v5-lime)',
  },
  {
    icon: '📝',
    title: 'Historial de cada jugador',
    desc: 'Match log público + privado. Cada jugador tiene su perfil con ELO, estadísticas y partidos jugados.',
    accent: 'var(--v5-yellow)',
  },
  {
    icon: '📱',
    title: 'App mobile real',
    desc: 'Misma plataforma como PWA + iOS + Android. Notificaciones push nativas, sin instalar nada del Play Store.',
    accent: 'var(--v5-orange)',
  },
  {
    icon: '💳',
    title: 'Cobrá con Stripe',
    desc: 'Activá pagos online por reserva (opcional). Cobrás antes y bajás los no-shows aún más.',
    accent: 'var(--v5-sky)',
  },
  {
    icon: '🤝',
    title: 'Multi-complejo',
    desc: 'Un dueño con varios clubes, jugadores que también son coaches, organizadores externos. Roles flexibles.',
    accent: 'var(--v5-pink)',
  },
  {
    icon: '🔒',
    title: 'Tus jugadores, tus reglas',
    desc: 'DNI verificado, email confirmado, modo "solo socios conectados". Vos decidís quién puede reservar.',
    accent: 'var(--v5-cream)',
  },
];

const STEPS = [
  { n: '01', t: 'Llamada de 15 min', d: 'Te mostramos la app en vivo con tu club como ejemplo. Entendés todo en una sentada.' },
  { n: '02', t: 'Activamos tu complejo', d: 'Cargamos canchas, horarios, fotos y los primeros jugadores. Lo dejamos andando en menos de 1 día.' },
  { n: '03', t: 'Tu club empieza a girar', d: 'Reservas online, recordatorios automáticos, torneos en click y ranking actualizándose solo.' },
];

const INCLUDED = [
  'Sin comisión por reserva',
  'Sin límite de canchas',
  'Sin límite de jugadores',
  'WhatsApp incluido',
  'Onboarding completo',
  'Soporte en español',
];

const TESTIMONIALS = [
  {
    quote: '“De 60% a 95% de ocupación en 2 meses. El recordatorio por WhatsApp solo ya pagó el costo.”',
    name: 'Martín · Dueño',
    club: 'Club Padel Centro',
    accent: 'var(--v5-lime)',
  },
  {
    quote: '“Antes me pasaba 2hs al día contestando mensajes para reservar. Ahora son cero.”',
    name: 'Carla · Gestora',
    club: 'Norte Tenis & Padel',
    accent: 'var(--v5-pink)',
  },
  {
    quote: '“Los torneos los armaba en planilla. Ahora subo los inscriptos y el fixture sale solo.”',
    name: 'Lucas · Organizador',
    club: 'Liga del Sur',
    accent: 'var(--v5-yellow)',
  },
];

const FAQS = [
  {
    q: '¿Cuánto cuesta?',
    a: 'Tarifa mensual por complejo, sin comisión por reserva. El plan se ajusta a la cantidad de canchas. Lo charlamos en la demo.',
  },
  {
    q: '¿Cuánto demora arrancar?',
    a: 'Menos de 1 día. Te configuramos canchas, horarios, fotos e importamos tu agenda actual desde Excel o Google Calendar.',
  },
  {
    q: '¿Mis jugadores tienen que bajar una app?',
    a: 'No. Funciona como PWA — se instala desde el navegador en 5 segundos. También está como app nativa iOS/Android para los que prefieran.',
  },
  {
    q: '¿WhatsApp es de verdad o son SMS disfrazados?',
    a: 'WhatsApp real, vía API oficial. Tus jugadores reciben los mensajes en su WhatsApp como si los mandaras desde tu número.',
  },
  {
    q: '¿Y si quiero algo que no veo en la lista?',
    a: 'Decinos en el formulario qué te gustaría. Construimos features priorizando lo que más nos piden los clubes activos.',
  },
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
          Quiero verlo
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </a>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-14">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="v5-hero-card p-8 sm:p-14 relative overflow-hidden mb-12">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.24em] mb-5"
            style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}
          >
            Pelotitas · para clubes de padel y tenis
          </p>
          <h1
            className="font-bold uppercase tracking-[-0.035em] leading-[0.88]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(44px, 8vw, 96px)',
              color: 'var(--v5-cream)',
            }}
          >
            TU CLUB,
            <br />
            EN <span style={{ color: 'var(--v5-yellow)' }}>AUTOMÁTICO.</span>
          </h1>
          <p
            className="mt-7 text-[16px] sm:text-[18px] max-w-2xl leading-relaxed"
            style={{ color: 'rgba(242,237,222,0.85)' }}
          >
            Reservas que se confirman <strong style={{ color: 'var(--v5-cream)' }}>por WhatsApp</strong>.
            Recordatorios antes del partido para que nadie falte. Torneos en 5 minutos. Ranking que
            se actualiza solo. <strong style={{ color: 'var(--v5-cream)' }}>Sin comisión por reserva.</strong>
          </p>

          {/* Stat strip */}
          <div
            className="mt-10 pt-7 grid grid-cols-2 sm:grid-cols-4 gap-3"
            style={{ borderTop: '1px solid #5C3320' }}
          >
            {[
              { l: 'Comisión', v: '0%' },
              { l: 'Setup', v: '< 1 día' },
              { l: 'Notificaciones', v: 'WhatsApp' },
              { l: 'Deportes', v: 'Padel · Tenis' },
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
              href="#whatsapp"
              className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
              style={{
                background: '#25D366',
                color: '#073B22',
              }}
            >
              Ver WhatsApp en acción
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: '#fff', color: '#25D366' }}
              >
                ↓
              </span>
            </a>
          </div>
        </section>

        {/* ── WhatsApp spotlight ───────────────────────────────────── */}
        <section
          id="whatsapp"
          className="scroll-mt-10 mb-14 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #DCEC9D 0%, #C7DE7B 100%)',
            borderRadius: 36,
          }}
        >
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 p-8 sm:p-12 items-center">
            <div>
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-5"
                style={{ background: '#073B22', color: '#fff', fontFamily: 'var(--font-mono), monospace' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#25D366' }} />
                WhatsApp · siempre encendido
              </span>
              <h2
                className="font-bold uppercase tracking-[-0.03em] leading-[0.95]"
                style={{
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 'clamp(34px, 5vw, 56px)',
                  color: '#2E3B0A',
                }}
              >
                Tus jugadores no se olvidan más.
              </h2>
              <p
                className="mt-5 text-[15px] sm:text-[16px] leading-relaxed max-w-lg"
                style={{ color: '#3D4F12' }}
              >
                Confirmás reservas, recordás partidos, preguntás quién ganó y avisás al grupo —
                <strong> sin abrir WhatsApp ni una vez</strong>. Pelotitas lo hace por vos.
              </p>

              <ul className="mt-7 space-y-4">
                {WA_USES.map((u) => (
                  <li key={u.tag}>
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1"
                      style={{ color: '#2E3B0A', fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {u.tag}
                    </p>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: '#3D4F12' }}>
                      {u.desc}
                    </p>
                  </li>
                ))}
              </ul>

              <a
                href="#contacto"
                className="mt-8 inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
                style={{ background: '#073B22', color: '#DCEC9D' }}
              >
                Activarlo en mi club
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                  style={{ background: '#25D366', color: '#fff' }}
                >
                  →
                </span>
              </a>
            </div>
            <div className="flex justify-center">
              <WhatsAppMockup />
            </div>
          </div>
        </section>

        {/* ── Features grid ────────────────────────────────────────── */}
        <section id="features" className="mb-14 scroll-mt-10">
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              12 funcionalidades integradas
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
              Todo lo que tu club necesita.
              <br />
              <span style={{ color: 'var(--v5-ink-2)' }}>En una sola app.</span>
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

        {/* ── Testimonials ─────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Los clubes lo cuentan así
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
              Por qué prueban Pelotitas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 flex flex-col justify-between"
                style={{ background: t.accent, color: 'var(--v5-ink)', borderRadius: 28, minHeight: 220 }}
              >
                <p
                  className="font-bold leading-snug"
                  style={{
                    fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                    fontSize: 18,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {t.quote}
                </p>
                <div className="mt-6">
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ opacity: 0.7, fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {t.club}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
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
              De la llamada al primer partido — 1 día.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="p-6 relative"
                style={{
                  background:
                    i === 0
                      ? 'var(--v5-orange)'
                      : i === 1
                        ? 'var(--v5-yellow)'
                        : 'var(--v5-lime)',
                  color: 'var(--v5-ink)',
                  borderRadius: 28,
                }}
              >
                <p
                  className="font-bold leading-none tracking-[-0.04em]"
                  style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 48, opacity: 0.55 }}
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
                  {s.t}
                </h3>
                <p className="text-[13px] mt-2 leading-relaxed" style={{ opacity: 0.82 }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What's included ──────────────────────────────────────── */}
        <section className="mb-14">
          <div
            className="p-8 sm:p-10"
            style={{
              background: 'var(--v5-brown)',
              color: 'var(--v5-cream)',
              borderRadius: 32,
            }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em] mb-3"
              style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Todo incluido — sin asteriscos
            </p>
            <h2
              className="font-bold uppercase tracking-[-0.025em] leading-[0.95] mb-6"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                fontSize: 'clamp(28px, 4.5vw, 44px)',
                color: 'var(--v5-cream)',
              }}
            >
              No te cobramos por reserva. Nunca.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INCLUDED.map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full flex-none"
                    style={{ background: 'var(--v5-lime)', color: 'var(--v5-lime-ink)' }}
                  >
                    ✓
                  </span>
                  <p className="text-[14px] font-medium">{i}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Lo que más nos preguntan
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
              Preguntas frecuentes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="p-5"
                style={{
                  background: 'var(--v5-card-bg)',
                  border: '1px solid var(--v5-paper-2)',
                  borderRadius: 24,
                }}
              >
                <h3
                  className="font-bold leading-tight"
                  style={{
                    fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                    fontSize: 17,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {f.q}
                </h3>
                <p className="text-[13.5px] mt-2 leading-relaxed" style={{ color: 'var(--v5-ink-2)' }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Lead form ────────────────────────────────────────────── */}
        <section id="contacto" className="mb-12 scroll-mt-10">
          <div className="mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              Tu turno
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
              Te llamamos hoy mismo.
            </h2>
            <p className="mt-4 text-[14px] max-w-xl" style={{ color: 'var(--v5-ink-2)' }}>
              Dejá tu email y un teléfono. Te llamamos en menos de 24hs hábiles para coordinar una
              demo personalizada. Si hay algo que no viste en el brochure, contanos en el
              comentario — nos sirve un montón para priorizar.
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
              Ver complejos en pelotitas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
