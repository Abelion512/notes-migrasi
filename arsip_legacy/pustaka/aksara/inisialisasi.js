/**
 * inisialisasi.js
 * Central entry point for app initialization and service worker registration.
 */

(function() {
  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./penjaga.js').then(reg => {
        console.log('Abelion: Service Worker terdaftar (Scope: ' + reg.scope + ')');
      }).catch(err => {
        console.error('Abelion: Gagal mendaftarkan Service Worker:', err);
      });
    });
  }

  // Handle URL actions from anywhere (if needed globally)
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'reload') {
    window.location.href = window.location.pathname;
  }
})();
