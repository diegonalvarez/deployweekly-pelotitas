'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';

interface FeedUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface FeedItem {
  id: string;
  userId: string;
  user: FeedUser;
  type: string;
  title: string;
  content: string | null;
  metadata: any;
  isPublic: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  match_result: '\uD83C\uDFBE',
  tournament_win: '\uD83C\uDFC6',
  achievement: '\uD83C\uDFC5',
  new_club: '\uD83C\uDFDF\uFE0F',
  reservation: '\uD83D\uDCC5',
};

const typeLabels: Record<string, string> = {
  match_result: 'Resultado de partido',
  tournament_win: 'Victoria en torneo',
  achievement: 'Nuevo logro',
  new_club: 'Nuevo club',
  reservation: 'Reserva',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export default function FeedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState<'public' | 'mine'>('public');

  const loadFeed = useCallback(async (pageNum: number, append: boolean = false) => {
    const isLoadingMore = append;
    if (isLoadingMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const endpoint = tab === 'mine' ? '/feed/mine' : '/feed';
      const res = await api.get(`${endpoint}?page=${pageNum}`);
      if (append) {
        setItems(prev => [...prev, ...(res.items || [])]);
      } else {
        setItems(res.items || []);
      }
      setTotalPages(res.totalPages || 1);
      setPage(pageNum);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tab]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    loadFeed(1);
  }, [tab, loadFeed]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      loadFeed(page + 1, true);
    }
  };

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

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Actividad
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Que esta pasando en la comunidad
          </p>
        </div>

        {/* Tabs */}
        {user && (
          <div className="flex gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setTab('public')}
              className={`px-5 py-2.5 rounded-pill font-semibold text-sm transition-all duration-200 ${
                tab === 'public'
                  ? 'bg-brand text-black'
                  : 'bg-surface-light text-text-secondary hover:bg-surface-hover'
              }`}
            >
              Comunidad
            </button>
            <button
              onClick={() => setTab('mine')}
              className={`px-5 py-2.5 rounded-pill font-semibold text-sm transition-all duration-200 ${
                tab === 'mine'
                  ? 'bg-brand text-black'
                  : 'bg-surface-light text-text-secondary hover:bg-surface-hover'
              }`}
            >
              Mi actividad
            </button>
          </div>
        )}

        {/* Feed items */}
        {items.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up">
            <div className="text-5xl mb-4 opacity-20">
              {tab === 'mine' ? '\uD83D\uDCDD' : '\uD83C\uDF10'}
            </div>
            <p className="text-text-muted mb-2">
              {tab === 'mine'
                ? 'Todavia no tenes actividad'
                : 'No hay actividad reciente'}
            </p>
            <p className="text-text-muted text-sm">
              {tab === 'mine'
                ? 'Reserva una cancha, jugá un partido o unite a un torneo para empezar.'
                : 'Cuando los jugadores empiecen a jugar, las actividades van a aparecer aca.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="card-glow py-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-padel/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {item.user.firstName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* User name + time */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">
                        {item.user.firstName} {item.user.lastName}
                      </span>
                      <span className="text-text-muted text-xs">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{typeIcons[item.type] || '\u2B50'}</span>
                      <span className="badge-neutral text-xs">
                        {typeLabels[item.type] || item.type}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-white text-sm font-medium">{item.title}</p>

                    {/* Content */}
                    {item.content && (
                      <p className="text-text-secondary text-sm mt-1">{item.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Load more */}
            {page < totalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-secondary"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Cargando...
                    </span>
                  ) : (
                    'Cargar mas'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="mt-8 text-center animate-fade-in-up">
            <p className="text-text-muted mb-4">Inicia sesion para ver tu actividad personal</p>
            <Link href="/login" className="btn-primary">Ingresar</Link>
          </div>
        )}
      </div>
    </div>
  );
}
