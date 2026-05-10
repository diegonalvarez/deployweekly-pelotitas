'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/RoleGuard';

export default function AdminDashboardPage() {
  return <RoleGuard role="ADMIN"><AdminDashboard /></RoleGuard>;
}

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [flags, setFlags] = useState<any[]>([]);
  const [pendingClubs, setPendingClubs] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters for users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userIdentityFilter, setUserIdentityFilter] = useState('');

  // Tournament section
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);

  // Coaches section
  const [coaches, setCoaches] = useState<any[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(false);

  // Reviews section
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [warningsOnly, setWarningsOnly] = useState(false);

  const loadData = () => {
    if (user?.roles.includes('ADMIN')) {
      api.get('/admin/dashboard').then(setStats).catch(() => {});
      api.get('/admin/feature-flags').then(setFlags).catch(() => {});
      api.get('/clubs/pending').then(setPendingClubs).catch(() => {});
      loadUsers();
      loadTournaments();
      loadCoaches();
      loadReviews();
    }
  };

  const loadUsers = () => {
    const params = new URLSearchParams();
    params.set('page', String(usersPage));
    if (userSearch.trim()) params.set('search', userSearch.trim());
    if (userRoleFilter) params.set('role', userRoleFilter);
    if (userIdentityFilter) params.set('identityStatus', userIdentityFilter);

    api.get(`/admin/users?${params.toString()}`).then(res => {
      setUsers(res.users || []);
      setUsersTotalPages(res.totalPages || 1);
    }).catch(() => {});
  };

  const loadTournaments = () => {
    setTournamentsLoading(true);
    api.get('/admin/tournaments').then((res: any) => {
      const list = Array.isArray(res) ? res : res.tournaments || [];
      setTournaments(list);
    }).catch(() => {}).finally(() => setTournamentsLoading(false));
  };

  const loadCoaches = () => {
    setCoachesLoading(true);
    api.get('/admin/coaches').then((res: any) => {
      const list = Array.isArray(res) ? res : res.coaches || [];
      setCoaches(list);
    }).catch(() => {}).finally(() => setCoachesLoading(false));
  };

  const loadReviews = () => {
    setReviewsLoading(true);
    const url = warningsOnly ? '/admin/reviews?warningsOnly=true' : '/admin/reviews';
    api.get(url).then((res: any) => {
      const list = Array.isArray(res) ? res : res.reviews || [];
      setReviews(list);
    }).catch(() => {}).finally(() => setReviewsLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  useEffect(() => {
    if (user?.roles.includes('ADMIN')) loadUsers();
  }, [usersPage, userSearch, userRoleFilter, userIdentityFilter]);

  useEffect(() => {
    if (user?.roles.includes('ADMIN')) loadReviews();
  }, [warningsOnly]);

  const handleApproveClub = async (clubId: string) => {
    setActionLoading(clubId);
    try {
      await api.patch(`/clubs/${clubId}/approve`);
      toast.success('Complejo aprobado!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
    setActionLoading(null);
  };

  const handleRejectClub = async (clubId: string) => {
    const reason = prompt('Motivo del rechazo (opcional):');
    setActionLoading(clubId);
    try {
      await api.patch(`/clubs/${clubId}/reject`, { reason: reason || undefined });
      toast.success('Complejo rechazado');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
    setActionLoading(null);
  };

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    setActionLoading(`toggle-${userId}`);
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      toast.success(currentlyActive ? 'Usuario desactivado' : 'Usuario activado');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
    setActionLoading(null);
  };

  const handleVerifyIdentity = async (userId: string) => {
    setActionLoading(`verify-${userId}`);
    try {
      await api.patch(`/admin/users/${userId}/verify-identity`);
      toast.success('Identidad verificada');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
    setActionLoading(null);
  };

  const handleToggleFlag = async (key: string, currentValue: string | boolean) => {
    const newValue = currentValue === 'true' || currentValue === true ? 'false' : 'true';
    setActionLoading(`flag-${key}`);
    try {
      await api.patch(`/admin/feature-flags/${key}`, { value: newValue });
      toast.success('Flag actualizado');
      api.get('/admin/feature-flags').then(setFlags).catch(() => {});
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
    setActionLoading(null);
  };

  if (authLoading || !user) {
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

  const statIcons: Record<string, string> = {
    users: '👥',
    players: '🎾',
    coaches: '🎓',
    clubs: '🏟️',
    courts: '🏸',
    tournaments: '🏆',
    reservations: '📅',
    matches: '⚡',
    pendingClubs: '⏳',
    notifications: '🔔',
  };

  const statColors: Record<string, string> = {
    users: 'text-brand',
    players: 'text-brand',
    coaches: 'text-padel',
    clubs: 'text-warning',
    courts: 'text-padel',
    tournaments: 'text-brand',
    reservations: 'text-padel',
    matches: 'text-brand',
    pendingClubs: 'text-warning',
    notifications: 'text-negative',
  };

  const statLabels: Record<string, string> = {
    users: 'Usuarios',
    players: 'Jugadores',
    coaches: 'Profesores',
    clubs: 'Complejos',
    courts: 'Canchas',
    tournaments: 'Torneos',
    reservations: 'Reservas',
    matches: 'Partidos',
    pendingClubs: 'Clubs pendientes',
    notifications: 'Notificaciones',
  };

  const roleLabel = (r: string) => {
    switch (r) {
      case 'PLAYER': return 'Jugador';
      case 'COACH': return 'Profesor';
      case 'CLUB_OWNER': return 'Club';
      case 'TOURNAMENT_ORGANIZER': return 'Org.';
      case 'ADMIN': return 'Admin';
      default: return r;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 rounded-full bg-negative" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
            <span className="badge-red">Admin</span>
          </div>
          <p className="text-text-muted text-sm ml-5">Panel de administracion de Pelotitas</p>
        </div>

        {/* Pending clubs section */}
        {pendingClubs.length > 0 && (
          <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 rounded-full bg-warning" />
              <h2 className="text-lg font-bold text-white">
                Complejos pendientes de aprobacion
              </h2>
              <span className="badge-yellow">{pendingClubs.length}</span>
            </div>

            <div className="space-y-3">
              {pendingClubs.map((club: any, i: number) => (
                <div
                  key={club.id}
                  className="card-elevated animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 80}ms` }}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Club info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-xl shrink-0">
                        🏟️
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{club.name}</h3>
                        {club.locations?.[0] && (
                          <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {club.locations[0].address}, {club.locations[0].city}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {club.sports?.map((s: string) => (
                            <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                              {s === 'PADEL' ? 'Padel' : 'Tenis'}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border-dark">
                          <p className="text-xs text-text-muted">
                            Propietario: <span className="text-text-secondary">{club.owner?.firstName} {club.owner?.lastName}</span>
                          </p>
                          <p className="text-xs text-text-muted">
                            Email: <span className="text-text-secondary">{club.owner?.email}</span>
                          </p>
                          {club.owner?.phone && (
                            <p className="text-xs text-text-muted">
                              Tel: <span className="text-text-secondary">{club.owner.phone}</span>
                            </p>
                          )}
                          {club.phone && (
                            <p className="text-xs text-text-muted">
                              Tel complejo: <span className="text-text-secondary">{club.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveClub(club.id)}
                        disabled={actionLoading === club.id}
                        className="btn-primary text-sm flex-1 sm:flex-none"
                      >
                        {actionLoading === club.id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Aprobar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectClub(club.id)}
                        disabled={actionLoading === club.id}
                        className="btn-danger text-sm flex-1 sm:flex-none"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {Object.entries(stats).map(([key, value], i) => (
              <div
                key={key}
                className="stat-card animate-fade-in-up"
                style={{ animationDelay: `${(i + 1) * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xl">{statIcons[key] || '📊'}</span>
                </div>
                <p className={`stat-value ${statColors[key] || 'text-white'}`}>{value as number}</p>
                <p className="stat-label">{statLabels[key] || key}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Users table with filters and actions */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuarios
            </h2>

            {/* Filters */}
            <div className="card-elevated mb-4 p-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">Buscar</label>
                  <input
                    className="input text-sm"
                    placeholder="Nombre o email..."
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUsersPage(1); }}
                  />
                </div>
                <div>
                  <label className="label text-xs">Rol</label>
                  <div className="relative">
                    <select
                      className="input text-sm appearance-none pr-8 cursor-pointer"
                      value={userRoleFilter}
                      onChange={e => { setUserRoleFilter(e.target.value); setUsersPage(1); }}
                    >
                      <option value="">Todos</option>
                      <option value="PLAYER">Jugador</option>
                      <option value="COACH">Profesor</option>
                      <option value="CLUB_OWNER">Club</option>
                      <option value="TOURNAMENT_ORGANIZER">Organizador</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Identidad</label>
                  <div className="relative">
                    <select
                      className="input text-sm appearance-none pr-8 cursor-pointer"
                      value={userIdentityFilter}
                      onChange={e => { setUserIdentityFilter(e.target.value); setUsersPage(1); }}
                    >
                      <option value="">Todos</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="VERIFIED">Verificado</option>
                      <option value="REJECTED">Rechazado</option>
                      <option value="NOT_SUBMITTED">Sin enviar</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-elevated overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-dark bg-surface-light/50">
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Usuario</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Roles</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Estado</th>
                      <th className="text-right py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 15).map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-border-dark/50 hover:bg-surface-light/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand/15 text-brand flex items-center justify-center font-bold text-xs">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <span className="font-medium text-white">{u.firstName} {u.lastName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-muted text-xs">{u.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {u.roles.map((r: string) => (
                              <span key={r} className="badge-neutral text-2xs">
                                {roleLabel(r)}
                              </span>
                            ))}
                            {u.roles.length === 0 && (
                              <span className="text-xs text-text-muted italic">Sin perfil</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span className={u.isActive !== false ? 'badge-green text-2xs' : 'badge-red text-2xs'}>
                              {u.isActive !== false ? 'Activo' : 'Inactivo'}
                            </span>
                            {u.identityStatus && u.identityStatus !== 'NOT_SUBMITTED' && (
                              <span className={
                                u.identityStatus === 'VERIFIED' ? 'badge-brand text-2xs' :
                                u.identityStatus === 'PENDING' ? 'badge-yellow text-2xs' :
                                'badge-red text-2xs'
                              }>
                                {u.identityStatus === 'VERIFIED' ? 'ID Verificado' :
                                 u.identityStatus === 'PENDING' ? 'ID Pendiente' :
                                 'ID Rechazado'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(u.id, u.isActive !== false)}
                              disabled={actionLoading === `toggle-${u.id}`}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                u.isActive !== false
                                  ? 'bg-negative/10 text-negative hover:bg-negative/20'
                                  : 'bg-brand/10 text-brand hover:bg-brand/20'
                              }`}
                            >
                              {actionLoading === `toggle-${u.id}` ? '...' : u.isActive !== false ? 'Desactivar' : 'Activar'}
                            </button>
                            {u.identityStatus !== 'VERIFIED' && (
                              <button
                                onClick={() => handleVerifyIdentity(u.id)}
                                disabled={actionLoading === `verify-${u.id}`}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-padel/10 text-padel hover:bg-padel/20 transition-colors"
                              >
                                {actionLoading === `verify-${u.id}` ? '...' : 'Verificar ID'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-dark">
                  <p className="text-xs text-text-muted">Pagina {usersPage} de {usersTotalPages}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                      disabled={usersPage <= 1}
                      className="btn-ghost text-xs px-3 py-1"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                      disabled={usersPage >= usersTotalPages}
                      className="btn-ghost text-xs px-3 py-1"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature flags */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Feature Flags
            </h2>

            <div className="card-elevated">
              {flags.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2 opacity-20">🚩</div>
                  <p className="text-text-muted text-sm">No hay flags configurados</p>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-border-dark/50">
                  {flags.map(f => {
                    const isActive = f.value === 'true' || f.value === true;
                    return (
                      <div key={f.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="font-mono text-sm text-white truncate">{f.key}</p>
                          {f.description && (
                            <p className="text-xs text-text-muted mt-0.5 truncate">{f.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleFlag(f.key, f.value)}
                          disabled={actionLoading === `flag-${f.key}`}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base focus:ring-brand/50 ${
                            isActive ? 'bg-brand' : 'bg-surface-light border border-border-dark'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                              isActive ? 'translate-x-6 bg-black' : 'translate-x-1 bg-text-muted'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tournaments section */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 rounded-full bg-brand" />
            <h2 className="text-lg font-bold text-white">Torneos</h2>
            {tournaments.length > 0 && <span className="badge-neutral">{tournaments.length}</span>}
          </div>

          {tournamentsLoading ? (
            <div className="card-elevated text-center py-12">
              <div className="flex items-center justify-center gap-3 text-text-muted">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando...
              </div>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="card-elevated text-center py-12">
              <div className="text-4xl mb-3 opacity-20">🏆</div>
              <p className="text-text-muted">No hay torneos registrados</p>
            </div>
          ) : (
            <div className="card-elevated overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-dark bg-surface-light/50">
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Torneo</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Complejo</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Organizador</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Deporte</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Estado</th>
                      <th className="text-center py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Equipos</th>
                      <th className="text-center py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Billing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map(t => {
                      const statusBadge =
                        t.status === 'IN_PROGRESS' ? 'badge-green' :
                        t.status === 'COMPLETED' ? 'badge-brand' :
                        t.status === 'REGISTRATION_OPEN' ? 'badge-yellow' :
                        t.status === 'CANCELLED' ? 'badge-red' :
                        'badge-neutral';
                      const statusLabel =
                        t.status === 'DRAFT' ? 'Borrador' :
                        t.status === 'REGISTRATION_OPEN' ? 'Inscripcion' :
                        t.status === 'REGISTRATION_CLOSED' ? 'Cerrado' :
                        t.status === 'IN_PROGRESS' ? 'En curso' :
                        t.status === 'COMPLETED' ? 'Finalizado' :
                        t.status === 'CANCELLED' ? 'Cancelado' :
                        t.status;

                      return (
                        <tr key={t.id} className="border-b border-border-dark/50 hover:bg-surface-light/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-white">{t.name}</td>
                          <td className="py-3 px-4 text-text-muted text-xs">{t.club?.name || '-'}</td>
                          <td className="py-3 px-4 text-text-muted text-xs">
                            {t.createdBy?.firstName} {t.createdBy?.lastName}
                          </td>
                          <td className="py-3 px-4">
                            <span className={t.sport === 'PADEL' ? 'badge-padel text-2xs' : 'badge-tennis text-2xs'}>
                              {t.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`${statusBadge} text-2xs`}>{statusLabel}</span>
                          </td>
                          <td className="py-3 px-4 text-center text-text-secondary">
                            {t._count?.teams ?? t.teams?.length ?? 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={t.isBillable ? 'badge-brand text-2xs' : 'badge-neutral text-2xs'}>
                              {t.isBillable ? 'Pago' : 'Gratis'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Coaches section */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 rounded-full bg-padel" />
            <h2 className="text-lg font-bold text-white">Profesores</h2>
            {coaches.length > 0 && <span className="badge-neutral">{coaches.length}</span>}
          </div>

          {coachesLoading ? (
            <div className="card-elevated text-center py-12">
              <div className="flex items-center justify-center gap-3 text-text-muted">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando...
              </div>
            </div>
          ) : coaches.length === 0 ? (
            <div className="card-elevated text-center py-12">
              <div className="text-4xl mb-3 opacity-20">🎓</div>
              <p className="text-text-muted">No hay profesores registrados</p>
            </div>
          ) : (
            <div className="card-elevated overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-dark bg-surface-light/50">
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Profesor</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Deportes</th>
                      <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Complejos</th>
                      <th className="text-center py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Reservas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coaches.map((c: any) => (
                      <tr key={c.id} className="border-b border-border-dark/50 hover:bg-surface-light/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-padel/15 text-padel flex items-center justify-center font-bold text-xs">
                              {c.user?.firstName?.[0] || c.firstName?.[0] || '?'}{c.user?.lastName?.[0] || c.lastName?.[0] || ''}
                            </div>
                            <span className="font-medium text-white">
                              {c.user?.firstName || c.firstName} {c.user?.lastName || c.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {(c.sports || []).map((s: string) => (
                              <span key={s} className={s === 'PADEL' ? 'badge-padel text-2xs' : 'badge-tennis text-2xs'}>
                                {s === 'PADEL' ? 'Padel' : 'Tenis'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-muted text-xs">
                          {c.clubs?.map((cl: any) => cl.name || cl.club?.name).filter(Boolean).join(', ') || '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-text-secondary">
                          {c._count?.bookings ?? c.bookingCount ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Reviews section */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-warning" />
              <h2 className="text-lg font-bold text-white">Resenas de profesores</h2>
              {reviews.length > 0 && <span className="badge-neutral">{reviews.length}</span>}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-text-muted">Solo advertencias</span>
              <button
                type="button"
                role="switch"
                aria-checked={warningsOnly}
                onClick={() => setWarningsOnly(!warningsOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base focus:ring-brand/50 ${
                  warningsOnly ? 'bg-warning' : 'bg-surface-light border border-border-dark'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                    warningsOnly ? 'translate-x-6 bg-black' : 'translate-x-1 bg-text-muted'
                  }`}
                />
              </button>
            </label>
          </div>

          {reviewsLoading ? (
            <div className="card-elevated text-center py-12">
              <div className="flex items-center justify-center gap-3 text-text-muted">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando...
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="card-elevated text-center py-12">
              <div className="text-4xl mb-3 opacity-20">📝</div>
              <p className="text-text-muted">
                {warningsOnly ? 'No hay resenas con advertencias' : 'No hay resenas registradas'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <div key={r.id} className="card-elevated">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      r.hasWarning || r.warning ? 'bg-warning/10' : 'bg-padel/10'
                    }`}>
                      {r.hasWarning || r.warning ? '⚠️' : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">
                          {r.coach?.user?.firstName || r.coachName || 'Profesor'}
                        </span>
                        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-text-secondary text-sm">
                          {r.student?.firstName || r.studentName || 'Alumno'} {r.student?.lastName || ''}
                        </span>
                        {(r.hasWarning || r.warning) && (
                          <span className="badge-yellow text-2xs">Advertencia</span>
                        )}
                        {r.rating && (
                          <span className="badge-neutral text-2xs">{r.rating}/5</span>
                        )}
                      </div>
                      {r.comment && (
                        <p className="text-text-muted text-sm mt-2 leading-relaxed">{r.comment}</p>
                      )}
                      {r.createdAt && (
                        <p className="text-text-muted text-xs mt-2 tabular">
                          {formatDate(r.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
