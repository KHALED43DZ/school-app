// =============================================
// Service Worker - مراجعة الفصل الثالث ابتدائي
// =============================================

const CACHE_NAME = 'morajaa-3ab-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Google Fonts - cached for offline use
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap'
];

// ===== INSTALL: cache all core assets =====
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      // Cache local assets (guaranteed to work)
      return cache.addAll(['./', './index.html', './manifest.json'])
        .then(() => {
          // Try to cache fonts (may fail if offline during install — that's OK)
          return cache.add('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap')
            .catch(() => console.log('[SW] Font caching skipped (offline)'));
        });
    }).then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE: delete old caches =====
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ===== FETCH: cache-first strategy =====
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // For Google Fonts and other CDN assets: network-first, fallback to cache
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For app files: cache-first (works fully offline)
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Update cache in background (stale-while-revalidate)
        fetch(request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response));
          }
        }).catch(() => {});
        return cached;
      }

      // Not in cache: fetch from network and cache it
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => {
        // Offline fallback: return index.html for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ===== MESSAGE: force update =====
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
