const CACHE_NAME = 'abelion-notes-v2.0.0';
const ASSETS = [
  './',
  './index.html',
  './pages/profile.html',
  './pages/settings.html',
  './pages/version-info.html',
  './css/style.css',
  './js/index.js',
  './js/utils.js',
  './js/storage.js',
  './js/gamification.js',
  './js/editor-modal.js',
  './js/lock-screen.js',
  './js/profile.js',
  './js/settings.js',
  './js/edit-profile.js',
  './js/env-loader.js',
  './js/supabase-client.js',
  './js/supabase-db.js',
  './assets/OlivX logo.png',
  './assets/default-avatar.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Simple cache-first strategy for static assets, network-first for others
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => {
        // Offline fallback?
      });
    })
  );
});
