(async function () {
  const { getVersionMeta } = AbelionUtils;
  const Storage = window.AbelionStorage;

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!Number.isFinite(value) || value <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
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
    window.location.href = '../index.html';
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

  const supabaseToggle = document.getElementById('supabase-toggle');
  const supabaseConfigForm = document.getElementById('supabase-config-form');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');
  const saveSupabaseBtn = document.getElementById('save-supabase-config');
  const showGuideBtn = document.getElementById('show-supabase-guide');
  const guideModal = document.getElementById('supabase-guide-modal');
  const guideClose = document.getElementById('guide-close');
  const guideOk = document.getElementById('guide-ok');

  if (supabaseToggle) {
    const disabled = localStorage.getItem('abelion-disable-supabase') === 'true';
    supabaseToggle.checked = !disabled;
    if (supabaseToggle.checked) supabaseConfigForm.style.display = 'block';

    supabaseToggle.onchange = (e) => {
      const isEnabled = e.target.checked;
      localStorage.setItem('abelion-disable-supabase', (!isEnabled).toString());
      supabaseConfigForm.style.display = isEnabled ? 'block' : 'none';
      if (!isEnabled) {
        alert('Sinkronisasi dinonaktifkan. Catatan hanya disimpan di perangkat ini.');
      }
    };
  }

  // Load existing config
  if (supabaseUrlInput) supabaseUrlInput.value = localStorage.getItem('abelion-supabase-url') || '';
  if (supabaseKeyInput) supabaseKeyInput.value = localStorage.getItem('abelion-supabase-key') || '';

  if (saveSupabaseBtn) {
    saveSupabaseBtn.onclick = () => {
      const url = supabaseUrlInput.value.trim();
      const key = supabaseKeyInput.value.trim();

      if (url && !url.startsWith('https://')) {
        alert('URL harus diawali dengan https://');
        return;
      }

      localStorage.setItem('abelion-supabase-url', url);
      localStorage.setItem('abelion-supabase-key', key);
      alert('Konfigurasi Supabase disimpan. Silakan muat ulang halaman untuk menghubungkan.');
      location.reload();
    };
  }

  if (showGuideBtn && guideModal) {
    showGuideBtn.onclick = (e) => {
      e.preventDefault();
      guideModal.style.display = 'flex';
    };
  }

  if (guideClose) guideClose.onclick = () => guideModal.style.display = 'none';
  if (guideOk) guideOk.onclick = () => guideModal.style.display = 'none';

  // --- Export / Import ---
  const exportBtn = document.getElementById('export-btn');
  const exportFormatSelect = document.getElementById('export-format');

  if (exportBtn) {
    exportBtn.onclick = async () => {
      const format = exportFormatSelect.value;
      const notes = await Storage.getNotes();
      const dateStr = new Date().toISOString().split('T')[0];

      try {
        if (format === 'json') {
          const data = JSON.stringify({ version: '3.0', exportedAt: new Date().toISOString(), notes }, null, 2);
          downloadBlob(new Blob([data], { type: 'application/json' }), `abelion-notes-${dateStr}.json`);
        }
        else if (format === 'md') {
          if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded');
          const zip = new JSZip();
          notes.forEach(n => {
            const filename = (n.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-') + '.md';
            zip.file(filename, `---\ntitle: ${n.title}\ndate: ${n.date}\n---\n\n${n.contentMarkdown || n.content}`);
          });
          const blob = await zip.generateAsync({ type: 'blob' });
          downloadBlob(blob, `abelion-markdown-${dateStr}.zip`);
        }
        else if (format === 'pdf') {
          if (typeof jspdf === 'undefined') throw new Error('jspdf not loaded');
          const doc = new jspdf.jsPDF();
          notes.forEach((n, i) => {
            if (i > 0) doc.addPage();
            doc.setFontSize(20);
            doc.text(n.title || 'Untitled', 10, 20);
            doc.setFontSize(12);
            doc.text(`Tanggal: ${n.date}`, 10, 30);
            doc.text(doc.splitTextToSize(n.contentMarkdown || n.content || '', 180), 10, 40);
          });
          doc.save(`abelion-notes-${dateStr}.pdf`);
        }
        else if (format === 'xlsx') {
          if (typeof XLSX === 'undefined') throw new Error('xlsx not loaded');
          const rows = notes.map(n => ({ Judul: n.title, Tanggal: n.date, Isi: n.contentMarkdown || n.content }));
          const worksheet = XLSX.utils.json_to_sheet(rows);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Notes");
          XLSX.writeFile(workbook, `abelion-notes-${dateStr}.xlsx`);
        }
        else if (format === 'docx') {
          alert('Export DOCX sedang disiapkan. Library sedang dimuat.');
          // Simple docx implementation can be added here
        }
      } catch (e) {
        alert('Ekspor gagal: ' + e.message);
      }
    };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const importInput = document.getElementById('import-json-input');
  if (importInput) {
    importInput.onchange = (e) => handleImportFiles(e.target.files);
  }

  async function handleImportFiles(files) {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(event.target.result);
            const importedNotes = Array.isArray(data.notes) ? data.notes : (Array.isArray(data) ? data : null);
            if (importedNotes) {
              const existing = await Storage.getNotes();
              const existingIds = new Set(existing.map(n => n.id));
              const toAdd = importedNotes.filter(n => !existingIds.has(n.id));
              await Storage.setNotes([...existing, ...toAdd]);
              alert(`Berhasil mengimpor ${toAdd.length} catatan dari JSON.`);
            }
          } else {
            // Treat as Markdown/Txt
            const newNote = {
              id: AbelionUtils.generateId('note'),
              title: file.name.replace(/\.[^/.]+$/, ""),
              contentMarkdown: event.target.result,
              content: event.target.result,
              date: new Date().toISOString().slice(0, 10),
              createdAt: new Date().toISOString()
            };
            const existing = await Storage.getNotes();
            await Storage.setNotes([newNote, ...existing]);
            alert(`Berhasil mengimpor catatan: ${newNote.title}`);
          }
          location.reload();
        } catch (err) {
          alert('Gagal impor ' + file.name + ': ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  }

  // Drag & Drop Import
  document.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
  document.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImportFiles(e.dataTransfer.files);
    }
  });

  const meta = getVersionMeta();
  const label = document.getElementById('settings-version-label');
  if (meta?.version && label) {
    label.textContent = `${meta.version} (${meta.codename})`;
  }

  // --- Theme & Accent ---
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect && window.AbelionTheme) {
    themeSelect.value = window.AbelionTheme.getTheme();
    themeSelect.onchange = (e) => window.AbelionTheme.applyTheme(e.target.value);
  }

  const accentPicker = document.getElementById('accent-picker');
  if (accentPicker && window.AbelionTheme) {
    accentPicker.querySelectorAll('.accent-dot').forEach(btn => {
      btn.onclick = () => window.AbelionTheme.applyAccent(btn.dataset.color);
    });
  }

  renderStorageHealth();
  renderEncryptionState();
})();
