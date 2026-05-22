/**
 * AgriShield AI — Service Worker (public/sw.js)
 *
 * DEVELOPMENT SERVICE WORKER — Plain vanilla JS, zero external imports.
 * This file is registered by main.jsx during `npm run dev`.
 *
 * Production uses the Workbox-generated dist/sw.js from VitePWA (vite.config.js).
 * Both implement the same caching policy; this file just uses the native
 * Cache API directly so it works with no network access and no CDN imports.
 *
 * Caching strategy summary:
 *  /web_model/*          → CacheFirst   (TF.js model shards, 30-day TTL)
 *  /api/* , /diagnose*   → NetworkOnly  (never cache API — app handles IDB)
 *  navigate requests     → NetworkFirst → fallback to cached /index.html
 *  everything else       → StaleWhileRevalidate (JS, CSS, images, fonts)
 */

const SHELL_CACHE  = 'agrishield-shell-v3';
const MODEL_CACHE  = 'tfjs-model-cache';
const STATIC_CACHE = 'agrishield-static-v3';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ---------------------------------------------------------------------------
// Install — pre-cache the app shell
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  self.skipWaiting(); // activate immediately on first install / update

  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // addAll is all-or-nothing; ignore failures so a missing icon
      // doesn't break the entire SW install
      Promise.allSettled(
        SHELL_ASSETS.map((url) => cache.add(url).catch(() => {}))
      )
    )
  );
});

// ---------------------------------------------------------------------------
// Activate — delete stale caches from previous SW versions
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  const KEEP = new Set([SHELL_CACHE, MODEL_CACHE, STATIC_CACHE]);

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (KEEP.has(key) ? null : caches.delete(key))))
    ).then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch — routing logic
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests entirely — POST/PUT/DELETE always go to network
  if (request.method !== 'GET') return;

  // 2. Skip cross-origin requests we don't manage
  //    (except cdn.jsdelivr.net for TF.js bundles, handled by stale-while-revalidate below)
  const isSameOrigin = url.origin === self.location.origin;
  const isCDN = url.hostname === 'cdn.jsdelivr.net';
  if (!isSameOrigin && !isCDN) return;

  // 3. API / AI inference routes — NETWORK ONLY
  //    Never cache: app uses IndexedDB for offline data
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/diagnose') ||
    url.pathname.startsWith('/socket.io')
  ) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'Offline', message: 'No network connection' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // 4. TF.js model shards — CACHE FIRST (large binary files, rarely change)
  if (url.pathname.startsWith('/web_model/')) {
    event.respondWith(cacheFirst(request, MODEL_CACHE));
    return;
  }

  // 5. SPA navigation — serve index.html from cache when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html', { cacheName: SHELL_CACHE }))
    );
    return;
  }

  // 6. Everything else (JS chunks, CSS, images, CDN bundles) — STALE WHILE REVALIDATE
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// ---------------------------------------------------------------------------
// Strategy helpers
// ---------------------------------------------------------------------------

/** CacheFirst: serve from cache immediately; fetch & update cache on miss. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok || response.status === 0) {
      cache.put(request, response.clone()); // don't await — background update
    }
    return response;
  } catch {
    return new Response('Offline — model not yet cached', { status: 503 });
  }
}

/** StaleWhileRevalidate: serve cached immediately, update in background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok || response.status === 0) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response('Offline', { status: 503 });
}

// ---------------------------------------------------------------------------
// Message handler — allow pages to trigger skipWaiting programmatically
// ---------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
