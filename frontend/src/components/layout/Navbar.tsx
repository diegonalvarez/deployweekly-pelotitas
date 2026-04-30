'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

const roleConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  PLAYER:               { label: 'Jugador',     icon: <Gamepad2 className="w-4 h-4" /> },
  COACH:                { label: 'Profesor',     icon: <GraduationCap className="w-4 h-4" /> },
  CLUB_OWNER:           { label: 'Complejo',    icon: <Building2 className="w-4 h-4" /> },
  TOURNAMENT_ORGANIZER: { label: 'Organizador', icon: <Trophy className="w-4 h-4" /> },
  ADMIN:                { label: 'Admin',        icon: <Shield className="w-4 h-4" /> },
};

const roleDashboard: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  CLUB_OWNER: '/dashboard/club',
  COACH: '/dashboard/coach',
  TOURNAMENT_ORGANIZER: '/dashboard/organizer',
  PLAYER: '/dashboard/player',
};

const navLinks = [
  { href: '/clubs', label: 'Complejos' },
  { href: '/coaches', label: 'Profesores' },
  { href: '/matches', label: 'Partidos' },
  { href: '/tournaments', label: 'Torneos' },
  { href: '/players', label: 'Jugadores' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/feed', label: 'Feed' },
  { href: '/available', label: 'Disponibles' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleSwitchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Track scroll for glass effect intensity */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll when mobile menu open */
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
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? 'bg-base/80 backdrop-blur-xl border-b border-white/5 shadow-heavy'
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Left: Brand + Nav ───────────────────── */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-0 group">
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  pelot
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-white relative">
                  <span className="relative">
                    i
                    {/* Animated green dot on the "i" */}
                    <span
                      className="absolute -top-[0.1em] left-1/2 -translate-x-1/2 brand-dot"
                      aria-hidden="true"
                    />
                  </span>
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  tas
                </span>
              </Link>

              {/* Desktop links */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="nav-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Right: Actions ──────────────────────── */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Notification bell */}
                  <Link href="/notifications" className="btn-icon relative">
                    <Bell className="w-[18px] h-[18px]" />
                    {/* Animated badge count */}
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-negative text-white text-2xs font-bold rounded-full flex items-center justify-center animate-bounce-soft">
                      3
                    </span>
                  </Link>

                  {/* Role switcher */}
                  {user.roles.length > 1 && (
                    <div className="relative hidden sm:block" ref={roleRef}>
                      <button
                        onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-surface-light/60 backdrop-blur-sm px-3 py-1.5 rounded-pill border border-border-dark hover:border-border-default hover:text-white transition-all duration-200"
                      >
                        {roleConfig[user.roles[0]]?.icon}
                        <span>{roleConfig[user.roles[0]]?.label || user.roles[0]}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${roleSwitchOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {roleSwitchOpen && (
                        <div className="dropdown right-0 mt-2 w-48">
                          <div className="px-3 py-2 text-2xs uppercase tracking-widest text-text-muted font-semibold">
                            Cambiar perfil
                          </div>
                          {user.roles.map(role => (
                            <Link
                              key={role}
                              href={roleDashboard[role] || '/dashboard/player'}
                              className="dropdown-item flex items-center gap-2.5"
                              onClick={() => setRoleSwitchOpen(false)}
                            >
                              {roleConfig[role]?.icon}
                              {roleConfig[role]?.label || role}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* User avatar + menu */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 group"
                    >
                      <div className={`
                        w-9 h-9 rounded-full
                        bg-brand/20 text-brand
                        flex items-center justify-center
                        font-bold text-sm
                        ring-2 transition-all duration-200
                        ${user.identityStatus === 'VERIFIED'
                          ? 'ring-brand/60 group-hover:ring-brand'
                          : 'ring-transparent group-hover:ring-surface-hover'
                        }
                      `}>
                        {user.firstName[0]}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                        {user.firstName}
                      </span>
                      <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <div className="dropdown right-0 mt-2 w-56">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-border-dark">
                          <p className="text-sm font-semibold text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                          {user.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.roles.map(r => (
                                <span key={r} className="text-2xs bg-surface-light text-text-secondary px-2 py-0.5 rounded-pill">
                                  {roleConfig[r]?.label || r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Links */}
                        <div className="py-1">
                          <Link href={getDashboardLink()} className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <LayoutDashboard className="w-4 h-4 text-text-muted" />
                            Dashboard
                          </Link>
                          <Link href="/profile" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <User className="w-4 h-4 text-text-muted" />
                            Mi perfil
                          </Link>
                          <Link href="/calendar" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <CalendarCheck className="w-4 h-4 text-text-muted" />
                            Calendario
                          </Link>
                          <Link href="/reservations" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <CalendarCheck className="w-4 h-4 text-text-muted" />
                            Mis reservas
                          </Link>
                          <Link href="/connections" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                            <Users className="w-4 h-4 text-text-muted" />
                            Conexiones
                          </Link>
                        </div>

                        {user.roles.length === 0 && (
                          <div className="py-1 border-t border-border-dark">
                            <Link href="/activate" className="dropdown-item flex items-center gap-2.5 text-brand" onClick={() => setProfileOpen(false)}>
                              <Zap className="w-4 h-4" />
                              Activar perfil
                            </Link>
                          </div>
                        )}

                        {/* Logout */}
                        <div className="border-t border-border-dark py-1">
                          <button
                            onClick={() => { logout(); setProfileOpen(false); }}
                            className="dropdown-item flex items-center gap-2.5 text-negative w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="btn-ghost">Ingresar</Link>
                  <Link href="/register" className="btn-primary">Registrarse</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn-icon md:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile slide-in panel ─────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          md:hidden
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setMobileOpen(false)}
      />

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-full w-72
          bg-surface border-l border-border-dark
          transition-transform duration-300 ease-out
          md:hidden
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border-dark">
          <span className="text-lg font-bold text-white">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="btn-icon-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-white hover:bg-surface-light rounded-xl transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {user && (
          <div className="p-4 border-t border-border-dark space-y-1">
            {/* Roles in mobile */}
            {user.roles.length > 1 && (
              <div className="px-4 py-2">
                <p className="text-2xs uppercase tracking-widest text-text-muted font-semibold mb-2">Perfiles</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map(role => (
                    <Link
                      key={role}
                      href={roleDashboard[role] || '/dashboard/player'}
                      className="flex items-center gap-1.5 text-xs bg-surface-light text-text-secondary px-3 py-1.5 rounded-pill hover:text-white hover:bg-surface-hover transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {roleConfig[role]?.icon}
                      {roleConfig[role]?.label || role}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link href={getDashboardLink()} className="block px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-surface-light rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <Link href="/profile" className="block px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-surface-light rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
              Mi perfil
            </Link>
            <Link href="/calendar" className="block px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-surface-light rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
              Calendario
            </Link>
            <Link href="/reservations" className="block px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-surface-light rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
              Mis reservas
            </Link>

            <div className="pt-2">
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full px-4 py-3 text-sm text-negative text-left hover:bg-surface-light rounded-xl transition-colors"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        )}

        {!user && (
          <div className="p-4 border-t border-border-dark space-y-2">
            <Link href="/login" className="btn-secondary w-full justify-center" onClick={() => setMobileOpen(false)}>
              Ingresar
            </Link>
            <Link href="/register" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
