'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  LayoutDashboard,
  CalendarCheck,
  LogOut,
  Zap,
  Shield,
  GraduationCap,
  Building2,
  Trophy,
  Gamepad2,
  Users,
  ArrowRight,
} from 'lucide-react';

const roleConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  PLAYER:               { label: 'Jugador',     icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  COACH:                { label: 'Profesor',    icon: <GraduationCap className="w-3.5 h-3.5" /> },
  CLUB_OWNER:           { label: 'Complejo',    icon: <Building2 className="w-3.5 h-3.5" /> },
  TOURNAMENT_ORGANIZER: { label: 'Organizador', icon: <Trophy className="w-3.5 h-3.5" /> },
  ADMIN:                { label: 'Admin',       icon: <Shield className="w-3.5 h-3.5" /> },
};

const roleDashboard: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  CLUB_OWNER: '/dashboard/club',
  COACH: '/dashboard/coach',
  TOURNAMENT_ORGANIZER: '/dashboard/organizer',
  PLAYER: '/dashboard/player',
};

const navLinks = [
  { href: '/clubs',       label: 'Complejos' },
  { href: '/tournaments', label: 'Torneos' },
  { href: '/coaches',     label: 'Profesores' },
  { href: '/players',     label: 'Comunidad' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    for (const role of ['ADMIN', 'CLUB_OWNER', 'COACH', 'TOURNAMENT_ORGANIZER', 'PLAYER']) {
      if (user.roles.includes(role)) return roleDashboard[role];
    }
    return '/activate';
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-base/85 backdrop-blur-xl border-b border-border-dark'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* ── Brand + nav ─────────────────────── */}
            <div className="flex items-center gap-7">
              <Link href="/" className="flex items-center gap-0 group">
                <span className="text-base font-bold tracking-tight text-text-primary">pelot</span>
                <span className="text-base font-bold tracking-tight text-text-primary relative">
                  <span className="relative">
                    i
                    <span
                      className="absolute -top-[0.1em] left-1/2 -translate-x-1/2 brand-dot"
                      style={{ width: '0.22em', height: '0.22em' }}
                      aria-hidden="true"
                    />
                  </span>
                </span>
                <span className="text-base font-bold tracking-tight text-text-primary">tas</span>
                <span className="ml-2 px-1.5 py-0.5 text-[9px] tracking-widest font-semibold text-brand bg-brand/10 rounded uppercase border border-brand/15">
                  beta
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-0.5">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="nav-link text-[13px]">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Actions ─────────────────────── */}
            <div className="flex items-center gap-1.5">
              {user ? (
                <>
                  <Link href="/notifications" className="btn-icon relative" aria-label="Notificaciones">
                    <Bell className="w-[15px] h-[15px]" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-clay text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-base">3</span>
                  </Link>

                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-lg hover:bg-surface-light transition-all"
                    >
                      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand/30 to-brand/5 text-brand-ink font-bold text-xs flex items-center justify-center border border-brand/30">
                        {user.firstName?.[0]?.toUpperCase()}
                      </div>
                      <span className="hidden sm:block text-xs font-medium text-text-secondary">{user.firstName}</span>
                      <ChevronDown className={`hidden sm:block w-3 h-3 text-text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <div className="dropdown right-0 mt-2 w-60">
                        <div className="px-3 py-3 border-b border-border-dark">
                          <p className="text-sm font-semibold text-text-primary truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
                          {user.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.roles.map((r) => (
                                <span key={r} className="text-2xs bg-surface-light text-text-secondary px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                                  {roleConfig[r]?.icon}{roleConfig[r]?.label || r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="py-1">
                          <Link href={getDashboardLink()} className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <LayoutDashboard className="w-4 h-4 text-text-muted" /> Dashboard
                          </Link>
                          <Link href="/profile" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <User className="w-4 h-4 text-text-muted" /> Mi perfil
                          </Link>
                          <Link href="/calendar" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <CalendarCheck className="w-4 h-4 text-text-muted" /> Calendario
                          </Link>
                          <Link href="/connections" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <Users className="w-4 h-4 text-text-muted" /> Conexiones
                          </Link>
                        </div>
                        {user.roles.length === 0 && (
                          <div className="py-1 border-t border-border-dark">
                            <Link href="/activate" className="dropdown-item flex items-center gap-2.5 text-brand" onClick={() => setProfileOpen(false)}>
                              <Zap className="w-4 h-4" /> Activar perfil
                            </Link>
                          </div>
                        )}
                        <div className="border-t border-border-dark py-1">
                          <button
                            onClick={() => { logout(); setProfileOpen(false); router.push('/'); }}
                            className="dropdown-item flex items-center gap-2.5 text-negative w-full"
                          >
                            <LogOut className="w-4 h-4" /> Cerrar sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="btn-ghost text-sm">Ingresar</Link>
                  <Link href="/register" className="btn-primary text-sm group">
                    Empezar
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn-icon md:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile slide-in panel ─────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-surface border-l border-border-dark transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border-dark">
          <span className="text-sm font-semibold text-text-primary">Menú</span>
          <button onClick={() => setMobileOpen(false)} className="btn-icon-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-0.5">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-light rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {!user && (
          <div className="p-3 border-t border-border-dark space-y-2">
            <Link href="/login" className="btn-secondary w-full justify-center" onClick={() => setMobileOpen(false)}>
              Ingresar
            </Link>
            <Link href="/register" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
              Empezar gratis
            </Link>
          </div>
        )}

        {user && (
          <div className="p-3 border-t border-border-dark space-y-0.5">
            <Link href={getDashboardLink()} className="block px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light rounded-lg" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <Link href="/profile" className="block px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light rounded-lg" onClick={() => setMobileOpen(false)}>
              Mi perfil
            </Link>
            <button
              onClick={() => { logout(); setMobileOpen(false); router.push('/'); }}
              className="w-full px-3 py-2.5 text-sm text-negative text-left hover:bg-surface-light rounded-lg"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </>
  );
}
