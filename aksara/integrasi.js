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

  // Unified Row Logic
  document.querySelectorAll('.integration-row').forEach(row => {
    row.onclick = () => {
      const target = row.dataset.target;
      const area = document.getElementById(`${target}-config-area`);
      const isVisible = area.style.display === 'block';

      // Close all first for a clean look
      document.querySelectorAll('[id$="-config-area"]').forEach(a => a.style.display = 'none');
      document.querySelectorAll('.list-item-chevron').forEach(c => c.style.transform = 'rotate(0deg)');

      if (!isVisible) {
        area.style.display = 'block';
        row.querySelector('.list-item-chevron').style.transform = 'rotate(90deg)';
        area.style.animation = 'slideDown 0.3s ease-out';
      }
    };
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
