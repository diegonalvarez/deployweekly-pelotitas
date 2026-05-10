'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Loader2, Lock } from 'lucide-react';
import RoleActivator, { ROLE_BY_KEY } from './RoleActivator';

/* ─────────────────────────────────────────────────────────────
   RoleGuard — wraps a dashboard route. If the user has the
   required role, renders children. Otherwise, shows the unified
   RoleActivator with the requested role highlighted.

   Standardised: same UI as /activate and the bottom-of-page banner,
   so the user can activate ANY role from a single picker.
   ───────────────────────────────────────────────────────────── */
export default function RoleGuard({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-lg bg-surface-light text-text-muted flex items-center justify-center mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Iniciá sesión</h2>
        <p className="text-sm text-text-muted mb-6">Necesitás estar logueado para acceder.</p>
        <Link href="/login" className="btn-primary">Ingresar</Link>
      </div>
    );
  }

  // User has the role — render children
  if (user.roles.includes(role)) {
    return <>{children}</>;
  }

  // User does NOT have the role — show the unified activator with this role highlighted.
  const info = ROLE_BY_KEY[role];
  const intro = (
    <header className="mb-8 text-center">
      <p className="eyebrow text-text-muted justify-center inline-flex">Acceso restringido</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight-2 mt-3">
        Activá tu perfil para entrar
      </h1>
      <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto leading-relaxed">
        {info
          ? <>Este panel es para tu perfil de <span className="text-text-primary font-medium">{info.label}</span>.
              Podés activarlo o usar pelotitas con otros perfiles — todos están disponibles abajo.</>
          : <>Necesitás un perfil activo para acceder. Elegí uno o varios.</>
        }
      </p>
    </header>
  );

  return <RoleActivator mode="guard" highlight={role} intro={intro} redirectAfter={false} />;
}
