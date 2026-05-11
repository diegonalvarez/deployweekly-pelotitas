'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import LocationPill from './LocationPill';
import {
  LayoutDashboard,
  Building2,
  Trophy,
  Swords,
  GraduationCap,
  Users,
  CalendarCheck,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Zap,
  Shield,
  Gamepad2,
  Award,
  Rss,
  Activity,
  Link2,
  BarChart3,
  ArrowRight,
  Compass,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import {
  CopaIcon,
  RaquetaIcon,
  CanchaIcon,
  MarcadorIcon,
  FuegoIcon,
} from '@/components/icons/SportIcons';
import ThemeToggle from '@/components/ThemeToggle';

/* ─────────────────────────────────────────────────────────────
   Sidebar nav definition
   ───────────────────────────────────────────────────────────── */

type NavItem = { href: string; label: string; icon: React.ReactNode; exact?: boolean };
type NavGroup = { title: string; items: NavItem[]; auth: 'public' | 'private' };

/** Public discovery — visible to everyone, even guests. */
const discoverGroup: NavGroup = {
  title: 'Descubrir',
  auth: 'public',
  items: [
    { href: '/clubs',       label: 'Complejos',  icon: <CanchaIcon className="w-4 h-4" /> },
    { href: '/tournaments', label: 'Torneos',    icon: <CopaIcon className="w-4 h-4" /> },
    { href: '/coaches',     label: 'Profesores', icon: <GraduationCap className="w-4 h-4" /> },
    { href: '/players',     label: 'Jugadores',  icon: <Users className="w-4 h-4" /> },
    { href: '/ranking',     label: 'Ranking',    icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/feed',        label: 'Feed',       icon: <Rss className="w-4 h-4" /> },
  ],
};

/** Player surface — only for logged-in players. */
const playerGroup: NavGroup = {
  title: 'Tu juego',
  auth: 'private',
  items: [
    { href: '/dashboard/player', label: 'Inicio',       icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
    { href: '/calendar',         label: 'Calendario',   icon: <CalendarCheck className="w-4 h-4" /> },
    { href: '/reservations',     label: 'Reservas',     icon: <CanchaIcon className="w-4 h-4" /> },
    { href: '/matches',          label: 'Partidos',     icon: <RaquetaIcon className="w-4 h-4" /> },
    { href: '/matches/log',      label: 'Mi historial', icon: <StickyNote className="w-4 h-4" /> },
    { href: '/scoreboards',      label: 'Anotadores',   icon: <MarcadorIcon className="w-4 h-4" /> },
    { href: '/matchmaking',      label: 'Buscar partido', icon: <Users className="w-4 h-4" /> },
    { href: '/available',        label: 'Disponibles',  icon: <Activity className="w-4 h-4" /> },
    { href: '/connections',      label: 'Conexiones',   icon: <Link2 className="w-4 h-4" /> },
  ],
};

/** Personal account — only for logged-in users. */
const accountGroup: NavGroup = {
  title: 'Tu perfil',
  auth: 'private',
  items: [
    { href: '/achievements', label: 'Logros',       icon: <FuegoIcon className="w-4 h-4" /> },
    { href: '/profile',      label: 'Perfil',       icon: <User className="w-4 h-4" /> },
    { href: '/billing',      label: 'Suscripción',  icon: <Sparkles className="w-4 h-4" /> },
  ],
};

const roleEntries: Record<string, NavItem> = {
  CLUB_OWNER:           { href: '/dashboard/club',       label: 'Panel complejo',  icon: <CanchaIcon className="w-4 h-4" /> },
  COACH:                { href: '/dashboard/coach',       label: 'Panel profesor',  icon: <GraduationCap className="w-4 h-4" /> },
  TOURNAMENT_ORGANIZER: { href: '/dashboard/organizer',   label: 'Panel organizador', icon: <CopaIcon className="w-4 h-4" /> },
  ADMIN:                { href: '/dashboard/admin',       label: 'Panel admin',     icon: <Shield className="w-4 h-4" /> },
};

const roleLabel: Record<string, { label: string; icon: React.ReactNode }> = {
  PLAYER:               { label: 'Jugador',     icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  COACH:                { label: 'Profesor',    icon: <GraduationCap className="w-3.5 h-3.5" /> },
  CLUB_OWNER:           { label: 'Complejo',    icon: <Building2 className="w-3.5 h-3.5" /> },
  TOURNAMENT_ORGANIZER: { label: 'Organizador', icon: <CopaIcon className="w-3.5 h-3.5" /> },
  ADMIN:                { label: 'Admin',       icon: <Shield className="w-3.5 h-3.5" /> },
};

const roleDashboard: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  CLUB_OWNER: '/dashboard/club',
  COACH: '/dashboard/coach',
  TOURNAMENT_ORGANIZER: '/dashboard/organizer',
  PLAYER: '/dashboard/player',
};

/* ─────────────────────────────────────────────────────────────
   Logo (compact) — V5
   ───────────────────────────────────────────────────────────── */
function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'text-[16px]' : 'text-[20px]';
  return (
    <Link href="/" className={`inline-flex items-center ${sz} font-bold tracking-tight-2`}
          style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', color: 'var(--v5-ink)' }}>
      PELOTITAS<span style={{ color: 'var(--v5-orange)' }}>.</span>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Visitor CTA (top of sidebar when logged out)
   ───────────────────────────────────────────────────────────── */
function VisitorCTA({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mx-3 mb-4 mt-2 p-4 rounded-2xl relative overflow-hidden"
         style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2 opacity-70"
         style={{ fontFamily: 'var(--font-mono), monospace' }}>
        SIN CUENTA
      </p>
      <p className="text-[16px] font-bold uppercase leading-snug mb-1 tracking-[-0.02em]"
         style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
        Reservá.<br />Competí.<br /><span style={{ color: 'var(--v5-yellow)' }}>Mejorá.</span>
      </p>
      <Link
        href="/register"
        onClick={onNavigate}
        className="mt-3 inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full w-full"
        style={{ background: 'var(--v5-yellow)', color: 'var(--v5-ink)' }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] flex-1 text-left">CREAR CUENTA</span>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{ background: 'var(--v5-orange)' }}>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      </Link>
      <Link
        href="/login"
        onClick={onNavigate}
        className="block text-center text-[11px] mt-2 opacity-75 hover:opacity-100"
        style={{ fontFamily: 'var(--font-mono), monospace' }}
      >
        ¿Ya tenés cuenta? <span className="underline">Iniciá sesión</span>
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sidebar — adapts to logged-in state
   ───────────────────────────────────────────────────────────── */
function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Build nav groups based on auth state
  const groups: NavGroup[] = (() => {
    if (!user) {
      // Visitor: only public discovery
      return [discoverGroup];
    }

    const list: NavGroup[] = [];

    // Role operation panels first (most relevant to logged-in user)
    const roleItems = (user.roles || [])
      .filter((r: string) => r !== 'PLAYER')
      .map((r: string) => roleEntries[r])
      .filter(Boolean);
    if (roleItems.length > 0) {
      list.push({ title: 'Operación', auth: 'private', items: roleItems });
    }

    list.push(playerGroup, discoverGroup, accountGroup);
    return list;
  })();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (href === '/' ) return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0"
           style={{ background: 'var(--v5-sidebar-bg)', borderRight: '1px solid var(--v5-paper-2)' }}>
      {/* Logo block */}
      <div className="h-16 flex items-center px-5" style={{ borderBottom: '1px solid var(--v5-paper-2)' }}>
        <Logo />
      </div>

      {/* Visitor CTA at top when logged out */}
      {!user && <VisitorCTA onNavigate={onNavigate} />}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
               style={{ color: 'var(--v5-ink-2)', opacity: 0.6, fontFamily: 'var(--font-mono), monospace' }}>
              {g.title}
            </p>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(it.href, it.exact);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all"
                    style={{
                      color: active ? 'var(--v5-cream)' : 'var(--v5-ink)',
                      background: active ? 'var(--v5-brown)' : 'transparent',
                      minHeight: 40,
                    }}
                  >
                    <span style={{ color: active ? 'var(--v5-orange)' : 'currentColor', opacity: active ? 1 : 0.7 }}>
                      {it.icon}
                    </span>
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Visitor: extra link to landing/marketing */}
        {!user && (
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
               style={{ color: 'var(--v5-ink-2)', opacity: 0.6, fontFamily: 'var(--font-mono), monospace' }}>
              Acerca
            </p>
            <Link href="/" onClick={onNavigate}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold"
                  style={{ color: 'var(--v5-ink)', minHeight: 40 }}>
              <Compass className="w-4 h-4 opacity-70" />
              Conocé pelotitas
            </Link>
          </div>
        )}
      </nav>

      {/* User block */}
      {user && (
        <div className="p-3" style={{ borderTop: '1px solid var(--v5-paper-2)' }}>
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl"
               style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--v5-paper-2)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px]"
                 style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}>
              {user.firstName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold truncate" style={{ color: 'var(--v5-ink)' }}>{user.firstName} {user.lastName}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--v5-ink-2)', opacity: 0.7, fontFamily: 'var(--font-mono), monospace' }}>{user.email}</p>
            </div>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="p-2 rounded-full hover:bg-black/[0.04] transition-colors"
              style={{ color: 'var(--v5-ink-2)' }}
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   Topbar — search, location pill, notifications, profile
   ───────────────────────────────────────────────────────────── */
function Topbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 h-16 px-4 sm:px-6 backdrop-blur-md"
            style={{ background: 'var(--v5-topbar-bg)', borderBottom: '1px solid var(--v5-paper-2)' }}>
      {/* Mobile menu */}
      <button
        onClick={onMobileMenu}
        className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full"
        style={{ border: '1px solid var(--v5-paper-2)', color: 'var(--v5-ink)' }}
        aria-label="Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile logo */}
      <div className="lg:hidden">
        <Logo size="sm" />
      </div>

      {/* Search bar (desktop) */}
      <div className="hidden md:flex flex-1 max-w-sm ml-2">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--v5-ink-2)', opacity: 0.6 }} />
          <input
            type="text"
            placeholder="Buscar clubes, jugadores, torneos…"
            className="w-full h-10 pl-10 pr-14 text-[13px] rounded-full transition-all"
            style={{
              background: 'var(--v5-card-bg)',
              border: '1px solid var(--v5-paper-2)',
              color: 'var(--v5-ink)',
              fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
            }}
          />
          <kbd className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 h-5 text-[10px] rounded"
               style={{ color: 'var(--v5-ink-2)', background: 'var(--v5-paper)', border: '1px solid var(--v5-paper-2)', fontFamily: 'var(--font-mono), monospace' }}>
            ⌘ K
          </kbd>
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Right cluster */}
      <div className="flex items-center gap-1.5">
        <LocationPill />

        {user && (
          <>
            {/* Role switcher */}
            {user.roles?.length > 1 && (
              <div className="relative hidden sm:block" ref={roleRef}>
                <button
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface-light px-2.5 h-9 rounded-lg border border-border-dark hover:border-border-default hover:text-text-primary transition-all"
                >
                  {roleLabel[user.roles[0]]?.icon}
                  <span className="hidden md:inline">{roleLabel[user.roles[0]]?.label || user.roles[0]}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
                </button>
                {roleOpen && (
                  <div className="dropdown right-0 mt-2 w-52">
                    <div className="px-3 py-2 text-2xs uppercase tracking-widest text-text-muted font-semibold">
                      Cambiar perfil
                    </div>
                    {user.roles.map((r: string) => (
                      <Link
                        key={r}
                        href={roleDashboard[r] || '/dashboard/player'}
                        onClick={() => setRoleOpen(false)}
                        className="dropdown-item flex items-center gap-2.5"
                      >
                        {roleLabel[r]?.icon}
                        {roleLabel[r]?.label || r}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <ThemeToggle compact />

            <Link href="/notifications" className="relative inline-flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ border: '1px solid var(--v5-paper-2)', color: 'var(--v5-ink)' }}
                  aria-label="Notificaciones">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center"
                    style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)', border: '2px solid var(--v5-paper)' }}>
                3
              </span>
            </Link>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-full transition-all"
                style={{ background: 'var(--v5-card-bg)', border: '1px solid var(--v5-paper-2)' }}
              >
                <div className="w-8 h-8 rounded-full font-bold text-[11px] flex items-center justify-center"
                     style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}>
                  {user.firstName?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block text-[12px] font-bold" style={{ color: 'var(--v5-ink)' }}>{user.firstName}</span>
                <ChevronDown className={`hidden sm:block w-3 h-3 transition-transform ${profileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--v5-ink-2)' }} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50"
                     style={{ background: '#FFFFFF', border: '1px solid var(--v5-paper-2)', boxShadow: '0 20px 50px -20px rgba(26,18,8,0.25)' }}>
                  <div className="px-4 py-3.5" style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}>
                    <p className="text-[13px] font-bold truncate" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] truncate mt-0.5 opacity-75" style={{ fontFamily: 'var(--font-mono), monospace' }}>{user.email}</p>
                    {user.roles?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.roles.map((r: string) => (
                          <span key={r} className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--v5-yellow)', color: 'var(--v5-ink)', fontFamily: 'var(--font-mono), monospace' }}>
                            {roleLabel[r]?.label || r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="py-1.5">
                    {[
                      { href: '/profile',      label: 'Mi perfil',     Icon: User },
                      { href: '/profile/edit', label: 'Configuración', Icon: Settings },
                      { href: '/connections',  label: 'Conexiones',    Icon: Users },
                      { href: '/billing',      label: 'Suscripción',   Icon: Sparkles },
                    ].map(({ href, label, Icon }) => (
                      <Link key={href} href={href}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-black/[0.04] transition-colors"
                            style={{ color: 'var(--v5-ink)' }}
                            onClick={() => setProfileOpen(false)}>
                        <Icon className="w-4 h-4" style={{ color: 'var(--v5-ink-2)' }} /> {label}
                      </Link>
                    ))}
                  </div>
                  {user.roles?.length === 0 && (
                    <div style={{ borderTop: '1px solid var(--v5-paper-2)' }} className="py-1.5">
                      <Link href="/activate" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-bold hover:bg-black/[0.04]"
                            style={{ color: 'var(--v5-orange)' }} onClick={() => setProfileOpen(false)}>
                        <Zap className="w-4 h-4" /> Activar perfil
                      </Link>
                    </div>
                  )}
                  <div className="py-1.5" style={{ borderTop: '1px solid var(--v5-paper-2)' }}>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); router.push('/'); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] w-full text-left hover:bg-black/[0.04] transition-colors"
                      style={{ color: 'var(--v5-red)' }}
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!user && (
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Link href="/login" className="hidden sm:inline-flex text-[12px] font-bold uppercase tracking-[0.1em] px-3 h-10 items-center" style={{ color: 'var(--v5-ink)' }}>
              Ingresar
            </Link>
            <Link href="/register" className="v5-btn-orange">
              <span>Empezar</span>
              <span className="v5-btn-orange__ball"><ArrowRight className="w-4 h-4" strokeWidth={2.5} /></span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mobile drawer overlay
   ───────────────────────────────────────────────────────────── */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 z-[60] h-full transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative">
          <Sidebar onNavigate={onClose} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 btn-icon-sm"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   AppShell
   ───────────────────────────────────────────────────────────── */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--v5-paper)' }}>
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMobileMenu={() => setDrawerOpen(true)} />
        <main className="v5-shell-main flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
