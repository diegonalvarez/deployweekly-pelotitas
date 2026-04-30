'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function InviteCoachModal({
  clubId,
  onClose,
  onInvited,
}: {
  clubId: string;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const data = await api.get(`/users/search?search=${encodeURIComponent(search.trim())}`);
      setResults(Array.isArray(data) ? data : data.users || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al buscar');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (userId: string) => {
    setInvitingId(userId);
    try {
      await api.post(`/coaches/invite/${clubId}/${userId}`);
      toast.success('Invitacion enviada');
      onInvited();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al invitar');
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-dark max-w-lg w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Invitar profesor</h2>
          <button onClick={onClose} className="btn-icon-sm" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <input
            className="input flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nombre..."
            autoFocus
          />
          <button
            onClick={handleSearch}
            disabled={searching || !search.trim()}
            className="btn-primary"
          >
            {searching ? <Spinner /> : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Results */}
        {results.length === 0 && !searching && search.trim() && (
          <p className="text-text-muted text-sm text-center py-8">No se encontraron usuarios</p>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-surface-light rounded-xl border border-border-dark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-padel/20 to-brand/20 flex items-center justify-center font-bold text-white text-sm">
                    {u.firstName?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-text-muted">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleInvite(u.id)}
                  disabled={invitingId === u.id}
                  className="btn-primary text-sm"
                >
                  {invitingId === u.id ? <Spinner /> : 'Invitar'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Close */}
        <div className="mt-6 pt-4 border-t border-border-dark">
          <button onClick={onClose} className="btn-ghost w-full">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function ClubCoachesPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await api.get(`/clubs/${clubId}`);
      setClub(data);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (user && clubId) fetchData();
  }, [user, clubId, fetchData]);

  const handleRespondLink = async (linkId: string, action: 'accept' | 'reject') => {
    setActionId(linkId);
    try {
      await api.patch(`/connections/${linkId}/respond`, { action });
      toast.success(action === 'accept' ? 'Profesor aceptado' : 'Solicitud rechazada');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar');
    } finally {
      setActionId(null);
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando...
        </div>
      </div>
    );
  }

  const coachLinks = club?.coachLinks || [];
  const activeCoaches = coachLinks.filter((l: any) => l.status === 'ACTIVE');
  const pendingCoaches = coachLinks.filter((l: any) => l.status === 'PENDING' || l.status === 'INVITED');

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'badge-green';
      case 'PENDING': return 'badge-yellow';
      case 'INVITED': return 'badge-padel';
      case 'REJECTED': return 'badge-red';
      default: return 'badge-neutral';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'PENDING': return 'Pendiente';
      case 'INVITED': return 'Invitado';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Back link */}
        <Link
          href="/dashboard/club"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al panel
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Profesores
            </h1>
            {club && (
              <p className="text-text-muted text-sm mt-1">{club.name}</p>
            )}
          </div>
          <button onClick={() => setShowInviteModal(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Invitar profesor
          </button>
        </div>

        {/* Pending invitations / requests */}
        {pendingCoaches.length > 0 && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pendientes
              <span className="badge-yellow text-xs">{pendingCoaches.length}</span>
            </h2>
            <div className="space-y-3">
              {pendingCoaches.map((link: any, i: number) => {
                const coach = link.coach || link.user || {};
                const coachUser = coach.user || coach;
                return (
                  <div
                    key={link.id}
                    className="card-glow animate-fade-in-up"
                    style={{ animationDelay: `${(i + 2) * 60}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-padel/20 to-brand/20 flex items-center justify-center font-bold text-padel text-lg flex-shrink-0">
                          {coachUser?.firstName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {coachUser?.firstName} {coachUser?.lastName}
                          </p>
                          {coach.sports && (
                            <div className="flex gap-1.5 mt-1">
                              {coach.sports.map((s: string) => (
                                <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                                  {s === 'PADEL' ? 'Padel' : 'Tenis'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={statusBadge(link.status)}>{statusLabel(link.status)}</span>
                        {link.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleRespondLink(link.id, 'accept')}
                              disabled={actionId === link.id}
                              className="btn-primary text-sm"
                            >
                              {actionId === link.id ? <Spinner /> : 'Aceptar'}
                            </button>
                            <button
                              onClick={() => handleRespondLink(link.id, 'reject')}
                              disabled={actionId === link.id}
                              className="btn-ghost text-sm"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active coaches */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profesores activos
            {activeCoaches.length > 0 && (
              <span className="badge-green text-xs">{activeCoaches.length}</span>
            )}
          </h2>

          {activeCoaches.length === 0 ? (
            <div className="card-elevated text-center py-16">
              <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-secondary mb-2">Sin profesores activos</h3>
              <p className="text-text-muted mb-6 max-w-md mx-auto">
                Invita profesores a tu complejo para que puedan dar clases y gestionar su agenda.
              </p>
              <button onClick={() => setShowInviteModal(true)} className="btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Invitar primer profesor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCoaches.map((link: any, i: number) => {
                const coach = link.coach || link.user || {};
                const coachUser = coach.user || coach;
                return (
                  <div
                    key={link.id}
                    className="card-glow animate-fade-in-up"
                    style={{ animationDelay: `${(i + 4) * 60}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-padel/20 to-brand/20 flex items-center justify-center font-bold text-padel text-lg flex-shrink-0">
                          {coachUser?.firstName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {coachUser?.firstName} {coachUser?.lastName}
                          </p>
                          {coach.sports && (
                            <div className="flex gap-1.5 mt-1">
                              {coach.sports.map((s: string) => (
                                <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                                  {s === 'PADEL' ? 'Padel' : 'Tenis'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="badge-green">Activo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <InviteCoachModal
          clubId={clubId}
          onClose={() => setShowInviteModal(false)}
          onInvited={fetchData}
        />
      )}
    </div>
  );
}
