'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

/** Top-bar right side: switches between login/signup CTAs and a user chip. */
export function PublicTopBar() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <ThemeToggle compact />
      </div>
    );
  }

  if (user) {
    const isAdmin = user.roles?.includes('ADMIN');
    const isClubOwner = user.roles?.includes('CLUB_OWNER');
    const dashboardHref =
      isAdmin || isClubOwner ? '/dashboard/club' : '/dashboard/player';
    return (
      <div className="flex items-center gap-3">
        <span
          className="hidden sm:inline text-[12px] font-bold uppercase tracking-[0.12em]"
          style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
        >
          Hola, {user.firstName}
          {isAdmin && (
            <span
              className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ background: 'var(--v5-yellow)', color: 'var(--v5-ink)' }}
            >
              Admin
            </span>
          )}
        </span>
        <ThemeToggle compact />
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
        >
          Mi panel
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <ThemeToggle compact />
      <Link
        href="/login"
        className="text-[12px] font-bold uppercase tracking-[0.12em] hidden sm:inline-flex"
        style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
      >
        Iniciar sesión
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.1em]"
        style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
      >
        Crear cuenta gratis
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full"
          style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
        >
          →
        </span>
      </Link>
    </div>
  );
}

/** Hero CTAs inside the brown card. Logged-in users skip signup → straight to reserve. */
export function HeroReserveCTA({ clubId }: { clubId: string }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ width: 1, height: 44 }} />;

  if (user) {
    return (
      <Link
        href={`/clubs/${clubId}`}
        className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
        style={{ background: 'var(--v5-cream)', color: 'var(--v5-brown)' }}
      >
        Reservar cancha
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
        >
          →
        </span>
      </Link>
    );
  }

  return (
    <>
      <Link
        href={`/register?next=/clubs/${clubId}`}
        className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
        style={{ background: 'var(--v5-cream)', color: 'var(--v5-brown)' }}
      >
        Crear cuenta para reservar
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
        >
          →
        </span>
      </Link>
      <Link
        href={`/login?next=/clubs/${clubId}`}
        className="text-[12px] font-bold uppercase tracking-[0.12em] underline-offset-4 hover:underline"
        style={{ color: 'rgba(242,237,222,0.75)', fontFamily: 'var(--font-mono), monospace' }}
      >
        Ya tengo cuenta · Iniciar sesión
      </Link>
    </>
  );
}

/** Footer signup block. Logged-in users see only a dashboard link. */
export function FooterSignupCTA({ taglineLoggedOut }: { taglineLoggedOut?: string } = {}) {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user) {
    const isAdmin = user.roles?.includes('ADMIN');
    const isClubOwner = user.roles?.includes('CLUB_OWNER');
    const dashboardHref =
      isAdmin || isClubOwner ? '/dashboard/club' : '/dashboard/player';
    return (
      <>
        <p
          className="text-[12px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
        >
          Ya estás dentro, {user.firstName}
        </p>
        <Link
          href={dashboardHref}
          className="mt-4 inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
        >
          Ir a mi panel
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </Link>
      </>
    );
  }

  return (
    <>
      {taglineLoggedOut && (
        <p
          className="text-[12px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
        >
          {taglineLoggedOut}
        </p>
      )}
      <Link
        href="/register"
        className="mt-4 inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
        style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
      >
        Crear cuenta gratis
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
        >
          →
        </span>
      </Link>
      <div className="mt-3">
        <Link
          href="/login"
          className="text-[12px] font-bold uppercase tracking-[0.12em] underline-offset-4 hover:underline"
          style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
        >
          Ya tengo cuenta · Iniciar sesión
        </Link>
      </div>
    </>
  );
}

/** Sticky mobile reserve bar — points logged-in users straight to the slot picker. */
export function StickyReserveLink({ clubId }: { clubId: string }) {
  const { user, loading } = useAuth();
  const href = !loading && user ? `/clubs/${clubId}` : `/register?next=/clubs/${clubId}`;
  return (
    <Link
      href={href}
      className="flex-1 inline-flex items-center justify-between pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
      style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
    >
      Reservar cancha
      <span
        className="inline-flex items-center justify-center w-10 h-10 rounded-full"
        style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
      >
        →
      </span>
    </Link>
  );
}
