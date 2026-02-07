(async function () {
  const Storage = window.AbelionStorage;

  // Supabase Elements
  const _supabaseToggleBtn = document.getElementById('toggle-supabase-form');
  const _supabaseConfigArea = document.getElementById('supabase-config-area');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');
  const saveSupabaseBtn = document.getElementById('save-supabase-config');
  const supabaseStatusBadge = document.getElementById('supabase-status-badge');

  // Notion Elements
  const _notionToggleBtn = document.getElementById('toggle-notion-form');
  const notionConfigArea = document.getElementById('notion-config-area');
  const notionTokenInput = document.getElementById('notion-token');
  const notionDbInput = document.getElementById('notion-db-id');
  const saveNotionBtn = document.getElementById('save-notion-config');
  const notionStatusBadge = document.getElementById('notion-status-badge');

  // Initialize
  await Storage.ready;
  const STORAGE_KEYS = AbelionUtils.STORAGE_KEYS;
  updateStatusBadges();

  // Unified Row Logic
  const integrationRows = document.querySelectorAll('.integration-row');
  integrationRows.forEach(row => {
    const header = row.querySelector('.list-item');
    const target = row.dataset.target;
    const area = document.getElementById(`${target}-config-area`);
    const chevron = row.querySelector('.list-item-chevron');

    if (!header || !area) return;

    header.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isVisible = area.style.display === 'block';

      // Close other areas
      integrationRows.forEach(otherRow => {
        if (otherRow === row) return;
        const otherTarget = otherRow.dataset.target;
        const otherArea = document.getElementById(`${otherTarget}-config-area`);
        const otherChevron = otherRow.querySelector('.list-item-chevron');
        if (otherArea) otherArea.style.display = 'none';
        if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
      });

      if (isVisible) {
        area.style.display = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      } else {
        area.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(90deg)';
      }
    });

    // Prevent clicks inside the config area from bubbling to the header
    area.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Supabase Logic
  if (supabaseUrlInput || supabaseKeyInput) {
    const config = await Storage.getValue(STORAGE_KEYS.SUPABASE_CONFIG, {});
    if (supabaseUrlInput) supabaseUrlInput.value = config.url || '';
    if (supabaseKeyInput) supabaseKeyInput.value = config.key || '';
  }

  if (saveSupabaseBtn) {
    saveSupabaseBtn.onclick = async () => {
      const url = supabaseUrlInput.value.trim();
      const key = supabaseKeyInput.value.trim();

      if (url && !url.startsWith('https://')) {
        alert('URL harus diawali dengan https://');
        return;
      }

      await Storage.setValue(STORAGE_KEYS.SUPABASE_CONFIG, { url, key });
      localStorage.setItem('abelion-disable-supabase', url ? 'false' : 'true');

      alert('Konfigurasi Supabase disimpan. Aplikasi akan dimuat ulang untuk menerapkan perubahan.');
      location.reload();
    };
  }

  // Notion Logic
  if (notionTokenInput || notionDbInput) {
    const config = await Storage.getValue(STORAGE_KEYS.NOTION_CONFIG, {});
    if (notionTokenInput) notionTokenInput.value = config.token || '';
    if (notionDbInput) notionDbInput.value = config.dbId || '';
  }

  if (saveNotionBtn) {
    saveNotionBtn.onclick = async () => {
      const token = notionTokenInput.value.trim();
      const dbId = notionDbInput.value.trim();

      await Storage.setValue(STORAGE_KEYS.NOTION_CONFIG, { token, dbId });

      alert('Konfigurasi Notion disimpan.');
      notionConfigArea.style.display = 'none';
      document.querySelector('.integration-row[data-target="notion"] .list-item-chevron').style.transform = 'rotate(0deg)';
      updateStatusBadges();
    };
  }

  async function updateStatusBadges() {
    const supabaseConfig = await Storage.getValue(STORAGE_KEYS.SUPABASE_CONFIG, {});
    const hasSupabase = !!supabaseConfig.url;
    if (supabaseStatusBadge) {
      supabaseStatusBadge.textContent = hasSupabase ? 'Tersambung' : 'Terputus';
      supabaseStatusBadge.style.background = hasSupabase ? 'rgba(62, 207, 142, 0.2)' : 'var(--surface-strong)';
      supabaseStatusBadge.style.color = hasSupabase ? '#3ECF8E' : 'var(--text-secondary)';
    }

    const notionConfig = await Storage.getValue(STORAGE_KEYS.NOTION_CONFIG, {});
    const hasNotion = !!notionConfig.token;
    if (notionStatusBadge) {
      notionStatusBadge.textContent = hasNotion ? 'Tersambung' : 'Terputus';
      notionStatusBadge.style.background = hasNotion ? 'rgba(0, 122, 255, 0.2)' : 'var(--surface-strong)';
      notionStatusBadge.style.color = hasNotion ? '#007AFF' : 'var(--text-secondary)';
    }
  }

})();
