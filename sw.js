/**
 * ShowDeck — Service Worker
 * Handles offline caching for static assets, API responses, and images.
 */

const CACHE_NAME = 'showdeck-v15';
const API_CACHE_NAME = 'showdeck-api-v1';
const IMG_CACHE_NAME = 'showdeck-img-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // CSS
  './css/variables.css',
  './css/reset.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/utilities.css',
  './css/pages/pages.css',
  // JS
  './js/app.js',
  './js/router.js',
  './js/database/db.js',
  './js/database/shows.js',
  './js/database/movies.js',
  './js/database/episodes.js',
  './js/database/collections.js',
  './js/database/tags.js',
  './js/database/activity.js',
  './js/api/tmdb.js',
  './js/api/tvmaze.js',
  './js/api/provider.js',
  './js/utils/dom.js',
  './js/utils/apiTracker.js',
  './js/components/sidebar.js',
  './js/components/toast.js',
  './js/components/enrich-modal.js',
  './js/pages/home.js',
  './js/pages/search.js',
  './js/pages/library.js',
  './js/pages/show.js',
  './js/pages/movie.js',
  './js/pages/episode.js',
  './js/pages/collections.js',
  './js/pages/stats.js',
  './js/pages/settings.js',
  './js/pages/onboarding.js',
  './js/pages/share.js',
  './js/pages/enrich.js',
  './js/services/tvtime-import.js',
  './js/services/theme.js',
  // Lib (offline)
  './js/lib/chart.umd.js',
  './js/lib/jszip.min.js',
  './js/lib/dexie.mjs',
  // Assets
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== API_CACHE_NAME && k !== IMG_CACHE_NAME)
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 1. TMDB / TVMaze Images -> Cache First, Network Fallback
  if (url.origin === 'https://image.tmdb.org' || url.href.includes('tvmaze.com/uploads')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(response => {
          const resClone = response.clone();
          caches.open(IMG_CACHE_NAME).then(c => c.put(e.request, resClone));
          return response;
        });
      })
    );
    return;
  }

  // 2. API Requests -> Network First, Cache Fallback
  if (url.origin.includes('api.themoviedb.org') || url.origin.includes('api.tvmaze.com')) {
    e.respondWith(
      fetch(e.request).then(response => {
        const resClone = response.clone();
        caches.open(API_CACHE_NAME).then(c => c.put(e.request, resClone));
        return response;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. Static Assets -> Cache First, Network Fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request);
    }).catch(() => {
      // Offline fallback for navigation
      if (e.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
