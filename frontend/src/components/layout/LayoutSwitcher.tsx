'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import AppShell from './AppShell';

/* Pages that get marketing chrome (Navbar + footer-style)
   Everything else falls through to AppShell (sidebar layout).
   ─────────────────────────────────────────────────────────── */
const MARKETING_PATHS: string[] = [
  // empty — the home page is now the naked v5 landing.
];

/* Auth pages render naked (no nav) — they have their own v5 layout. */
const NAKED_AUTH = [
  '/login',
  '/register',
  '/forgot-password',
];

const MARKETING_PREFIXES = [
  '/reset-password',
  '/verify-email',
];

/* Naked = no chrome at all (public share pages, OG-only routes). */
const NAKED_PREFIXES = [
  '/m/',      // shareable match card
  '/h2h/',    // public head-to-head
  '/v1',      // legacy landing kept as a reference (optional)
  '/v5',      // source of the live landing — re-exported by /
];

/* Exact-match naked routes — / itself is the new v5 landing. */
const NAKED_EXACT = ['/'];

function isMarketing(pathname: string): boolean {
  if (MARKETING_PATHS.includes(pathname)) return true;
  return MARKETING_PREFIXES.some((p) => pathname.startsWith(p));
}

function isNaked(pathname: string): boolean {
  if (NAKED_EXACT.includes(pathname)) return true;
  return NAKED_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isNaked(pathname)) return <>{children}</>;
  if (NAKED_AUTH.includes(pathname)) {
    return <main className="v5-shell-main min-h-screen" style={{ background: 'var(--v5-paper)' }}>{children}</main>;
  }

  const marketing = isMarketing(pathname);

  if (marketing) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-14 pb-20 md:pb-0">{children}</main>
        <BottomNav />
      </>
    );
  }

  return <AppShell>{children}</AppShell>;
}
