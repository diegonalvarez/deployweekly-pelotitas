'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ALL_ROLES = [
  {
    role: 'PLAYER',
    label: 'Jugador',
    icon: '🎾',
    desc: 'Reserva canchas y participa en torneos.',
    dashboard: '/dashboard/player',
  },
  {
    role: 'COACH',
    label: 'Profesor',
    icon: '🎓',
    desc: 'Gestiona tu agenda y clases.',
    dashboard: '/dashboard/coach',
  },
  {
    role: 'CLUB_OWNER',
    label: 'Complejo',
    icon: '🏟️',
    desc: 'Administra tu club y canchas.',
    dashboard: '/dashboard/club',
  },
  {
    role: 'TOURNAMENT_ORGANIZER',
    label: 'Organizador',
    icon: '🏆',
    desc: 'Organiza torneos en complejos.',
    dashboard: '/dashboard/organizer',
  },
];

export default function ActivateRoleBanner({ currentRole }: { currentRole: string }) {
  const { user, refreshUser } = useAuth();
  const [activatingRole, setActivatingRole] = useState<string | null>(null);

  if (!user) return null;

  const inactiveRoles = ALL_ROLES.filter(
    r => r.role !== currentRole && !user.roles.includes(r.role)
  );

  if (inactiveRoles.length === 0) return null;

  const handleActivate = async (role: string) => {
    setActivatingRole(role);
    try {
      await api.post('/auth/activate-profile', { role });
      await refreshUser();
      const info = ALL_ROLES.find(r => r.role === role);
      toast.success(`Perfil de ${info?.label || role} activado!`);
    } catch (err: any) {
      toast.error(err.message || 'Error al activar perfil');
    } finally {
      setActivatingRole(null);
    }
  };

  return (
    <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambien podes usar Pelotitas como:
            </h3>
            <p className="text-text-muted text-sm mt-1">Activa otros perfiles para acceder a mas funcionalidades</p>
          </div>
          <Link href="/activate" className="text-sm text-brand hover:underline font-medium whitespace-nowrap">
            Gestionar todos mis perfiles →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inactiveRoles.map(r => (
            <div
              key={r.role}
              className="bg-surface-light rounded-2xl border border-border-dark p-5 flex flex-col gap-3 hover:border-border-default transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {r.icon}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{r.label}</p>
                  <p className="text-xs text-text-muted">{r.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleActivate(r.role)}
                disabled={activatingRole === r.role}
                className="btn-outline text-sm w-full mt-auto"
              >
                {activatingRole === r.role ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Activando...
                  </span>
                ) : (
                  'Activar'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
