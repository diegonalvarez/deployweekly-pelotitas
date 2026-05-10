'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import toast from 'react-hot-toast';

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

type Tab = 'connected' | 'pending' | 'blocked';

export default function ClubPlayersPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('connected');
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await api.get(`/connections?type=PLAYER_CLUB`);
      const list = data.connections || data || [];
      setConnections(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar jugadores');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (user && clubId) fetchConnections();
  }, [user, clubId, fetchConnections]);

  const handleRespond = async (id: string, action: 'accept' | 'reject' | 'block') => {
    setActionId(id);
    try {
      await api.patch(`/connections/${id}/respond`, { action });
      const labels: Record<string, string> = {
        accept: 'Jugador aceptado',
        reject: 'Solicitud rechazada',
        block: 'Jugador bloqueado',
      };
      toast.success(labels[action]);
      fetchConnections();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar');
    } finally {
      setActionId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    setActionId(id);
    try {
      await api.delete(`/connections/${id}`);
      toast.success('Jugador desconectado');
      fetchConnections();
    } catch (err: any) {
      toast.error(err.message || 'Error al desconectar');
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/connections/${id}/respond`, { action: 'accept' });
      toast.success('Jugador desbloqueado');
      fetchConnections();
    } catch (err: any) {
      toast.error(err.message || 'Error al desbloquear');
    } finally {
      setActionId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando...
        </div>
      </div>
    );
  }

  const connected = connections.filter(c => c.status === 'ACCEPTED');
  const pending = connections.filter(c => c.status === 'PENDING');
  const blocked = connections.filter(c => c.status === 'BLOCKED');

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'connected', label: 'Conectados', count: connected.length },
    { key: 'pending', label: 'Pendientes', count: pending.length },
    { key: 'blocked', label: 'Bloqueados', count: blocked.length },
  ];

  const currentList = tab === 'connected' ? connected : tab === 'pending' ? pending : blocked;

  const getOtherUser = (conn: any) => {
    if (conn.fromUser?.id === user.id) return conn.toUser;
    return conn.fromUser;
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
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Jugadores
          </h1>
          <p className="text-text-muted text-sm mt-1">Gestiona los jugadores conectados a tu complejo</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-pill text-sm font-semibold transition-all duration-200 border flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-brand/15 border-brand/40 text-brand shadow-glow-green-sm'
                  : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default hover:text-white'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  tab === t.key ? 'bg-brand/20 text-brand' : 'bg-surface-default text-text-muted'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-text-muted">
              <Spinner />
              Cargando jugadores...
            </div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">
              {tab === 'connected' && 'Sin jugadores conectados'}
              {tab === 'pending' && 'Sin solicitudes pendientes'}
              {tab === 'blocked' && 'Sin jugadores bloqueados'}
            </h3>
            <p className="text-text-muted max-w-md mx-auto">
              {tab === 'connected' && 'Los jugadores que se conecten a tu complejo apareceran aca.'}
              {tab === 'pending' && 'No hay solicitudes de conexion por procesar.'}
              {tab === 'blocked' && 'No hay jugadores bloqueados actualmente.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {currentList.map((conn, i) => {
              const other = getOtherUser(conn);
              return (
                <div
                  key={conn.id}
                  className="card-glow animate-fade-in-up"
                  style={{ animationDelay: `${(i + 3) * 60}ms` }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/20 to-padel/20 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                        {other?.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {other?.firstName} {other?.lastName}
                        </p>
                        {tab === 'connected' && conn.updatedAt && (
                          <p className="text-xs text-text-muted mt-0.5">
                            Conectado desde <span className="tabular">{formatDate(conn.updatedAt)}</span>
                          </p>
                        )}
                        {tab === 'pending' && conn.message && (
                          <p className="text-sm text-text-secondary mt-1 italic">
                            &ldquo;{conn.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {tab === 'connected' && (
                        <button
                          onClick={() => handleDisconnect(conn.id)}
                          disabled={actionId === conn.id}
                          className="btn-danger text-sm"
                        >
                          {actionId === conn.id ? <Spinner /> : 'Desconectar'}
                        </button>
                      )}
                      {tab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRespond(conn.id, 'accept')}
                            disabled={actionId === conn.id}
                            className="btn-primary text-sm"
                          >
                            {actionId === conn.id ? <Spinner /> : 'Aceptar'}
                          </button>
                          <button
                            onClick={() => handleRespond(conn.id, 'reject')}
                            disabled={actionId === conn.id}
                            className="btn-ghost text-sm"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {tab === 'blocked' && (
                        <button
                          onClick={() => handleUnblock(conn.id)}
                          disabled={actionId === conn.id}
                          className="btn-secondary text-sm"
                        >
                          {actionId === conn.id ? <Spinner /> : 'Desbloquear'}
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
