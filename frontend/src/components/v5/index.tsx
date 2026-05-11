'use client';

/* ─────────────────────────────────────────────────────────────
   V5 design system — internal pages.
   Reusable primitives so every page speaks the same Flonea/Olga
   inspired language: cream paper background, brown rounded hero
   card with notch, pastel product cards with orange-ball arrow
   chips, chunky uppercase display titles, mono eyebrow text.
   ───────────────────────────────────────────────────────────── */

import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Plus } from 'lucide-react';
import { ReactNode } from 'react';

/* ── Shell ─────────────────────────────────────────────────── */
export function V5Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative min-h-[calc(100vh-4rem)] v5-grain ${className}`} style={{ background: 'var(--v5-paper)', color: 'var(--v5-ink)' }}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function V5Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/* ── Hero brown card ──────────────────────────────────────── */
export function V5Hero({
  eyebrow, title, sub, ctaLabel, ctaHref, side, footerNote,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  side?: ReactNode;
  footerNote?: ReactNode;
}) {
  return (
    <section className="v5-hero-card mb-6 sm:mb-8">
      <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 p-6 sm:p-8 lg:p-10">
        <div className="relative flex flex-col gap-5">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] self-start px-3 py-1 rounded-full"
                  style={{ background: '#5C3320', color: 'var(--v5-cream)', fontFamily: 'var(--font-mono), monospace' }}>
              <span className="block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--v5-orange)' }} />
              {eyebrow}
            </span>
          )}
          <h1
            className="font-bold uppercase tracking-[-0.035em] leading-[0.88]"
            style={{
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
              fontSize: 'clamp(36px, 5.4vw, 80px)',
              color: 'var(--v5-cream)',
            }}
          >
            {title}
          </h1>
          {sub && <p className="text-[14px] sm:text-[15px] leading-relaxed max-w-xl" style={{ color: 'rgba(242,237,222,0.72)' }}>{sub}</p>}
          {(ctaLabel || footerNote) && (
            <div className="mt-2 flex items-center gap-5 flex-wrap pt-5" style={{ borderTop: '1px solid #5C3320' }}>
              {ctaLabel && ctaHref && (
                <Link href={ctaHref} className="inline-flex items-center gap-2 group">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-transform group-hover:scale-105" style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}>
                    <ArrowRight className="w-4 h-4" strokeWidth={3} />
                  </span>
                  <span className="text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--v5-cream)' }}>
                    {ctaLabel}
                  </span>
                </Link>
              )}
              {footerNote && (
                <p className="text-[11px] uppercase tracking-[0.1em] font-bold leading-relaxed max-w-xs"
                   style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}>
                  {footerNote}
                </p>
              )}
            </div>
          )}
        </div>
        {side && <div className="relative lg:py-2">{side}</div>}
      </div>
    </section>
  );
}

/* ── Pastel product card with arrow chip ───────────────────── */
export function V5ProductCard({
  href, theme = 'cream', eyebrow, title, stat, statLabel, footer, children,
}: {
  href?: string;
  theme?: 'cream' | 'lime' | 'red' | 'pink' | 'blue' | 'ink';
  eyebrow?: string;
  title?: ReactNode;
  stat?: ReactNode;
  statLabel?: string;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  const cls = `v5-card-${theme}`;
  const inner = (
    <article className={`v5-card ${cls} relative overflow-hidden h-full flex flex-col min-h-[180px]`}>
      {href && (
        <span className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full transition-transform group-hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.55)', color: 'currentColor' }}>
          <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
        </span>
      )}
      {eyebrow && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ background: 'currentColor', opacity: 0.16 }}>
            <Plus className="w-3.5 h-3.5" strokeWidth={2.8} style={{ color: 'currentColor', opacity: 4 }} />
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold">{eyebrow}</span>
        </div>
      )}
      {title && (
        <h3
          className="font-bold uppercase tracking-[-0.02em] leading-[0.96]"
          style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 'clamp(20px, 2.4vw, 26px)' }}
        >
          {title}
        </h3>
      )}
      {stat !== undefined && (
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-bold tabular leading-none tracking-[-0.04em]"
                style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 'clamp(28px, 3.4vw, 40px)' }}>
            {stat}
          </span>
          {statLabel && <span className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-70">{statLabel}</span>}
        </div>
      )}
      {children && <div className="mt-3 flex-1">{children}</div>}
      {footer && <div className="mt-auto pt-3 text-[12px] opacity-80">{footer}</div>}
    </article>
  );
  return href ? <Link href={href} className="group block h-full">{inner}</Link> : inner;
}

/* ── Stat tile ─────────────────────────────────────────────── */
export function V5Stat({
  eyebrow, value, hint, accent,
}: { eyebrow: string; value: ReactNode; hint?: ReactNode; accent?: 'orange' | 'lime' | 'blue' | 'yellow' }) {
  const accentColor = accent === 'orange' ? 'var(--v5-orange)'
                    : accent === 'lime'   ? 'var(--v5-lime-ink)'
                    : accent === 'blue'   ? 'var(--v5-blue)'
                    : accent === 'yellow' ? 'var(--v5-yellow)'
                    : 'var(--v5-ink)';
  return (
    <div className="v5-stat">
      <p className="v5-stat-eyebrow">{eyebrow}</p>
      <p className="v5-stat-value mt-1" style={{ color: accentColor }}>{value}</p>
      {hint && (
        <p className="text-[11px] uppercase tracking-[0.14em] font-bold mt-1.5 opacity-70"
           style={{ fontFamily: 'var(--font-mono), monospace' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Section eyebrow + title pair ──────────────────────────── */
export function V5SectionTitle({
  eyebrow, title, action,
}: { eyebrow?: string; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
      <div>
        {eyebrow && <p className="v5-eyebrow mb-2">{eyebrow}</p>}
        <h2
          className="v5-display"
          style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ── Photo with fallback ───────────────────────────────────── */
export function V5Photo({
  src, alt, fallback = '#3B1F0F', className = '', style,
}: { src: string; alt: string; fallback?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ background: fallback, ...style }}
      loading="lazy"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
    />
  );
}

/* ── Empty state ───────────────────────────────────────────── */
export function V5Empty({
  title, sub, ctaLabel, ctaHref,
}: { title: string; sub?: string; ctaLabel?: string; ctaHref?: string }) {
  return (
    <div className="rounded-3xl px-6 py-14 text-center" style={{ background: '#FFFFFF', border: '1px solid var(--v5-paper-2)' }}>
      <p className="v5-eyebrow mb-3">SIN DATOS</p>
      <h3 className="font-bold uppercase tracking-[-0.02em] mb-2" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', fontSize: 22 }}>
        {title}
      </h3>
      {sub && <p className="text-[13px] max-w-md mx-auto" style={{ color: 'var(--v5-ink-2)' }}>{sub}</p>}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="v5-btn-primary mt-5">
          {ctaLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/* ── Photo URLs — reused across the app ────────────────────── */
export const V5_PHOTOS = {
  courtPadel:   'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&w=1200&q=80',
  courtTennis:  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  ball:         'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',
  runner:       'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80',
  racketAction: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80',
  sneakers:     'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1400&q=85',
  serve:        'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=1200&q=80',
  trophy:       'https://images.unsplash.com/photo-1567748157439-651aca2ff064?auto=format&fit=crop&w=900&q=80',
};
