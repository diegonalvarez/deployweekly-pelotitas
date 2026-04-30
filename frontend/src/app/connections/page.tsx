'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Tab = 'received' | 'sent' | 'active';

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  PLAYER_CLUB: 'Jugador - Club',
  PLAYER_COACH: 'Jugador - Profesor',
  ORGANIZER_CLUB: 'Organizador - Club',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'badge-yellow' },
  ACCEPTED: { label: 'Activa', className: 'badge-green' },
  REJECTED: { label: 'Rechazada', className: 'badge-red' },
  BLOCKED: { label: 'Bloqueada', className: 'badge-red' },
};

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SmallSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ConnectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('received');
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [receivedData, sentData, activeData] = await Promise.all([
        api.get('/connections/pending'),
        api.get('/connections?direction=sent&status=PENDING'),
        api.get('/connections?status=ACCEPTED'),
      ]);
      setReceived(Array.isArray(receivedData) ? receivedData : receivedData.connections || []);
      setSent(Array.isArray(sentData) ? sentData : sentData.connections || []);
      setActive(Array.isArray(activeData) ? activeData : activeData.connections || []);
    } catch (err: any) {
      toast.error('Error al cargar conexiones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  const handleRespond = async (connectionId: string, action: 'accept' | 'reject') => {
    setActionLoading(connectionId + action);
    try {
      await api.patch(`/connections/${connectionId}/respond`, { action });
      toast.success(action === 'accept' ? 'Conexion aceptada' : 'Conexion rechazada');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Error al responder');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (connectionId: string) => {
    setActionLoading(connectionId + 'cancel');
    try {
      await api.delete(`/connections/${connectionId}`);
      toast.success('Solicitud cancelada');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Error al cancelar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    setActionLoading(connectionId + 'disconnect');
    try {
      await api.delete(`/connections/${connectionId}`);
      toast.success('Conexion eliminada');
      loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Error al desconectar');
    } finally {
      setActionLoading(null);
    }
  };

  const getOtherUser = (conn: any) => {
    if (conn.fromUser?.id === user?.id) return conn.toUser;
    return conn.fromUser;
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted"><Spinner /> Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4 opacity-20">🔗</div>
        <h2 className="text-xl font-bold text-text-secondary mb-2">Inicia sesion para ver tus conexiones</h2>
        <Link href="/login" className="btn-primary mt-4">Iniciar sesion</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'received', label: 'Recibidas', count: received.length },
    { key: 'sent', label: 'Enviadas', count: sent.length },
    { key: 'active', label: 'Activas', count: active.length },
  ];

  const currentList = tab === 'received' ? received : tab === 'sent' ? sent : active;

  const emptyMessages: Record<Tab, { icon: string; title: string; subtitle: string }> = {
    received: {
      icon: '📥',
      title: 'No tienes solicitudes pendientes',
      subtitle: 'Las solicitudes de conexion de otros usuarios aparecen aqui',
    },
    sent: {
      icon: '📤',
      title: 'No tienes solicitudes enviadas',
      subtitle: 'Conectate con clubes y otros jugadores desde sus perfiles',
    },
    active: {
      icon: '🤝',
      title: 'No tienes conexiones activas',
      subtitle: 'Tus conexiones aceptadas apareceran aqui',
    },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="section-header mb-2">Conexiones</h1>
          <p className="text-text-secondary text-lg">Gestiona tus conexiones con clubes, profesores y jugadores</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-surface rounded-xl p-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? 'bg-brand text-black shadow-glow-green-sm'
                  : 'text-text-secondary hover:text-white hover:bg-surface-light'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold px-1.5 ${
                  tab === t.key ? 'bg-black/20 text-black' : 'bg-surface-light text-text-muted'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted"><Spinner /> Cargando conexiones...</div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">{emptyMessages[tab].icon}</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">{emptyMessages[tab].title}</h3>
            <p className="text-text-muted">{emptyMessages[tab].subtitle}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((conn, i) => {
              const other = getOtherUser(conn);
              const typeCfg = STATUS_CONFIG[conn.status] || STATUS_CONFIG.PENDING;

              return (
                <div
                  key={conn.id}
                  className="card-glow group animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 text-brand flex items-center justify-center font-bold text-lg border-2 border-brand/20 shrink-0">
                      {other?.firstName?.[0] || '?'}{other?.lastName?.[0] || ''}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">
                        {other?.firstName || 'Usuario'} {other?.lastName || ''}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="badge-neutral text-xs">
                          {CONNECTION_TYPE_LABELS[conn.type] || conn.type}
                        </span>
                        <span className={`text-xs ${typeCfg.className}`}>
                          {typeCfg.label}
                        </span>
                      </div>
                      {conn.message && (
                        <p className="text-sm text-text-muted mt-1 truncate">{conn.message}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {tab === 'received' && conn.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleRespond(conn.id, 'accept')}
                            disabled={actionLoading === conn.id + 'accept'}
                            className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
                          >
                            {actionLoading === conn.id + 'accept' ? <SmallSpinner /> : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Aceptar
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRespond(conn.id, 'reject')}
                            disabled={actionLoading === conn.id + 'reject'}
                            className="btn-danger text-xs py-1.5 px-4 disabled:opacity-50"
                          >
                            {actionLoading === conn.id + 'reject' ? <SmallSpinner /> : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Rechazar
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {tab === 'sent' && conn.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(conn.id)}
                          disabled={actionLoading === conn.id + 'cancel'}
                          className="btn-outline text-xs py-1.5 px-4 disabled:opacity-50"
                        >
                          {actionLoading === conn.id + 'cancel' ? <SmallSpinner /> : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancelar
                            </>
                          )}
                        </button>
                      )}

                      {tab === 'active' && conn.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleDisconnect(conn.id)}
                          disabled={actionLoading === conn.id + 'disconnect'}
                          className="btn-danger text-xs py-1.5 px-4 disabled:opacity-50"
                        >
                          {actionLoading === conn.id + 'disconnect' ? <SmallSpinner /> : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              Desconectar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
