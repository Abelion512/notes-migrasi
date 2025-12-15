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

  const meta = getVersionMeta();
  const label = document.getElementById('settings-version-label');
  if (meta?.version && label) {
    label.textContent = `${meta.version} (${meta.codename})`;
  }

  renderStorageHealth();
})();
