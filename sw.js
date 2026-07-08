const CACHE_NAME = 'showdeck-v4';
const IMAGE_CACHE_NAME = 'showdeck-images-v4';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './css/utilities.css',
  './css/index.css',
  './css/layout.css',
  './js/app.js',
  './js/router.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    }).catch(err => console.warn('Cache addAll failed', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
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

  // Cache TMDB Images (Cache First, network fallback)
  if (requestUrl.origin === 'https://image.tmdb.org') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // Fallback image could be returned here if offline
          return new Response(''); 
        });
      })
    );
    return;
  }

  // Network first, fallback to cache for HTML/JS/CSS
  if (requestUrl.origin === location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
});
