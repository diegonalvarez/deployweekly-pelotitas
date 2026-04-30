'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  Trophy,
  Swords,
  GraduationCap,
  BarChart3,
  Building2,
  Check,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Users,
  Instagram,
  Twitter,
  Youtube,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   ANIMATED COUNTER HOOK
   ───────────────────────────────────────────────────────────────── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}

/* ─────────────────────────────────────────────────────────────────
   FADE-IN ON SCROLL
   ───────────────────────────────────────────────────────────────── */
function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   FEATURES DATA
   ═════════════════════════════════════════════════════════════════ */
const features = [
  {
    icon: <CalendarCheck className="w-6 h-6" />,
    title: 'Reservas instantaneas',
    desc: 'Reserva canchas de padel y tenis en segundos. Gratis, sin friccion.',
    span: 'md:col-span-2',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Torneos epicos',
    desc: 'Crea torneos con grupos, llaves eliminatorias, rankings y premios.',
    span: '',
  },
  {
    icon: <Swords className="w-6 h-6" />,
    title: 'Encontra rivales',
    desc: 'Matchmaking inteligente. Desafia jugadores de tu nivel.',
    span: '',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Profesores top',
    desc: 'Conecta con profes, agenda clases y trackea tu progreso.',
    span: 'md:col-span-2',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Historial y stats',
    desc: 'Cada partido cuenta. Estadisticas, ELO rating y progresion visual.',
    span: '',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Para clubes',
    desc: 'Dashboard completo para gestionar canchas, bookings y comunidad.',
    span: 'md:col-span-2',
  },
];

const steps = [
  {
    num: '01',
    title: 'Registrate',
    desc: 'Crea tu cuenta global gratis en 30 segundos.',
  },
  {
    num: '02',
    title: 'Activa tu perfil',
    desc: 'Jugador, profesor, club u organizador. Vos elegis.',
  },
  {
    num: '03',
    title: 'Conecta',
    desc: 'Encontra clubes, rivales y profesores cerca tuyo.',
  },
  {
    num: '04',
    title: 'Juega',
    desc: 'Reserva, competi, mejora tu nivel y subi en el ranking.',
  },
];

const stats = [
  { value: 50, suffix: '+', label: 'Complejos' },
  { value: 2000, suffix: '+', label: 'Jugadores' },
  { value: 100, suffix: '+', label: 'Torneos' },
  { value: 5000, suffix: '+', label: 'Reservas' },
];

const clubBenefits = [
  'Publicar canchas y horarios',
  'Recibir reservas online 24/7',
  'Crear y gestionar torneos',
  'Invitar profesores al staff',
  'Dashboard con metricas en tiempo real',
  'Comunidad activa de jugadores',
];

