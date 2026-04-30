'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(setNotifications).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4 opacity-20">🔒</div>
        <p className="text-text-secondary text-lg mb-4">Inicia sesion para ver tus notificaciones</p>
        <Link href="/login" className="btn-primary">Ingresar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              Notificaciones
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-pill bg-brand text-black text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-text-muted text-sm mt-1">Mantente al dia con tu actividad</p>
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost text-brand hover:bg-brand/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Marcar todas como leidas
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando notificaciones...
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">🔔</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No tenes notificaciones</h3>
            <p className="text-text-muted">Te avisaremos cuando haya novedades</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`
                  card-glow cursor-pointer group animate-fade-in-up
                  ${!n.isRead ? 'border-brand/20 bg-brand/[0.03]' : ''}
                `}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Unread indicator */}
                  <div className="flex-shrink-0 mt-1.5">
                    {!n.isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand shadow-glow-green-sm animate-glow-pulse" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-border-dark" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${!n.isRead ? 'text-white' : 'text-text-secondary'}`}>
                      {n.title}
                    </p>
                    <p className="text-sm text-text-muted mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-text-muted mt-2 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(n.createdAt).toLocaleString('es-AR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Mark as read icon */}
                  {!n.isRead && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
