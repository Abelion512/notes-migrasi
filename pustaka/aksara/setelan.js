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
    const usageValEl = document.getElementById('storage-usage-value');
    const usageBarEl = document.getElementById('storage-usage-bar');
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

    if (usageValEl && usageBarEl && usage?.usage) {
      const used = usage.usage || 0;
      const quota = usage.quota || 1;
      const pct = Math.max(1, Math.min(100, (used / quota) * 100));
      usageValEl.textContent = formatBytes(used);
      usageBarEl.style.width = `${pct}%`;
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
    window.location.href = 'riwayat.html';
  });

  const refreshBtn = document.getElementById('storage-refresh-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', renderStorageHealth);

  const vacuumBtn = document.getElementById('storage-vacuum-btn');
  if (vacuumBtn) vacuumBtn.addEventListener('click', async () => {
    await Storage.vacuum();
    await renderStorageHealth();
    alert('Penyimpanan telah dioptimalkan.');
  });

  const factoryResetBtn = document.getElementById('factory-reset-btn');
  if (factoryResetBtn) {
    factoryResetBtn.onclick = async () => {
      const confirm1 = await AbelionUtils.confirmAction('Hapus Data Permanen', 'Semua catatan, folder, dan pengaturan akan dihapus secara permanen. Lanjutkan?', 'Lanjutkan', 'Batal');
      if (!confirm1) return;

      const confirm2 = await AbelionUtils.confirmAction('Konfirmasi Terakhir', 'Apakah Anda benar-benar yakin? Tindakan ini tidak dapat dibatalkan.', 'Hapus Semua', 'Batal');
      if (!confirm2) return;

      try {
        await Storage.destroy();
        localStorage.clear();
        alert('Data telah dihapus. Aplikasi akan memuat ulang.');
        window.location.href = '../index.html';
      } catch (err) {
        alert('Gagal menghapus data: ' + err.message);
      }
    };
  }

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
    secureLogout.addEventListener('click', async () => {
      const ok = await AbelionUtils.confirmAction('Kunci Vault', 'Amankan data Anda sekarang? Anda akan membutuhkan kunci untuk membukanya kembali.', 'Ya, Kunci', 'Batal');
      if (ok) {
        Storage.lock();
        location.reload();
      }
    });
  }

  // --- Manual Sync ---
  const syncBtn = document.getElementById('manual-sync-btn');
  const syncStatus = document.getElementById('sync-status');
  if (syncBtn) {
    syncBtn.onclick = async () => {
      if (Storage.getEngine() !== 'supabase') {
        alert('Hubungkan ke Supabase di menu Layanan Cloud terlebih dahulu.');
        return;
      }

      const icon = syncBtn.querySelector('svg');
      if (icon) icon.style.animation = 'spin 1s linear infinite';
      syncBtn.disabled = true;
      syncStatus.textContent = 'Menyinkronkan...';

      try {
        const notes = await Storage.getNotes();
        await Storage.setNotes(notes, { onlyDirty: false }); // Force full sync
        syncStatus.textContent = `Terakhir: ${new Date().toLocaleTimeString()}`;
        // alert('Sinkronisasi selesai!'); // User might prefer silent or toast, but alert is ok for now. 
        // Plan said "Verify ... completion alert".
        setTimeout(() => alert('Sinkronisasi selesai!'), 100);
      } catch (err) {
        syncStatus.textContent = 'Gagal sinkron.';
        alert('Gagal: ' + err.message);
      } finally {
        if (icon) icon.style.animation = '';
        syncBtn.disabled = false;
      }
    };
  }

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
        else if (format === 'md' || format === 'txt') {
          if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded');
          const zip = new JSZip();
          const ext = format === 'md' ? '.md' : '.txt';
          notes.forEach(n => {
            const filename = (n.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-') + ext;
            const body = format === 'md'
              ? `---\ntitle: ${n.title}\ndate: ${n.date}\n---\n\n${n.contentMarkdown || n.content}`
              : `${n.title}\n${n.date}\n\n${n.contentMarkdown || (n.content || '').replace(/<[^>]+>/g, '')}`;
            zip.file(filename, body);
          });
          const blob = await zip.generateAsync({ type: 'blob' });
          downloadBlob(blob, `abelion-${format === 'md' ? 'markdown' : 'text'}-${dateStr}.zip`);
        }
        else if (format === 'md-single' || format === 'txt-single') {
          const ext = format === 'md-single' ? '.md' : '.txt';
          let combinedContent = '';
          notes.forEach(n => {
            const body = format === 'md-single'
              ? `\n\n# ${n.title}\n*Tanggal: ${n.date}*\n\n${n.contentMarkdown || n.content}\n\n---\n`
              : `\n\n${n.title.toUpperCase()}\n${n.date}\n${'-'.repeat(n.title.length)}\n\n${n.contentMarkdown || (n.content || '').replace(/<[^>]+>/g, '')}\n\n====================\n`;
            combinedContent += body;
          });
          downloadBlob(new Blob([combinedContent], { type: format === 'md-single' ? 'text/markdown' : 'text/plain' }), `abelion-all-notes-${dateStr}${ext}`);
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
          if (typeof docx === 'undefined') throw new Error('docx library not loaded');
          const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

          const sections = notes.map(n => ({
            properties: {},
            children: [
              new Paragraph({ text: n.title || 'Untitled', heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ children: [new TextRun({ text: `Tanggal: ${n.date}`, italics: true })] }),
              new Paragraph({ text: "" }),
              new Paragraph({ text: n.contentMarkdown || (n.content || '').replace(/<[^>]+>/g, '') })
            ]
          }));

          const doc = new Document({ sections });
          const blob = await Packer.toBlob(doc);
          downloadBlob(blob, `abelion-notes-${dateStr}.docx`);
        }
        else if (format === 'png') {
          if (typeof html2canvas === 'undefined') throw new Error('html2canvas not loaded');
          alert('Mengekspor catatan terpilih sebagai gambar. Proses ini mungkin memerlukan waktu beberapa saat.');

          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '0';
          container.style.width = '800px';
          container.style.background = '#f5f5f7';
          container.style.padding = '40px';
          document.body.appendChild(container);

          for (const [idx, n] of notes.entries()) {
            const page = document.createElement('div');
            page.style.background = 'white';
            page.style.borderRadius = '20px';
            page.style.padding = '40px';
            page.style.marginBottom = '40px';
            page.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            page.innerHTML = `
              <h1 style="margin: 0 0 10px 0; font-family: sans-serif;">${n.title}</h1>
              <div style="color: #888; margin-bottom: 20px;">${n.date}</div>
              <div style="line-height: 1.6; font-family: serif; font-size: 1.2em;">${n.contentMarkdown || n.content}</div>
            `;
            container.appendChild(page);

            if (idx < 3 || await AbelionUtils.confirmAction('Ekspor Gambar', `Lanjutkan ekspor catatan ke-${idx + 1}? (Maksimal 5 untuk demo gambar)`)) {
              const canvas = await html2canvas(page);
              const dataUrl = canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = dataUrl;
              a.download = `abelion-note-${idx + 1}-${dateStr}.png`;
              a.click();
            }
            if (idx >= 4) break;
          }
          document.body.removeChild(container);
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
              // Preserve order if we can
              const combined = [...existing, ...toAdd].map((n, i) => ({ ...n, sortOrder: i }));
              await Storage.setNotes(combined);
              alert(`Berhasil mengimpor ${toAdd.length} catatan dari JSON.`);
            }
          } else {
            // Treat as Markdown/Txt
            const newNote = {
              id: (AbelionUtils.generateId || window.generateId)('note'),
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
  // --- Theme & Accent ---
  const themeTrigger = document.getElementById('theme-picker-trigger');
  const themeModal = document.getElementById('theme-picker-modal');
  const themeClose = document.getElementById('theme-picker-close');
  const themeOptions = document.querySelectorAll('.theme-option-btn');

  if (themeTrigger && window.AbelionTheme) {
    const updateUI = () => {
      const current = window.AbelionTheme.getTheme();
      const map = { 'light': '☀️ Terang', 'dark': '🌙 Gelap', 'auto': '🖥️ Sistem' };
      themeTrigger.innerHTML = `${map[current] || 'Sistem'} <span style="opacity: 0.5;">▼</span>`;

      if (themeModal) {
        themeOptions.forEach(btn => {
          const check = btn.querySelector('.check-icon');
          if (check) check.style.display = btn.dataset.value === current ? 'block' : 'none';
        });
      }
    };

    themeTrigger.onclick = () => {
      if (themeModal) {
        if (window.AbelionUtils && window.AbelionUtils.ModalManager) {
          window.AbelionUtils.ModalManager.open('theme-picker-modal', themeModal);
        } else {
          themeModal.classList.add('show');
        }
        updateUI();
      }
    };

    if (themeClose) {
      themeClose.onclick = () => {
        if (window.AbelionUtils && window.AbelionUtils.ModalManager) {
          window.AbelionUtils.ModalManager.close('theme-picker-modal');
        } else {
          themeModal.classList.remove('show');
        }
      };
    }

    themeOptions.forEach(btn => {
      btn.onclick = () => {
        window.AbelionTheme.applyTheme(btn.dataset.value);
        updateUI();
        if (themeClose) themeClose.click();
      };
    });

    updateUI();
  }

  const accentPicker = document.getElementById('accent-picker');
  if (accentPicker && window.AbelionTheme) {
    accentPicker.querySelectorAll('.accent-dot').forEach(btn => {
      btn.onclick = () => window.AbelionTheme.applyAccent(btn.dataset.color);
    });
  }

  // --- PWA Installation ---
  let deferredPrompt;
  const installBtn = document.getElementById('install-pwa-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    });
  }

  renderStorageHealth();
  renderEncryptionState();
})();
