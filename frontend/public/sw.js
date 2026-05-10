/* ─────────────────────────────────────────────────────────────
   Pelotitas service worker — minimal but useful.

   Strategy:
   - App shell + Next static chunks (`/_next/static/*`) → cache-first.
   - HTML navigation requests → network-first, fall back to cached
     `/offline` shell when the network is down.
   - Everything else (API, dynamic) → network-only (no caching of
     authenticated data).

   The SW is registered by `PWARegister` on every page load. It
   updates automatically when this file changes (bump CACHE_VERSION).
   ───────────────────────────────────────────────────────────── */

const CACHE_VERSION = 'pelotitas-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const SHELL_URLS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(SHELL_URLS).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Don't touch non-GET or cross-origin (let the browser handle).
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API calls — never cache (auth state, fresh data).
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first for Next static chunks.
  if (url.pathname.startsWith('/_next/static/') || url.pathname === '/icon.svg' || url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, clone)).catch(() => {});
          return res;
        }),
      ),
    );
    return;
  }

  // Navigation — network first, fall back to cached "/" shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/').then((m) => m || new Response('Offline', { status: 503 }))),
    );
    return;
  }

  // Default: try network, fall back to cache.
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((m) => m || new Response('Offline', { status: 503 }))),
  );
});
