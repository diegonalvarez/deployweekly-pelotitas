'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Heart, Image as ImageIcon, MessageCircle, Send, Share2, Trash2 } from 'lucide-react';

type Post = {
  id: string;
  ownerId: string;
  kind: string;
  body: string | null;
  mediaUrl: string | null;
  mediaKind: 'IMAGE' | 'VIDEO' | null;
  thumbnailUrl: string | null;
  visibility: string;
  createdAt: string;
  owner: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  reactions: { id: string; kind: string; userId: string }[];
  comments: { id: string; body: string; createdAt: string; user: { id: string; firstName: string; lastName: string } }[];
  _count: { reactions: number; comments: number };
};

const REACTIONS: { kind: string; emoji: string }[] = [
  { kind: 'FIRE',    emoji: '🔥' },
  { kind: 'RAQUETA', emoji: '🎾' },
  { kind: 'TROPHY',  emoji: '🏆' },
  { kind: 'HEART',   emoji: '❤️' },
  { kind: 'CLAP',    emoji: '👏' },
];

export default function TimelineClient({ userId, initialPosts, ownerName }: { userId: string; initialPosts: Post[]; ownerName: string }) {
  const { user } = useAuth();
  const isOwner = user?.id === userId;
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);

  // Compose
  const [body, setBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [posting, setPosting] = useState(false);

  const refresh = async () => {
    try {
      const data = isOwner
        ? await api.get<Post[]>('/timeline/me')
        : await api.get<Post[]>(`/public/u/${userId}/timeline`);
      setPosts(data);
    } catch {/* */}
  };

  const submit = async () => {
    if (!body.trim() && !mediaUrl.trim()) return;
    setPosting(true);
    try {
      await api.post('/timeline/posts', {
        body: body.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
        mediaKind: mediaUrl ? (/\.(mp4|webm|mov)$/i.test(mediaUrl) ? 'VIDEO' : 'IMAGE') : undefined,
      });
      setBody(''); setMediaUrl('');
      await refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al postear');
    } finally { setPosting(false); }
  };

  return (
    <section className="space-y-4">
      {isOwner && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--v5-card-bg)', border: '1px solid var(--v5-paper-2)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}>
            Compartí algo
          </p>
          <textarea
            className="v5-input w-full"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Qué jugaste hoy? Compartí un highlight..."
            maxLength={600}
          />
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <ImageIcon className="w-4 h-4" style={{ color: 'var(--v5-ink-2)' }} />
            <input
              type="url"
              className="v5-input flex-1 min-w-[200px]"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL de imagen o video (opcional)"
            />
            <button
              onClick={submit}
              disabled={posting || (!body.trim() && !mediaUrl.trim())}
              className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] disabled:opacity-50"
              style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
            >
              {posting ? 'Posteando…' : 'Publicar'}
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}>
                <Send className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
          <p className="text-[10px] mt-2 opacity-60" style={{ fontFamily: 'var(--font-mono), monospace' }}>
            Por ahora la media se carga vía URL (Imgur, YouTube, Cloudinary, etc.)
          </p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--v5-card-bg)', border: '1px solid var(--v5-paper-2)' }}>
          <p className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--v5-ink-2)', opacity: 0.7, fontFamily: 'var(--font-mono), monospace' }}>
            {isOwner ? 'Empezá tu timeline' : `${ownerName} todavía no posteó nada`}
          </p>
        </div>
      ) : (
        posts.map((p) => (
          <PostCard key={p.id} post={p} viewer={user} onChanged={refresh} userId={userId} />
        ))
      )}
    </section>
  );
}

