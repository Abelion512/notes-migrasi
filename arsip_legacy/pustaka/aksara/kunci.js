(function(global){
  const Storage = global.AbelionStorage;
  if (!Storage) return;

  const STATE = {
    overlay: null,
    errorEl: null,
    form: null
  };

  function createOverlay() {
    if (STATE.overlay) return STATE.overlay;
    const overlay = document.createElement('div');
    overlay.className = 'lock-screen-overlay';
    overlay.innerHTML = `
      <div class="lock-screen-card" role="dialog" aria-modal="true" aria-label="Kunci data">
        <div class="lock-screen-header">
          <div>
            <p class="lock-screen-subtitle">Data terenkripsi</p>
            <h2 class="lock-screen-title">Masukkan kata kunci</h2>
          </div>
          <button type="button" class="lock-screen-logout" id="lock-screen-logout">Keluar</button>
        </div>
        <form class="lock-screen-form" id="lock-screen-form">
          <label class="lock-screen-label" for="lock-passphrase">Passphrase</label>
          <input id="lock-passphrase" type="password" autocomplete="current-password" placeholder="Masukkan passphrase" required />
          <p class="lock-screen-error" id="lock-screen-error" aria-live="assertive"></p>
          <button type="submit" class="btn-blue lock-screen-submit">Buka kunci</button>
        </form>
      </div>
    `;
    STATE.overlay = overlay;
    STATE.errorEl = overlay.querySelector('#lock-screen-error');
    STATE.form = overlay.querySelector('#lock-screen-form');
    overlay.querySelector('#lock-screen-logout').addEventListener('click', () => {
      Storage.lock();
      location.reload();
    });
    STATE.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      STATE.errorEl.textContent = '';
      const passphrase = (overlay.querySelector('#lock-passphrase').value || '').trim();
      if (!passphrase) return;
      try {
        await Storage.unlock(passphrase);
        overlay.remove();
        STATE.overlay = null;
        location.reload();
      } catch (_error) {
        STATE.errorEl.textContent = 'Passphrase tidak valid. Coba lagi.';
      }
    });
    return overlay;
  }

  async function showLockIfNeeded() {
    await Storage.ready;
    if (!Storage.isEncryptionEnabled() || !Storage.isLocked()) return;
    const overlay = createOverlay();
    if (!document.body.contains(overlay)) {
      document.body.appendChild(overlay);
      const input = overlay.querySelector('#lock-passphrase');
      setTimeout(() => input?.focus(), 50);
    }
  }

  Storage.onLock(() => showLockIfNeeded());
  Storage.ready.then(showLockIfNeeded);

  // Auto-lock on inactivity
  let idleTimer;
  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (Storage.isEncryptionEnabled() && !Storage.isLocked()) {
      idleTimer = setTimeout(() => {
        console.log('Auto-locking due to inactivity');
        Storage.lock();
      }, IDLE_TIMEOUT);
    }
  }
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(name => {
    window.addEventListener(name, debounce(resetIdleTimer, 1000), { passive: true });
  });
  resetIdleTimer();

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
})(window);
