'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const roleInfo: Record<string, { label: string; icon: string; desc: string }> = {
  PLAYER: { label: 'Jugador', icon: '🎾', desc: 'Reserva canchas, encontra rivales, participa en torneos.' },
  COACH: { label: 'Profesor', icon: '🎓', desc: 'Publica tu disponibilidad y recibe alumnos.' },
  CLUB_OWNER: { label: 'Complejo', icon: '🏟️', desc: 'Registra tu club, gestiona canchas y reservas.' },
  TOURNAMENT_ORGANIZER: { label: 'Organizador', icon: '🏆', desc: 'Organiza torneos en complejos asociados.' },
  ADMIN: { label: 'Administrador', icon: '🛡️', desc: 'Panel de administracion.' },
};

export default function RoleGuard({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [activating, setActivating] = useState(false);

  if (loading) {
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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4 opacity-20">🔒</div>
        <h2 className="text-xl font-bold text-text-secondary mb-2">Inicia sesion</h2>
        <p className="text-text-muted mb-6">Necesitas estar logueado para acceder</p>
        <Link href="/login" className="btn-primary">Ingresar</Link>
      </div>
    );
  }

  // User has the role — render children
  if (user.roles.includes(role)) {
    return <>{children}</>;
  }

  // User does NOT have the role — show activation prompt
  const info = roleInfo[role] || { label: role, icon: '👤', desc: '' };

  const handleActivate = async () => {
    setActivating(true);
    try {
      await api.post('/auth/activate-profile', { role });
      await refreshUser();
      toast.success(`Perfil de ${info.label} activado!`);
    } catch (err: any) {
      toast.error(err.message || 'Error al activar perfil');
    }
    setActivating(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass p-8 sm:p-10 max-w-md w-full text-center animate-fade-in-up">
        <div className="text-5xl mb-4">{info.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">Perfil de {info.label}</h2>
        <p className="text-text-secondary mb-2">{info.desc}</p>
        <p className="text-text-muted text-sm mb-8">
          No tenes este perfil activado todavia. Activalo para acceder a este panel.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleActivate}
            disabled={activating}
            className="btn-primary w-full py-3"
          >
            {activating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Activando...
              </span>
            ) : (
              `Activar perfil de ${info.label}`
            )}
          </button>
          <button
            onClick={() => router.back()}
            className="btn-ghost text-sm"
          >
            Volver
          </button>
        </div>

        {/* Show current roles */}
        <div className="mt-8 pt-6 border-t border-border-dark">
          <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">Tus perfiles activos</p>
          <div className="flex flex-wrap justify-center gap-2">
            {user.roles.length === 0 ? (
              <span className="text-text-muted text-sm">Ninguno</span>
            ) : (
              user.roles.map(r => (
                <span key={r} className="badge-brand">
                  {roleInfo[r]?.icon} {roleInfo[r]?.label || r}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
