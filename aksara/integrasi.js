(async function () {
  const Storage = window.AbelionStorage;

  // Supabase Elements
  const supabaseToggleBtn = document.getElementById('toggle-supabase-form');
  const supabaseConfigArea = document.getElementById('supabase-config-area');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');
  const saveSupabaseBtn = document.getElementById('save-supabase-config');
  const supabaseStatusBadge = document.getElementById('supabase-status-badge');

  // Notion Elements
  const notionToggleBtn = document.getElementById('toggle-notion-form');
  const notionConfigArea = document.getElementById('notion-config-area');
  const notionTokenInput = document.getElementById('notion-token');
  const notionDbInput = document.getElementById('notion-db-id');
  const saveNotionBtn = document.getElementById('save-notion-config');
  const notionStatusBadge = document.getElementById('notion-status-badge');

  // Initialize
  await Storage.ready;
  const STORAGE_KEYS = AbelionUtils.STORAGE_KEYS;
  updateStatusBadges();

  // Supabase Logic
  if (supabaseToggleBtn) {
    supabaseToggleBtn.onclick = () => {
      const isVisible = supabaseConfigArea.style.display === 'block';
      supabaseConfigArea.style.display = isVisible ? 'none' : 'block';
      supabaseToggleBtn.textContent = isVisible ? 'Konfigurasi' : 'Tutup';
    };
  }

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
  if (notionToggleBtn) {
    notionToggleBtn.onclick = () => {
      const isVisible = notionConfigArea.style.display === 'block';
      notionConfigArea.style.display = isVisible ? 'none' : 'block';
      notionToggleBtn.textContent = isVisible ? 'Konfigurasi' : 'Tutup';
    };
  }

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
      notionToggleBtn.textContent = 'Konfigurasi';
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
