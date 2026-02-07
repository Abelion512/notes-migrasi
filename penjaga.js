const CACHE_NAME = 'abelion-notes-v2.0.7';
const ASSETS = [
  './',
  './index.html',
  './lembaran/biodata.html',
  './lembaran/setelan.html',
  './lembaran/riwayat.html',
  './lembaran/catatan.html',
  './lembaran/rias-biodata.html',
  './lembaran/integrasi.html',
  './lembaran/legalitas.html',
  './lembaran/publik.html',
  './versi.json',
  './izin.json',
  './pustaka/gaya/gayanya.css',
  './pustaka/aksara/utama.js',
  './pustaka/aksara/perkakas.js',
  './pustaka/aksara/brankas.js',
  './pustaka/aksara/tangkas.js',
  './pustaka/aksara/kotak-tulis.js',
  './pustaka/aksara/kunci.js',
  './pustaka/aksara/contek.js',
  './pustaka/aksara/konteks.js',
  './pustaka/aksara/corak.js',
  './pustaka/aksara/pemuat.js',
  './pustaka/aksara/utusan.js',
  './pustaka/aksara/basisdata.js',
  './pustaka/aksara/integrasi.js',
  './pustaka/aksara/inisialisasi.js',
  './pustaka/aksara/pembaruan.js',
  // 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', // Strategy: StaleWhileRevalidate for CDNs
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy for CDNs and remote fonts: Stale While Revalidate
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          // Network failed, return nothing (or offline fallback for images?)
          // For scripts, if network fails and no cache, App might break.
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy for local assets: Cache First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => {
        // Optional: Return custom offline page if navigating
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

