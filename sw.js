const CACHE_NAME = 'showdeck-v34';
const IMAGE_CACHE_NAME = 'showdeck-images';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './css/variables.css',
  './css/reset.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/utilities.css',
  './css/pages/pages.css',
  './css/pages/onboarding.css',
  './js/app.js',
  './js/router.js',
  './js/lib/chart.umd.js',
  './js/lib/jszip.min.js',
  './js/database/db.js',
  './js/database/movies.js',
  './js/database/shows.js',
  './js/database/tags.js',
  './js/database/backups.js',
  './js/database/achievements.js',
  './js/database/episodes.js',
  './js/database/collections.js',
  './js/database/stats.js',
  './js/utils/apiTracker.js',
  './js/utils/dom.js',
  './js/components/web/media-card.js',
  './js/components/sidebar.js',
  './js/components/enrich-modal.js',
  './js/components/episode-list.js',
  './js/components/modal.js',
  './js/components/toast.js',
  './js/api/tvmaze.js',
  './js/api/provider.js',
  './js/api/drive.js',
  './js/api/tmdb.js',
  './js/pages/onboarding.js',
  './js/pages/goals.js',
  './js/pages/show.js',
  './js/pages/tags.js',
  './js/pages/episode.js',
  './js/pages/enrich.js',
  './js/pages/library.js',
  './js/pages/home.js',
  './js/pages/help.js',
  './js/pages/smart_collections.js',
  './js/pages/history.js',
  './js/pages/collections.js',
  './js/pages/calendar.js',
  './js/pages/search.js',
  './js/pages/movie.js',
  './js/pages/settings.js',
  './js/pages/stats.js',
  './js/pages/share.js',
  './js/services/backup-service.js',
  './js/services/theme.js',
  './js/services/tvtime-import.js',
  './js/services/tracking-service.js',
  './js/services/sync-service.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Add files sequentially to prevent local dev servers (Live Server) from choking on 48 concurrent requests
      console.log('[SW] Starting sequential cache install...');
      for (const url of URLS_TO_CACHE) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[SW] Failed to cache:', url, err);
        }
      }
      console.log('[SW] Finished cache install.');
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME && !cacheName.startsWith('showdeck-images')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  if (event.request.headers.get('X-Ping') === 'true') {
    event.respondWith(
      fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }
  
  console.log('[SW] Intercepted fetch for:', event.request.url);

  // Fake TMDB API response when offline to prevent extension crashes
  if (requestUrl.origin === 'https://api.themoviedb.org') {
    event.respondWith(
      fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  if (requestUrl.origin === 'https://image.tmdb.org') {
    event.respondWith(
      caches.match(event.request.url, { ignoreSearch: true, ignoreVary: true }).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(event.request).then((networkResponse) => {
          // Allow opaque responses (status 0) from cross-origin <img> tags
          if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0) || networkResponse.type === 'error') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(event.request.url, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // Fallback placeholder image for offline
          const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="100%" height="100%" fill="#2a2a35"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#888" dominant-baseline="middle" text-anchor="middle">Offline</text></svg>`;
          return new Response(svgPlaceholder, {
            headers: { 'Content-Type': 'image/svg+xml' }
          });
        });
      })
    );
    return;
  }

  if (requestUrl.origin === location.origin) {
    event.respondWith(
      (async () => {
        // 1. Try Cache First
        let cachedResponse = null;
        try {
          cachedResponse = await caches.match(event.request.url, { ignoreSearch: true, ignoreVary: true });
          if (cachedResponse) console.log('[SW] Found in cache:', event.request.url);
        } catch (err) {
          console.error('[SW] Cache match error:', err);
        }
        
        // 2. Fetch from network in background to update cache (Stale-While-Revalidate)
        let networkFetch;
        try {
          networkFetch = fetch(event.request.clone()).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request.url, responseToCache);
              });
            }
            return networkResponse;
          }).catch(err => {
            console.log('[SW] Background fetch failed (offline expected):', err.message);
          });
        } catch (syncErr) {
          console.error('[SW] Sync fetch error:', syncErr);
        }

        // 3. Return cache if found, else wait for network
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const response = await networkFetch;
          if (response) return response;
        } catch (e) {
          console.log('[SW] Network fallback failed:', e.message);
          // 4. Fallbacks if network fails and cache is empty
          if (event.request.mode === 'navigate') {
            const indexUrl = new URL('./index.html', self.location).href;
            cachedResponse = await caches.match(indexUrl);
            if (cachedResponse) return cachedResponse;
            
            const rootUrl = new URL('./', self.location).href;
            cachedResponse = await caches.match(rootUrl);
            if (cachedResponse) return cachedResponse;
          }
        }
        
        console.warn('[SW] Returning 404 for:', event.request.url);
        return new Response('', { status: 404, statusText: 'Not Found in Cache' });
      })()
    );
    return;
  }
});