const footerLinks = {
  Plataforma: [
    { label: 'Complejos', href: '/clubs' },
    { label: 'Torneos', href: '/tournaments' },
    { label: 'Partidos', href: '/matches' },
    { label: 'Jugadores', href: '/players' },
  ],
  Perfiles: [
    { label: 'Jugadores', href: '/register' },
    { label: 'Profesores', href: '/register' },
    { label: 'Clubes', href: '/register' },
    { label: 'Organizadores', href: '/register' },
  ],
  Recursos: [
    { label: 'Como funciona', href: '#how-it-works' },
    { label: 'Para clubes', href: '#for-clubs' },
    { label: 'Contacto', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
};

/* ═════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═════════════════════════════════════════════════════════════════ */
export default function Home() {
  /* Hero counters */
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

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-base">
          {/* Green radial blob */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(30,215,96,0.3) 0%, transparent 70%)',
              top: '-20%',
              left: '-10%',
            }}
          />
          {/* Blue radial blob */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-3xl animate-float-slow"
            style={{
              background: 'radial-gradient(circle, rgba(83,157,245,0.25) 0%, transparent 70%)',
              bottom: '-10%',
              right: '-5%',
            }}
          />
          {/* Subtle green accent top-right */}
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl animate-float-delayed"
            style={{
              background: 'radial-gradient(circle, rgba(30,215,96,0.3) 0%, transparent 70%)',
              top: '20%',
              right: '15%',
            }}
          />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating sport elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Tennis ball */}
          <div className="absolute top-[18%] right-[12%] animate-float opacity-20">
            <div className="w-16 h-16 rounded-full border-2 border-brand/40 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-brand/20" />
            </div>
          </div>
          {/* Paddle shape */}
          <div className="absolute bottom-[22%] left-[8%] animate-float-slow opacity-15 rotate-12">
            <div className="w-12 h-20 rounded-full border-2 border-padel/40" />
          </div>
          {/* Small circle */}
          <div className="absolute top-[55%] right-[6%] animate-float-delayed opacity-10">
            <div className="w-8 h-8 rounded-full bg-brand/30" />
          </div>
          {/* Another accent */}
          <div className="absolute top-[35%] left-[15%] animate-float opacity-10">
            <div className="w-6 h-6 rounded-full border border-padel/30" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Tag */}
          <FadeInSection>
            <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-sm font-semibold px-4 py-1.5 rounded-pill mb-8">
              <Sparkles className="w-4 h-4" />
              Padel & Tenis en una sola plataforma
            </div>
          </FadeInSection>

          {/* Headline */}
          <FadeInSection delay={100}>
            <h1 className="text-display-2 sm:text-display-1 mb-6">
              <span className="text-white">Tu cancha. </span>
              <span className="text-gradient">Tu juego.</span>
              <br />
              <span className="text-white">Tu comunidad.</span>
            </h1>
          </FadeInSection>

          {/* Subtitle */}
          <FadeInSection delay={200}>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Reserva canchas gratis, encontra rivales de tu nivel, participa en torneos
              y conecta con los mejores profesores. Todo en un solo lugar.
            </p>
          </FadeInSection>

          {/* CTAs */}
          <FadeInSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary text-base px-10 py-3.5 shadow-glow-green group"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/clubs"
                className="btn-outline text-base px-12 py-3.5 font-bold uppercase tracking-wider"
              >
                Explorar complejos
              </Link>
            </div>
          </FadeInSection>

          {/* Hero stats */}
          <FadeInSection delay={500}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {heroCounters.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-white counter-value">
                    <span ref={s.ref}>{s.count.toLocaleString('es-AR')}</span>
                    <span className="text-brand">{s.suffix}</span>
                  </p>
                  <p className="text-xs text-text-muted uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-base to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — Bento Grid
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="badge-brand mb-4 inline-flex">Funcionalidades</span>
              <h2 className="section-header">
                Todo lo que necesitas para <span className="text-gradient">jugar mejor</span>
              </h2>
              <p className="text-text-secondary mt-4 max-w-xl mx-auto">
                Una plataforma completa para jugadores, clubes, profesores y organizadores de torneos.
              </p>
            </div>
          </FadeInSection>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 80} className={f.span}>
                <div className="card-interactive h-full group">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4 group-hover:bg-brand/20 group-hover:shadow-glow-green-sm transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand transition-colors duration-300">
                    {f.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — Timeline
          ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 sm:py-32 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-20">
              <span className="badge-padel mb-4 inline-flex">Paso a paso</span>
              <h2 className="section-header">
                Empeza en <span className="text-gradient">minutos</span>
              </h2>
            </div>
          </FadeInSection>

          {/* Timeline */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-border-dark">
              <div className="absolute inset-0 bg-gradient-to-r from-brand/0 via-brand/40 to-brand/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
              {steps.map((s, i) => (
                <FadeInSection key={s.num} delay={i * 150}>
                  <div className="relative text-center md:text-center">
                    {/* Step number */}
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-base border-2 border-brand/30 mb-6 mx-auto group hover:border-brand hover:shadow-glow-green transition-all duration-500">
                      <span className="text-2xl font-extrabold text-brand">{s.num}</span>
                      {/* Pulse ring */}
                      <div className="absolute inset-0 rounded-full border border-brand/20 animate-pulse-glow" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-text-secondary max-w-[200px] mx-auto">{s.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SOCIAL PROOF / STATS
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Gradient behind numbers */}
        <div className="absolute inset-0">
          <div
            className="absolute w-full h-full opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(30,215,96,0.1) 0%, transparent 60%)',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="section-header">
                Numeros que <span className="text-gradient">hablan solos</span>
              </h2>
              <p className="text-text-secondary mt-4">La comunidad crece cada dia.</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const counter = useCountUp(s.value);
              return (
                <FadeInSection key={s.label} delay={i * 100}>
                  <div className="stat-card text-center group hover:border-brand/20 transition-all duration-500">
                    <p className="stat-value counter-value">
                      <span ref={counter.ref}>{counter.count.toLocaleString('es-AR')}</span>
                      <span className="text-brand">{s.suffix}</span>
                    </p>
                    <p className="stat-label">{s.label}</p>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOR CLUBS CTA
          ═══════════════════════════════════════════════════════ */}
      <section id="for-clubs" className="py-24 sm:py-32 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <FadeInSection>
            <div className="relative rounded-3xl overflow-hidden border border-brand/20 bg-gradient-to-br from-surface via-surface to-brand/5">
              {/* Glow accent */}
              <div
                className="absolute top-0 right-0 w-96 h-96 opacity-20 blur-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(30,215,96,0.4) 0%, transparent 70%)',
                }}
              />

              <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left: Copy */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-sm font-semibold px-4 py-1.5 rounded-pill mb-6">
                      <Building2 className="w-4 h-4" />
                      Para complejos
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                      Tenes un complejo?
                      <br />
                      <span className="text-gradient">Registralo gratis.</span>
                    </h2>
                    <p className="text-text-secondary mb-8 leading-relaxed">
                      Unite a la red de clubes mas grande del pais. Publica tus canchas,
                      recibir reservas online y gestiona todo desde un solo dashboard.
                    </p>
                    <Link
                      href="/register"
                      className="btn-primary text-base px-8 py-3.5 group"
                    >
                      Registrar mi complejo
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Right: Benefits list */}
                  <div className="space-y-4">
                    {clubBenefits.map((b) => (
                      <div key={b} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 rounded-full bg-brand/15 text-brand flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand/25 transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-text-secondary group-hover:text-white transition-colors">
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0">
          <div
            className="absolute w-full h-full"
            style={{
              background: 'radial-gradient(ellipse at center bottom, rgba(30,215,96,0.08) 0%, transparent 50%)',
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <FadeInSection>
            <Zap className="w-12 h-12 text-brand mx-auto mb-6 animate-bounce-soft" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Listo para jugar?
            </h2>
            <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
              Create una cuenta en segundos y empeza a reservar canchas, buscar rivales y competir en torneos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-base px-10 py-3.5 shadow-glow-green group">
                Empezar gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/clubs" className="btn-outline text-base px-10 py-3.5 font-bold uppercase tracking-wider">
                Explorar complejos
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="bg-surface border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
          {/* Top: Brand + link columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-0 mb-4">
                <span className="text-xl font-extrabold text-white">pelot</span>
                <span className="text-xl font-extrabold text-white relative">
                  <span className="relative">
                    i
                    <span className="absolute -top-[0.1em] left-1/2 -translate-x-1/2 brand-dot" style={{ width: '0.25em', height: '0.25em' }} aria-hidden="true" />
                  </span>
                </span>
                <span className="text-xl font-extrabold text-white">tas</span>
              </Link>
              <p className="text-sm text-text-muted max-w-xs leading-relaxed mb-6">
                La plataforma gratuita para la comunidad de padel y tenis. Reservas, torneos, rivales y mas.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                <a href="#" className="btn-icon-sm hover:text-brand" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="btn-icon-sm hover:text-brand" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="btn-icon-sm hover:text-brand" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-text-secondary hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border-dark pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              pelotitas {new Date().getFullYear()}. Hecho con pasion en Argentina.
            </p>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Terminos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
