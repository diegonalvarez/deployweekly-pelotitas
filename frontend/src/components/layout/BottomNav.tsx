'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import { CanchaIcon, RaquetaIcon, CopaIcon } from '@/components/icons/SportIcons';

const navItems = [
  { href: '/',            label: 'Inicio',   icon: <Home className="w-5 h-5" />,        match: (p: string) => p === '/' },
  { href: '/clubs',       label: 'Canchas',  icon: <CanchaIcon className="w-5 h-5" />,  match: (p: string) => p.startsWith('/clubs') },
  { href: '/matches',     label: 'Partidos', icon: <RaquetaIcon className="w-5 h-5" />, match: (p: string) => p.startsWith('/matches') || p.startsWith('/scoreboard') },
  { href: '/tournaments', label: 'Torneos',  icon: <CopaIcon className="w-5 h-5" />,    match: (p: string) => p.startsWith('/tournaments') },
  { href: '/profile',     label: 'Perfil',   icon: <User className="w-5 h-5" />,        match: (p: string) => p.startsWith('/profile') },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--v5-brown)',
        color: 'var(--v5-cream)',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        boxShadow: '0 -10px 40px -10px rgba(26,18,8,0.35)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch justify-around" style={{ height: 64 }}>
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
              style={{
                minWidth: 44,
                color: active ? 'var(--v5-cream)' : 'rgba(242,237,222,0.55)',
              }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 38, height: 38,
                  background: active ? 'var(--v5-orange)' : 'transparent',
                  color: active ? 'var(--v5-ink)' : 'currentColor',
                }}
              >
                {item.icon}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.12em] leading-none"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
