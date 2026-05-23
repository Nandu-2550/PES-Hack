const CACHE_NAME = 'agrishield-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial failure:', err);
      });
    })
  );
});

// Activate: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API calls: network-first, fall back to cache
// - Navigation: serve cached index.html if offline (enables React Router offline)
// - Static/model assets: cache-first
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  const isSameOrigin = url.origin === self.location.origin;

  // API calls — network first, cache fallback
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/diagnose')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200 && isSameOrigin) {
            const clone = res.clone(); // Synchronous clone
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // TF.js model files — cache first
  if (url.pathname.startsWith('/web_model/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone(); // Synchronous clone
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // SPA navigation — return cached index.html when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // JS/CSS/image assets — stale-while-revalidate (same origin only to prevent opaque cloning errors)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (!isSameOrigin) {
        return cached || fetch(request);
      }

      if (cached) {
        // Fetch fresh version in background and update cache silently
        fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone(); // Synchronous clone
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone(); // Synchronous clone
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return res;
      });
    })
  );
});
