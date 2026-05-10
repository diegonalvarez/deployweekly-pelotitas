'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import RoleActivator from '@/components/RoleActivator';

export default function ActivatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    if (typeof window !== 'undefined') router.push('/login?next=/activate');
    return null;
  }

  const activeCount = user.roles?.length || 0;

  const intro = (
    <header className="mb-8">
      <p className="eyebrow text-text-muted">Tus perfiles</p>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mt-3">
        <div>
          <h1 className="text-2xl sm:text-display-4 font-bold text-text-primary tracking-tight-2 leading-tight">
            ¿Cómo querés usar <span className="text-gradient">pelotitas</span>?
          </h1>
          <p className="text-sm text-text-secondary mt-2 max-w-xl leading-relaxed">
            Podés activar uno o varios perfiles. Cada uno desbloquea funcionalidades distintas.
          </p>
        </div>
        {activeCount > 0 && (
          <div className="text-2xs text-text-muted tabular">
            {activeCount} perfil{activeCount === 1 ? '' : 'es'} activo{activeCount === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </header>
  );

  return (
    <>
      <RoleActivator mode="full" intro={intro} redirectAfter={true} />
      {activeCount > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 text-center">
          <Link href="/" className="btn-ghost text-sm">
            Volver al inicio
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </>
  );
}
