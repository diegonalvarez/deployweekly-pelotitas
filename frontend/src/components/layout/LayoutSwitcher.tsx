'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import AppShell from './AppShell';

/* Pages that get marketing chrome (Navbar + footer-style)
   Everything else falls through to AppShell (sidebar layout).
   ─────────────────────────────────────────────────────────── */
const MARKETING_PATHS = [
  '/',
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
  '/v2',      // landing B (marketing variant — dark editorial)
  '/v3',      // landing C (marketing variant — brutalist light)
  '/v4',      // landing D (marketing variant — Linear-style analytics)
];

function isMarketing(pathname: string): boolean {
  if (MARKETING_PATHS.includes(pathname)) return true;
  return MARKETING_PREFIXES.some((p) => pathname.startsWith(p));
}

function isNaked(pathname: string): boolean {
  return NAKED_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isNaked(pathname)) return <>{children}</>;

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