function PostCard({ post, viewer, onChanged, userId }: { post: Post; viewer: any; onChanged: () => void; userId: string }) {
  const [showComments, setShowComments] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const isOwnerOfPost = viewer?.id === post.ownerId;

  const myReactions = new Set(post.reactions.filter((r) => r.userId === viewer?.id).map((r) => r.kind));

  const react = async (kind: string) => {
    if (!viewer) { toast('Necesitás iniciar sesión para reaccionar'); return; }
    try { await api.post(`/timeline/posts/${post.id}/react`, { kind }); onChanged(); } catch {/* */}
  };

  const comment = async () => {
    if (!commentBody.trim()) return;
    if (!viewer) { toast('Necesitás iniciar sesión para comentar'); return; }
    try {
      await api.post(`/timeline/posts/${post.id}/comments`, { body: commentBody });
      setCommentBody(''); onChanged();
    } catch (err: any) { toast.error(err.message); }
  };

  const remove = async () => {
    if (!confirm('Borrar este post?')) return;
    try { await api.delete(`/timeline/posts/${post.id}`); onChanged(); } catch {/* */}
  };

  const share = async () => {
    const url = `${window.location.origin}/u/${userId}`;
    const shareData = { title: `${post.owner.firstName} ${post.owner.lastName} en pelotitas`, text: post.body || 'Mirá esto en pelotitas', url };
    try {
      if ((navigator as any).share) await (navigator as any).share(shareData);
      else { await navigator.clipboard.writeText(url); toast.success('Link copiado'); }
    } catch {/* */}
  };

  const date = new Date(post.createdAt);

  return (
    <article className="rounded-2xl overflow-hidden" style={{ background: 'var(--v5-card-bg)', border: '1px solid var(--v5-paper-2)' }}>
      <header className="px-5 pt-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px]"
             style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}>
          {post.owner.firstName[0]}{post.owner.lastName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold truncate" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
            {post.owner.firstName} {post.owner.lastName}
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--v5-ink-2)', opacity: 0.7, fontFamily: 'var(--font-mono), monospace' }}>
            {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} · {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            {post.kind !== 'TEXT' && post.kind !== 'PHOTO' && post.kind !== 'VIDEO' && <span> · {post.kind}</span>}
          </p>
        </div>
        <button onClick={share} className="p-2 rounded-full hover:bg-black/[0.06]" aria-label="Compartir" style={{ color: 'var(--v5-ink)' }}>
          <Share2 className="w-4 h-4" />
        </button>
        {isOwnerOfPost && (
          <button onClick={remove} className="p-2 rounded-full hover:bg-black/[0.06]" aria-label="Borrar" style={{ color: 'var(--v5-red)' }}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </header>

      {post.body && (
        <div className="px-5 pt-3 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>
      )}

      {post.mediaUrl && post.mediaKind === 'IMAGE' && (
        <img src={post.mediaUrl} alt="" className="mt-4 w-full max-h-[480px] object-cover" loading="lazy" />
      )}
      {post.mediaUrl && post.mediaKind === 'VIDEO' && (
        <video src={post.mediaUrl} controls className="mt-4 w-full max-h-[480px]" />
      )}

      <div className="px-5 py-3 flex items-center gap-1 flex-wrap" style={{ borderTop: '1px solid var(--v5-paper-2)', marginTop: post.mediaUrl ? 0 : 12 }}>
        {REACTIONS.map((r) => {
          const count = post.reactions.filter((x) => x.kind === r.kind).length;
          const mine = myReactions.has(r.kind);
          return (
            <button
              key={r.kind}
              onClick={() => react(r.kind)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold transition-all"
              style={{
                background: mine ? 'var(--v5-yellow)' : 'transparent',
                color: mine ? 'var(--v5-ink)' : 'var(--v5-ink-2)',
                border: '1px solid ' + (mine ? 'var(--v5-yellow)' : 'var(--v5-paper-2)'),
              }}
            >
              <span>{r.emoji}</span>
              {count > 0 && <span style={{ fontFamily: 'var(--font-mono), monospace' }}>{count}</span>}
            </button>
          );
        })}
        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold"
          style={{ color: 'var(--v5-ink-2)', border: '1px solid var(--v5-paper-2)' }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {post._count.comments}
        </button>
      </div>

      {showComments && (
        <div className="px-5 pb-4 space-y-3" style={{ borderTop: '1px solid var(--v5-paper-2)' }}>
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 pt-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                   style={{ background: 'var(--v5-paper-2)', color: 'var(--v5-ink)' }}>
                {c.user.firstName[0]}{c.user.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
                  {c.user.firstName} {c.user.lastName}
                </p>
                <p className="text-[13px] leading-snug">{c.body}</p>
              </div>
            </div>
          ))}
          {viewer && (
            <div className="flex items-center gap-2 pt-2">
              <input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && comment()}
                className="v5-input flex-1"
                placeholder="Comentá…"
                maxLength={600}
              />
              <button onClick={comment} disabled={!commentBody.trim()}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full disabled:opacity-40"
                      style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
          {!viewer && (
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold pt-2 opacity-70"
               style={{ fontFamily: 'var(--font-mono), monospace' }}>
              Iniciá sesión para comentar
            </p>
          )}
        </div>
      )}
    </article>
  );
}
