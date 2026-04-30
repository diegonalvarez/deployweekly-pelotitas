'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Trophy,
  Swords,
  GraduationCap,
  BarChart3,
  Building2,
  Users,
  Check,
  Zap,
  Activity,
  Shield,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   Hooks
   ════════════════════════════════════════════════════════════ */
function useCountUp(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.floor(eased * end));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

function FadeIn({
  children,
  delay = 0,
  className = '',
  as = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'header';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Tag: any = as;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out-expo ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ════════════════════════════════════════════════════════════
   Data
   ════════════════════════════════════════════════════════════ */

const features = [
  {
    icon: <CalendarCheck className="w-5 h-5" />,
    label: '01',
    title: 'Reservas que no piden permiso',
    desc: 'Reservá una cancha en menos de 30 segundos. Sin formularios, sin llamadas. Pago directo al club.',
    accent: 'brand',
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    label: '02',
    title: 'Torneos con producción real',
    desc: 'Grupos, llaves eliminatorias, rankings, brackets en vivo. La logística la hacemos nosotros.',
    accent: 'clay',
  },
  {
    icon: <Swords className="w-5 h-5" />,
    label: '03',
    title: 'Matchmaking por nivel',
    desc: 'Algoritmo ELO específico para padel y tenis. Encontrá rivales que te empujen — no que te apaguen.',
    accent: 'sky',
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    label: '04',
    title: 'Profesores certificados',
    desc: 'Conectá con profes verificados, agendá clases recurrentes y trackeá tu progreso técnico.',
    accent: 'brand',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: '05',
    title: 'Stats que te hacen mejor',
    desc: 'ELO en vivo, head-to-head, win rate por superficie. Cada partido construye tu perfil real.',
    accent: 'sky',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    label: '06',
    title: 'Operación para complejos',
    desc: 'Dashboard con métricas en vivo, gestión de canchas, profesores y comunidad. Sin comisión.',
    accent: 'clay',
  },
];

const personas = [
  {
    key: 'player',
    label: 'Jugador',
    headline: 'Reservá. Competí. Subí.',
    desc: 'Tu calendario, tus rivales, tu ranking. Todo orientado a hacerte mejor jugador.',
    bullets: ['Reservas instantáneas', 'Matchmaking ELO', 'Stats personales', 'Logros y ranking'],
    color: 'brand',
    cta: '/register?role=player',
  },
  {
    key: 'coach',
    label: 'Profesor',
    headline: 'Construí tu agenda.',
    desc: 'Agenda de clases, lista de alumnos, pagos y seguimiento — sin Excel ni WhatsApp.',
    bullets: ['Agenda recurrente', 'Lista de alumnos', 'Reservas con clubes', 'Pagos integrados'],
    color: 'sky',
    cta: '/register?role=coach',
  },
  {
    key: 'club',
    label: 'Complejo',
    headline: 'Operá tu club desde un panel.',
    desc: 'Tus canchas, tus reservas, tus torneos, tus profes — todo en tiempo real.',
    bullets: ['Dashboard en vivo', 'Sin comisión', 'Aprobá reservas', 'Crea torneos'],
    color: 'clay',
    cta: '/register?role=club',
  },
  {
    key: 'organizer',
    label: 'Organizador',
    headline: 'Producí torneos serios.',
    desc: 'Inscripciones, llaves, brackets, rankings — la herramienta para correr competencias profesionales.',
    bullets: ['Llaves automáticas', 'Bracket en vivo', 'Cobro inscripciones', 'Premiación'],
    color: 'brand',
    cta: '/register?role=organizer',
  },
];

const numbers = [
  { value: 50,   suffix: '+', label: 'Complejos' },
  { value: 2000, suffix: '+', label: 'Jugadores' },
  { value: 100,  suffix: '+', label: 'Torneos' },
  { value: 5000, suffix: '+', label: 'Reservas' },
];

const clubBenefits = [
  'Publicar canchas y horarios',
  'Recibir reservas online 24/7',
  'Crear y gestionar torneos sin límite',
  'Invitar profesores al staff',
  'Métricas de ocupación en tiempo real',
  'Comunidad activa de jugadores cercanos',
];

const faqs = [
  {
    q: '¿Cuánto cuesta usar pelotitas?',
    a: 'Para jugadores y profesores, gratis. Para complejos, también — no cobramos comisión por reservas. Si después querés funciones avanzadas (reportes, marketing, branding) hay un plan pago opcional.',
  },
  {
    q: '¿Cómo funciona el ranking ELO?',
    a: 'Cada partido oficial suma o resta puntos según el rival y el resultado. El sistema diferencia padel y tenis y refleja tu nivel real, no el que vos creés tener.',
  },
  {
    q: '¿Puedo organizar torneos sin tener club?',
    a: 'Sí. El rol de Organizador te permite crear torneos en clubes asociados, manejar inscripciones, llaves y premiación.',
  },
  {
    q: '¿Y si mi club no está en pelotitas?',
    a: 'Cualquier complejo puede registrarse en minutos. Si te interesa que tu club esté, escribinos y nos contactamos directo.',
  },
];

const tickerItems = [
  '247 partidos en juego ahora',
  '1.4k jugadores online',
  '32 torneos esta semana',
  '8 clubes nuevos este mes',
  '15.6k matches jugados',
  '94% reservas completadas',
];

/* ════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════ */

function PersonaTabs() {
  const [active, setActive] = useState(0);
  const persona = personas[active];
  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      {/* Tabs */}
      <div className="flex lg:flex-col gap-1.5 overflow-x-auto scrollbar-none lg:overflow-visible">
        {personas.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setActive(i)}
            className={`shrink-0 lg:shrink lg:w-full text-left px-4 py-3 rounded-lg border transition-all ${
              i === active
                ? 'bg-surface border-border-default'
                : 'bg-transparent border-transparent hover:bg-surface-light/40'
            }`}
          >
            <p className={`text-2xs uppercase font-semibold tracking-widest mb-1 ${
              i === active ? 'text-brand' : 'text-text-muted'
            }`} style={{ letterSpacing: '0.12em' }}>
              0{i + 1} / {personas.length < 10 ? `0${personas.length}` : personas.length}
            </p>
            <p className={`text-sm font-semibold ${i === active ? 'text-text-primary' : 'text-text-secondary'}`}>
              {p.label}
            </p>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="card-elevated min-h-[320px] flex flex-col justify-between">
        <div>
          <p className={`eyebrow mb-4 ${
            persona.color === 'brand' ? 'text-brand' :
            persona.color === 'sky'   ? 'text-sky'   :
            'text-clay'
          }`}>
            Para {persona.label.toLowerCase()}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight-2 mb-3">
            {persona.headline}
          </h3>
          <p className="text-text-secondary max-w-lg leading-relaxed">{persona.desc}</p>

          <div className="grid grid-cols-2 gap-2 mt-6">
            {persona.bullets.map((b) => (
              <div key={b} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  persona.color === 'brand' ? 'bg-brand' :
                  persona.color === 'sky'   ? 'bg-sky'   :
                  'bg-clay'
                }`} />
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-dark flex items-center justify-between">
          <Link href={persona.cta} className="btn-primary group">
            Empezar como {persona.label.toLowerCase()}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-2xs text-text-muted uppercase tracking-widest">
            30 segundos · gratis
          </span>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={`border rounded-xl transition-all ${
            isOpen ? 'border-border-default bg-surface' : 'border-border-dark bg-transparent'
          }`}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm sm:text-base font-medium text-text-primary">{f.q}</span>
              <span className={`shrink-0 w-7 h-7 rounded-md border flex items-center justify-center transition-all ${
                isOpen ? 'border-brand/40 bg-brand/10 text-brand' : 'border-border-dark text-text-muted'
              }`}>
                {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${
              isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  /* Counters — keep at top to avoid hooks-in-loop */
  const c1 = useCountUp(50);
  const c2 = useCountUp(2000);
  const c3 = useCountUp(100);
  const c4 = useCountUp(5000);
  const heroCounters = [
    { ...c1, suffix: '+', label: 'Complejos' },
    { ...c2, suffix: '+', label: 'Jugadores' },
    { ...c3, suffix: '+', label: 'Torneos' },
    { ...c4, suffix: '+', label: 'Reservas' },
  ];
  const numbersC1 = useCountUp(50);
  const numbersC2 = useCountUp(2000);
  const numbersC3 = useCountUp(100);
  const numbersC4 = useCountUp(5000);
  const numbersCounters = [numbersC1, numbersC2, numbersC3, numbersC4];

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════
          HERO — editorial, asymmetric, big type
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-20">
        {/* Background — court grid + gradient blobs */}
        <div className="absolute inset-0 bg-court-grid opacity-50 pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-[700px] h-[700px] rounded-full opacity-25 blur-3xl animate-float-slow"
            style={{
              background: 'radial-gradient(circle, rgba(212,255,63,0.4) 0%, transparent 65%)',
              top: '-10%',
              left: '-15%',
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(255,92,43,0.35) 0%, transparent 65%)',
              bottom: '-15%',
              right: '-10%',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl animate-float-delayed"
            style={{
              background: 'radial-gradient(circle, rgba(107,169,255,0.4) 0%, transparent 70%)',
              top: '40%',
              right: '20%',
            }}
          />
        </div>

        {/* Live status pill — top */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/60 backdrop-blur-md border border-border-dark text-2xs font-medium text-text-secondary">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60" />
                <span className="relative rounded-full bg-brand w-1.5 h-1.5" />
              </span>
              <span className="text-text-primary tabular">247</span> partidos en juego ahora
              <span className="text-text-muted mx-1">·</span>
              <span className="text-text-primary tabular">1.4k</span> online
            </div>
          </FadeIn>
        </div>

        {/* Content grid */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <FadeIn>
              <p className="eyebrow text-text-muted mb-6">
                <span className="text-text-primary">PELOTITAS OS</span>
                <span className="text-text-faint">/</span>
                Padel · Tenis
              </p>
            </FadeIn>

            <FadeIn delay={80}>
              <h1 className="font-display text-display-2 sm:text-display-1 text-text-primary tracking-tightest leading-[0.92]">
                El sistema operativo
                <br />
                <span className="text-text-secondary">de tu</span>{' '}
                <span className="text-gradient">juego</span>
                <span className="text-brand">.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="text-base sm:text-lg text-text-secondary max-w-xl mt-7 leading-relaxed">
                Reservás canchas en 30 segundos. Encontrás rivales que te empujan. Competís en torneos
                con producción real. Y todo construye un perfil deportivo que es <span className="text-text-primary">tuyo</span>.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link href="/register" className="btn-primary text-sm h-11 px-6 group">
                  Crear cuenta gratis
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/clubs"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group h-11"
                >
                  Explorar complejos
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Right: spec card */}
          <div className="lg:col-span-4">
            <FadeIn delay={300}>
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-2xl opacity-20 blur-2xl pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, #D4FF3F 0%, #6BA9FF 100%)' }}
                />
                <div className="relative bg-surface/80 backdrop-blur-md border border-border-dark rounded-xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <p className="eyebrow text-text-muted">SISTEMA</p>
                    <span className="text-2xs text-brand font-mono">● live</span>
                  </div>
                  <div className="space-y-3">
                    {heroCounters.map((s) => (
                      <div key={s.label} className="flex items-baseline justify-between border-b border-border-dark/60 pb-3 last:border-0 last:pb-0">
                        <span className="text-xs text-text-muted uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
                          {s.label}
                        </span>
                        <span className="text-2xl font-bold text-text-primary tabular tracking-tight-2">
                          <span ref={s.ref}>{s.count.toLocaleString('es-AR')}</span>
                          <span className="text-brand">{s.suffix}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Bottom marquee */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border-dark bg-surface/60 backdrop-blur-md overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-3">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span
                key={i}
                className="mx-8 text-2xs uppercase tracking-widest font-semibold inline-flex items-center gap-3"
                style={{ letterSpacing: '0.15em' }}
              >
                <span className="w-1 h-1 rounded-full bg-brand" />
                <span className="text-text-secondary">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MANIFESTO — split text + numbers
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <FadeIn>
              <p className="eyebrow text-text-muted mb-6">Manifiesto</p>
              <h2 className="text-display-3 sm:text-display-2 text-text-primary tracking-tightest leading-[0.95] font-bold">
                El padel y el tenis se merecen
                <br />
                <span className="text-gradient-mono">software de verdad.</span>
              </h2>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 lg:pt-4">
            <FadeIn delay={120}>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-6">
                Durante años usamos Excel, WhatsApp y planillas para reservar canchas, organizar torneos, gestionar profesores.
                <span className="text-text-primary"> Eso se acabó.</span>
              </p>
              <p className="text-base text-text-secondary leading-relaxed mb-6">
                Pelotitas no es un marketplace. Es la infraestructura sobre la que se mueve la comunidad —
                jugadores, profes, clubes, organizadores — con reglas claras, datos en vivo y cero comisión.
              </p>
              <p className="text-base text-text-secondary leading-relaxed">
                Construimos lo que nos gustaría usar a nosotros. Performance-first, dato-first, gratis.
              </p>
            </FadeIn>

            <FadeIn delay={220}>
              <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-border-dark">
                <div>
                  <p className="text-display-4 font-bold text-text-primary tabular tracking-tight-2">0%</p>
                  <p className="text-xs text-text-muted mt-1">Comisión por reserva</p>
                </div>
                <div>
                  <p className="text-display-4 font-bold text-text-primary tabular tracking-tight-2">30s</p>
                  <p className="text-xs text-text-muted mt-1">Para crear cuenta</p>
                </div>
                <div>
                  <p className="text-display-4 font-bold text-text-primary tabular tracking-tight-2">24/7</p>
                  <p className="text-xs text-text-muted mt-1">Reservas online</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — editorial 6-tile grid with numbered eyebrows
          ═══════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-24 sm:py-32 border-y border-border-dark bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
            <FadeIn>
              <p className="eyebrow text-text-muted mb-4">Capacidades</p>
              <h2 className="text-display-3 sm:text-display-2 text-text-primary tracking-tightest leading-[0.95] font-bold">
                Todo lo que la comunidad
                <br />
                <span className="text-text-secondary">necesita.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={120}>
              <p className="text-text-secondary max-w-md leading-relaxed lg:text-right">
                Seis primitivas que reemplazan a cinco apps, dos planillas y una pizarra de WhatsApp.
              </p>
            </FadeIn>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-dark border border-border-dark rounded-xl overflow-hidden">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 60}>
                <div className="bg-base group p-7 hover:bg-surface transition-colors duration-300 h-full relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      f.accent === 'brand' ? 'bg-brand/10 text-brand border border-brand/20' :
                      f.accent === 'clay'  ? 'bg-clay/10  text-clay  border border-clay/20'  :
                      'bg-sky/10 text-sky border border-sky/20'
                    }`}>
                      {f.icon}
                    </div>
                    <span className="text-2xs font-mono text-text-muted">{f.label}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 tracking-tight-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PERSONAS — tabbed
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <FadeIn>
              <p className="eyebrow text-text-muted mb-4">Hecho para ti</p>
              <h2 className="text-display-3 sm:text-display-2 text-text-primary tracking-tightest font-bold leading-[0.95]">
                Cuatro roles. Una sola plataforma.
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={120}>
            <PersonaTabs />
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          NUMBERS — big editorial
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 border-y border-border-dark bg-court-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <p className="eyebrow text-text-muted mb-4">Tracción</p>
            <h2 className="text-display-3 sm:text-display-2 text-text-primary tracking-tightest font-bold leading-[0.95] mb-16 max-w-3xl">
              Crece la comunidad,
              <br />
              <span className="text-text-secondary">crecen los datos.</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-dark border border-border-dark rounded-xl overflow-hidden">
            {numbers.map((s, i) => {
              const counter = numbersCounters[i];
              return (
                <FadeIn key={s.label} delay={i * 80}>
                  <div className="bg-base p-8 sm:p-10 h-full">
                    <p className="text-display-3 sm:text-display-2 font-bold text-text-primary tabular tracking-tightest leading-none">
                      <span ref={counter.ref}>{counter.count.toLocaleString('es-AR')}</span>
                      <span className="text-brand">{s.suffix}</span>
                    </p>
                    <p className="text-2xs uppercase font-semibold text-text-muted mt-3" style={{ letterSpacing: '0.18em' }}>
                      {s.label}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOR CLUBS — split with checklist
          ═══════════════════════════════════════════════════════ */}
      <section id="for-clubs" className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="relative rounded-2xl overflow-hidden border border-border-dark bg-surface">
              {/* Decorative gradient */}
              <div
                className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,92,43,0.4) 0%, transparent 70%)' }}
              />
              <div
                className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-25 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(212,255,63,0.4) 0%, transparent 70%)' }}
              />

              <div className="relative grid lg:grid-cols-2 gap-12 p-8 sm:p-12 lg:p-16">
                {/* Left */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-clay/10 text-clay text-2xs font-semibold uppercase tracking-widest border border-clay/20 mb-6" style={{ letterSpacing: '0.12em' }}>
                    <Building2 className="w-3 h-3" />
                    Para complejos
                  </div>
                  <h2 className="text-3xl sm:text-display-4 font-bold text-text-primary tracking-tight-2 leading-tight mb-5">
                    ¿Tenés un complejo?
                    <br />
                    <span className="text-gradient-clay">Operalo desde un panel.</span>
                  </h2>
                  <p className="text-text-secondary leading-relaxed mb-8">
                    Sumate a la red de clubes más activa de la región. Publicá tus canchas, recibí reservas online,
                    organizá torneos. <span className="text-text-primary">Cero comisión, cero contrato.</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href="/register?role=club" className="btn-primary text-sm h-11 px-6 group">
                      Registrar mi complejo
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link href="/clubs" className="btn-outline text-sm h-11 px-6">
                      Ver clubes
                    </Link>
                  </div>
                </div>

                {/* Right — checklist */}
                <div className="space-y-3">
                  {clubBenefits.map((b, i) => (
                    <FadeIn key={b} delay={i * 60}>
                      <div className="flex items-start gap-3 group">
                        <div className="w-6 h-6 rounded-md bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5 border border-brand/20 group-hover:bg-brand/25 transition-colors">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed pt-0.5">
                          {b}
                        </span>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 border-t border-border-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <p className="eyebrow text-text-muted mb-4">Preguntas frecuentes</p>
            <h2 className="text-display-3 sm:text-display-2 text-text-primary tracking-tightest font-bold leading-[0.95] mb-12">
              Todo lo que querías
              <br />
              <span className="text-text-secondary">preguntar.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={120}>
            <FAQ />
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-full h-full"
            style={{ background: 'radial-gradient(ellipse at center bottom, rgba(212,255,63,0.10) 0%, transparent 60%)' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-dark text-2xs font-medium text-text-secondary mb-8">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Es momento de jugar mejor
            </div>
            <h2 className="text-display-3 sm:text-display-1 font-bold text-text-primary tracking-tightest leading-[0.95] mb-6">
              Tu próxima reserva
              <br />
              está a <span className="text-gradient">30 segundos</span>.
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Crea tu cuenta y empezá a usar la plataforma sin pagar nada.
              Sin tarjeta, sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-sm h-12 px-7 group">
                Crear cuenta
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/clubs" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors h-12 group">
                Explorar primero
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-border-dark bg-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2 md:col-span-2">
              <Link href="/" className="inline-flex items-center gap-0 group">
                <span className="text-xl font-bold tracking-tight text-text-primary">pelot</span>
                <span className="text-xl font-bold tracking-tight text-text-primary relative">
                  <span className="relative">
                    i
                    <span className="absolute -top-[0.1em] left-1/2 -translate-x-1/2 brand-dot" style={{ width: '0.22em', height: '0.22em' }} />
                  </span>
                </span>
                <span className="text-xl font-bold tracking-tight text-text-primary">tas</span>
              </Link>
              <p className="text-sm text-text-muted max-w-xs leading-relaxed mt-4 mb-6">
                El sistema operativo del padel y el tenis. Hecho con pasión en Argentina.
              </p>
              <div className="flex items-center gap-2">
                <a href="#" className="btn-icon-sm hover:text-brand" aria-label="Instagram">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="btn-icon-sm hover:text-brand" aria-label="Twitter">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="btn-icon-sm hover:text-brand" aria-label="YouTube">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <FooterCol title="Plataforma" links={[
              { label: 'Complejos',  href: '/clubs' },
              { label: 'Torneos',    href: '/tournaments' },
              { label: 'Partidos',   href: '/matches' },
              { label: 'Ranking',    href: '/ranking' },
            ]} />

            <FooterCol title="Para vos" links={[
              { label: 'Jugador',     href: '/register?role=player' },
              { label: 'Profesor',    href: '/register?role=coach' },
              { label: 'Complejo',    href: '/register?role=club' },
              { label: 'Organizador', href: '/register?role=organizer' },
            ]} />

            <FooterCol title="Recursos" links={[
              { label: 'Capacidades',  href: '#features' },
              { label: 'Para clubes',  href: '#for-clubs' },
              { label: 'Soporte',      href: 'mailto:hola@pelotitas.app' },
              { label: 'Estado',       href: '#' },
            ]} />

            <FooterCol title="Legal" links={[
              { label: 'Privacidad',  href: '#' },
              { label: 'Términos',    href: '#' },
              { label: 'Cookies',     href: '#' },
            ]} />
          </div>

          <div className="court-line mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-2xs text-text-muted uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
              © {new Date().getFullYear()} pelotitas — todos los derechos
            </p>
            <p className="text-2xs text-text-muted uppercase tracking-widest inline-flex items-center gap-2" style={{ letterSpacing: '0.15em' }}>
              <Globe className="w-3 h-3" />
              Buenos Aires · Argentina
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-4" style={{ letterSpacing: '0.15em' }}>
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
