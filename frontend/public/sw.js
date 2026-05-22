const CACHE_NAME = 'agrishield-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const MODEL_ASSETS = [
  '/web_model/model.json',
  '/web_model/group1-shard1of1.bin'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...MODEL_ASSETS]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Calls -> Network Only (App handles caching via IndexedDB)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/diagnose')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. TF.js Model Assets -> Cache First, then Network
  if (url.pathname.startsWith('/web_model/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          return res;
        });
      })
    );
    return;
  }

  // 3. SPA Navigation Fallback -> Serve index.html for all document navigations
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 4. Static Assets (JS, CSS, Images) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkRes => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkRes.clone()));
        return networkRes;
      }).catch(() => cached); // fallback to cache if network fails
      return cached || fetchPromise;
    })
  );
});
