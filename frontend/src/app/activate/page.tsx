'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const profiles = [
  {
    role: 'PLAYER',
    title: 'Jugador',
    desc: 'Reserva canchas, encontra rivales, participa en torneos y lleva tu historial deportivo.',
    icon: '🎾',
    dashboard: '/dashboard/player',
    gradient: 'from-brand/20 to-brand/5',
  },
  {
    role: 'COACH',
    title: 'Profesor',
    desc: 'Publica tu disponibilidad, recibe alumnos y gestiona tu calendario en multiples complejos.',
    icon: '🎓',
    dashboard: '/dashboard/coach',
    gradient: 'from-padel/20 to-padel/5',
  },
  {
    role: 'CLUB_OWNER',
    title: 'Complejo',
    desc: 'Registra tu club, publica canchas, gestiona reservas, profesores y torneos.',
    icon: '🏟️',
    dashboard: '/dashboard/club',
    gradient: 'from-warning/20 to-warning/5',
  },
  {
    role: 'TOURNAMENT_ORGANIZER',
    title: 'Organizador',
    desc: 'Organiza torneos en complejos asociados. Hasta 5 torneos gratis.',
    icon: '🏆',
    dashboard: '/dashboard/organizer',
    gradient: 'from-negative/20 to-negative/5',
  },
];

export default function ActivatePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleActivate = async (role: string, dashboard: string) => {
    setLoading(role);
    try {
      await api.post('/auth/activate-profile', { role });
      await refreshUser();
      toast.success('Perfil activado!');
      if (role === 'CLUB_OWNER') {
        router.push('/dashboard/club');
      } else {
        router.push(dashboard);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al activar perfil');
    } finally {
      setLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  const activeRoles = user.roles || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/[0.03] rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 badge-brand mb-4 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Activar perfil
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Como queres usar <span className="text-gradient">Pelotitas</span>?
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Podes activar multiples perfiles. Cada uno desbloquea funcionalidades distintas.
          </p>
        </div>

        {/* Profile cards grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {profiles.map((p, i) => {
            const isActive = activeRoles.includes(p.role);
            return (
              <div
                key={p.role}
                className={`
                  card-glow relative overflow-hidden group
                  animate-fade-in-up
                  ${isActive ? 'border-brand/50 shadow-glow-green-sm' : ''}
                `}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Active check */}
                {isActive && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-brand rounded-full flex items-center justify-center shadow-glow-green-sm animate-scale-in">
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {p.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2 text-white">{p.title}</h3>
                  <p className="text-sm text-text-secondary mb-5 leading-relaxed">{p.desc}</p>

                  {/* Action */}
                  {isActive ? (
                    <div className="flex items-center gap-2">
                      <span className="badge-brand">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Activo
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleActivate(p.role, p.dashboard)}
                      className="btn-primary text-sm"
                      disabled={loading === p.role}
                    >
                      {loading === p.role ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Activando...
                        </span>
                      ) : 'Activar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Go to dashboard */}
        {activeRoles.length > 0 && (
          <div className="text-center mt-10 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <button
              onClick={() => router.push(profiles.find(p => activeRoles.includes(p.role))?.dashboard || '/')}
              className="btn-secondary px-8 py-3"
            >
              Ir al dashboard
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
