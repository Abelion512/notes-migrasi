(async function(){
  const { getVersionMeta } = AbelionUtils;
  const Storage = window.AbelionStorage;

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!Number.isFinite(value) || value <= 0) return '0 B';
    const units = ['B','KB','MB','GB'];
    const idx = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const num = value / Math.pow(1024, idx);
    return `${num.toFixed(num >= 10 ? 1 : 2)} ${units[idx]}`;
  }

  async function renderStorageHealth() {
    await Storage.ready;
    const engineEl = document.getElementById('storage-engine-label');
    const schemaEl = document.getElementById('storage-schema-label');
    const usageEl = document.getElementById('storage-usage-label');
    const footnote = document.getElementById('storage-footnote');

    const meta = await Storage.getMeta();
    const usage = await Storage.getUsage();

    if (engineEl) engineEl.textContent = meta.engine || 'localStorage';
    if (schemaEl) schemaEl.textContent = `v${meta.schemaVersion || 1} • indexes: ${Object.keys(meta.indexes || {}).length}`;

    if (usageEl) {
      if (usage?.usage) {
        const quota = usage.quota || 0;
        const percent = quota ? Math.round((usage.usage / quota) * 100) : null;
        const pctLabel = percent != null ? ` (${percent}% of quota)` : '';
        usageEl.textContent = `${formatBytes(usage.usage)}${pctLabel}`;
      } else {
        usageEl.textContent = 'Not available';
      }
    }

    if (footnote) {
      const updated = meta.lastVacuumAt ? new Date(meta.lastVacuumAt).toLocaleString('id-ID') : '—';
      const migrated = meta.lastMigrationAt ? new Date(meta.lastMigrationAt).toLocaleString('id-ID') : '—';
      footnote.textContent = `Last vacuum: ${updated}. Last migration: ${migrated}.`;
    }
  }

  const back = document.getElementById('settings-back');
  if (back) back.addEventListener('click', () => {
    sessionStorage.setItem('skipIntro', '1');
    window.location.href = 'index.html';
  });

  const versionBtn = document.getElementById('settings-version');
  if (versionBtn) versionBtn.addEventListener('click', () => {
    window.location.href = 'version-info.html';
  });

  const refreshBtn = document.getElementById('storage-refresh-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', renderStorageHealth);

  const vacuumBtn = document.getElementById('storage-vacuum-btn');
  if (vacuumBtn) vacuumBtn.addEventListener('click', async () => {
    await Storage.vacuum();
    await renderStorageHealth();
    alert('Vacuum selesai. Draft/cache/logs dibersihkan.');
  });

  async function renderEncryptionState() {
    await Storage.ready;
    const statusEl = document.getElementById('encryption-status');
    if (!statusEl) return;
    const meta = await Storage.getMeta();
    const enabled = !!meta.encryption?.enabled;
    statusEl.textContent = enabled
      ? 'Enkripsi lokal aktif. Passphrase wajib untuk membuka data.'
      : 'Enkripsi lokal belum diaktifkan. Data masih tersimpan sebagai plaintext di perangkat.';
  }

  const passphraseForm = document.getElementById('passphrase-form');
  if (passphraseForm) {
    passphraseForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const hint = document.getElementById('passphrase-hint');
      const pass = (document.getElementById('passphrase-input')?.value || '').trim();
      const confirm = (document.getElementById('passphrase-confirm')?.value || '').trim();
      if (pass.length < 8) {
        hint.textContent = 'Passphrase minimal 8 karakter.';
        return;
      }
      if (pass !== confirm) {
        hint.textContent = 'Konfirmasi tidak sama.';
        return;
      }
      hint.textContent = 'Mengenkripsi data...';
      try {
        await Storage.enableEncryption(pass);
        hint.textContent = 'Enkripsi aktif. Simpan passphrase Anda secara aman.';
        await renderEncryptionState();
      } catch (error) {
        console.error(error);
        hint.textContent = 'Gagal mengaktifkan enkripsi. Coba lagi.';
      } finally {
        passphraseForm.reset();
      }
    });
  }

  const secureLogout = document.getElementById('secure-logout-btn');
  if (secureLogout) {
    secureLogout.addEventListener('click', () => {
      Storage.lock();
      alert('Data dikunci. Muat ulang untuk membuka kembali.');
      location.reload();
    });
  }

  const meta = getVersionMeta();
  const label = document.getElementById('settings-version-label');
  if (meta?.version && label) {
    label.textContent = `${meta.version} (${meta.codename})`;
  }

  renderStorageHealth();
  renderEncryptionState();
})();
