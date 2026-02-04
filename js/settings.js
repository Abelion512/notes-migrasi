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
  if (supabaseToggle) {
    const disabled = localStorage.getItem('abelion-disable-supabase') === 'true';
    supabaseToggle.checked = !disabled;
    supabaseToggle.onchange = (e) => {
      localStorage.setItem('abelion-disable-supabase', (!e.target.checked).toString());
      alert('Pengaturan sinkronisasi disimpan. Muat ulang halaman untuk menerapkan perubahan.');
    };
  }

  // --- Export / Import ---
  const exportJsonBtn = document.getElementById('export-json-btn');
  if (exportJsonBtn) {
    exportJsonBtn.onclick = async () => {
      try {
        const notes = await Storage.getNotes();
        const data = JSON.stringify({
          version: '2.0',
          exportedAt: new Date().toISOString(),
          notes
        }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abelion-notes-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('Gagal export JSON: ' + err.message);
      }
    };
  }

  const exportMdBtn = document.getElementById('export-md-btn');
  if (exportMdBtn) {
    exportMdBtn.onclick = async () => {
      if (typeof JSZip === 'undefined') {
        alert('Library JSZip belum dimuat. Periksa koneksi internet.');
        return;
      }
      try {
        const notes = await Storage.getNotes();
        const zip = new JSZip();
        notes.forEach(note => {
          const filename = (note.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-') + '.md';
          const content = `---\ntitle: ${note.title || ''}\ndate: ${note.date || ''}\ntags: ${note.label || ''}\n---\n\n${note.contentMarkdown || note.content || ''}`;
          zip.file(filename, content);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abelion-notes-markdown-${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('Gagal export Markdown: ' + err.message);
      }
    };
  }

  const importInput = document.getElementById('import-json-input');
  if (importInput) {
    importInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const importedNotes = Array.isArray(data.notes) ? data.notes : (Array.isArray(data) ? data : null);
          if (!importedNotes) throw new Error('Format file tidak valid.');

          if (confirm(`Impor ${importedNotes.length} catatan? Ini akan menggabungkan dengan catatan yang sudah ada.`)) {
            const existing = await Storage.getNotes();
            const existingIds = new Set(existing.map(n => n.id));
            const toAdd = importedNotes.filter(n => !existingIds.has(n.id));
            const merged = [...existing, ...toAdd];
            await Storage.setNotes(merged);
            alert(`Berhasil mengimpor ${toAdd.length} catatan baru.`);
            location.reload();
          }
        } catch (err) {
          alert('Gagal impor: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
  }

  const meta = getVersionMeta();
  const label = document.getElementById('settings-version-label');
  if (meta?.version && label) {
    label.textContent = `${meta.version} (${meta.codename})`;
  }

  renderStorageHealth();
  renderEncryptionState();
})();
