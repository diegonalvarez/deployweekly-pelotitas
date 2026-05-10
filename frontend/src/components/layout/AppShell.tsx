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
   Logo (compact)
   ───────────────────────────────────────────────────────────── */
function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <Link href="/" className={`flex items-center gap-0 group ${sz} font-bold tracking-tight`}>
      <span className="text-text-primary">pelot</span>
      <span className="text-text-primary relative">
        <span className="relative">
          i
          <span
            className="absolute -top-[0.1em] left-1/2 -translate-x-1/2 brand-dot"
            style={{ width: '0.22em', height: '0.22em' }}
            aria-hidden="true"
          />
        </span>
      </span>
      <span className="text-text-primary">tas</span>
      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] tracking-widest font-semibold text-brand bg-brand/10 rounded uppercase border border-brand/15">
        OS
      </span>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Visitor CTA (top of sidebar when logged out)
   ───────────────────────────────────────────────────────────── */
function VisitorCTA({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mx-3 mb-4 mt-2 p-3.5 rounded-xl border border-border-dark bg-gradient-to-br from-brand/5 via-surface to-transparent relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-brand/15 blur-2xl pointer-events-none" />
      <div className="relative">
        <p className="eyebrow text-text-muted mb-2">Sin cuenta</p>
        <p className="text-sm font-semibold text-text-primary leading-snug mb-1">
          Reservá. Competí. Mejorá.
        </p>
        <p className="text-2xs text-text-muted leading-relaxed mb-3">
          Crea tu cuenta gratis para acceder a todo.
        </p>
        <Link
          href="/register"
          onClick={onNavigate}
          className="btn-primary text-xs h-8 w-full justify-center group"
        >
          Crear cuenta
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/login"
          onClick={onNavigate}
          className="block text-center text-2xs text-text-secondary hover:text-text-primary mt-2 transition-colors"
        >
          ¿Ya tenés cuenta? Iniciá sesión
        </Link>
      </div>
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
    <aside className="w-60 shrink-0 border-r border-border-dark bg-base flex flex-col h-screen sticky top-0">
      {/* Logo block */}
      <div className="h-14 flex items-center px-5 border-b border-border-dark">
        <Logo />
      </div>

      {/* Visitor CTA at top when logged out */}
      {!user && <VisitorCTA onNavigate={onNavigate} />}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 mb-2 text-2xs font-semibold uppercase text-text-muted tracking-widest" style={{ letterSpacing: '0.1em' }}>
              {g.title}
            </p>
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={onNavigate}
                  className={`side-nav-link ${isActive(it.href, it.exact) ? 'is-active' : ''}`}
                >
                  <span className="opacity-70">{it.icon}</span>
                  {it.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Visitor: extra link to landing/marketing */}
        {!user && (
          <div>
            <p className="px-3 mb-2 text-2xs font-semibold uppercase text-text-muted tracking-widest" style={{ letterSpacing: '0.1em' }}>
              Acerca
            </p>
            <Link href="/" onClick={onNavigate} className="side-nav-link">
              <Compass className="w-4 h-4 opacity-70" />
              Conocé pelotitas
            </Link>
          </div>
        )}
      </nav>

      {/* User block */}
      {user && (
        <div className="border-t border-border-dark p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/30 to-brand/5 text-brand-ink font-bold text-xs flex items-center justify-center border border-brand/30">
              {user.firstName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[11px] text-text-muted truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="text-text-muted hover:text-negative transition-colors p-1.5 rounded-md hover:bg-surface-light"
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
    <header className="topbar sticky top-0 z-40">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenu}
        className="lg:hidden btn-icon-sm"
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar clubes, jugadores, torneos…"
            className="w-full h-9 pl-10 pr-12 bg-surface-light text-sm text-text-primary rounded-lg border border-border-dark focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15 placeholder:text-text-muted transition-all"
          />
          <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 h-5 text-[10px] font-mono text-text-muted bg-base border border-border-dark rounded">
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
                    {user.roles?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.roles.map((r: string) => (
                          <span key={r} className="text-2xs bg-surface-light text-text-secondary px-1.5 py-0.5 rounded">
                            {roleLabel[r]?.label || r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="py-1">
                    <Link href="/profile" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                      <User className="w-4 h-4 text-text-muted" /> Mi perfil
                    </Link>
                    <Link href="/profile/edit" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                      <Settings className="w-4 h-4 text-text-muted" /> Configuración
                    </Link>
                    <Link href="/connections" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                      <Users className="w-4 h-4 text-text-muted" /> Conexiones
                    </Link>
                    <Link href="/billing" className="dropdown-item flex items-center gap-2.5" onClick={() => setProfileOpen(false)}>
                      <Sparkles className="w-4 h-4 text-text-muted" /> Suscripción
                    </Link>
                  </div>
                  {user.roles?.length === 0 && (
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
        )}

        {!user && (
          <div className="flex items-center gap-1.5">
            <Link href="/login" className="btn-ghost text-sm h-9 px-3 hidden sm:inline-flex">
              Ingresar
            </Link>
            <Link href="/register" className="btn-primary text-sm h-9 group">
              <span className="hidden sm:inline">Empezar</span>
              <span className="sm:hidden">Crear cuenta</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
    <div className="flex bg-base min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMobileMenu={() => setDrawerOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
