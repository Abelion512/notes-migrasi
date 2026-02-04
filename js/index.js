const {
  STORAGE_KEYS,
  sanitizeText,
  sanitizeRichContent,
  formatTanggal,
  formatTanggalRelative,
  debounce,
  generateId
} = AbelionUtils;

const Gamification = window.AbelionGamification || null;
const Storage = window.AbelionStorage;

const ModalManager = AbelionUtils.ModalManager;

// Global Error Handling
window.onerror = function (message, source, lineno, colno, error) {
  console.error('Global Error:', { message, source, lineno, colno, error });
  if (message && message.includes('ResizeObserver')) return;
  alert('Maaf, terjadi kesalahan: ' + message);
};

// --- Live time ---
function updateTime() {
  if (document.hidden) return;
  const el = document.getElementById('top-time');
  if (!el) return;
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
setInterval(updateTime, 1000);
updateTime();

// --- Version Check & Changelog ---
async function checkAppVersion() {
  const currentMeta = AbelionUtils.getVersionMeta();
  const storedVersion = localStorage.getItem('abelion-last-version');

  const versionBadge = document.querySelector('.nav-button[aria-label="Versi"] .nav-label');
  if (versionBadge) versionBadge.textContent = 'v' + currentMeta.version;

  if (storedVersion !== currentMeta.version) {
    showChangelog(currentMeta.version);
    localStorage.setItem('abelion-last-version', currentMeta.version);
  }
}

function showChangelog(version) {
  const modal = document.getElementById('changelog-modal');
  const verEl = document.getElementById('changelog-version');
  const listEl = document.getElementById('changelog-list');
  const logs = AbelionUtils.getVersionChangelog();
  const latest = logs.find(l => l.version.includes(version)) || logs[0];

  if (modal && verEl && listEl && latest) {
    verEl.textContent = latest.version;
    listEl.innerHTML = '';
    const ul = document.createElement('ul');
    ul.style.display = 'flex';
    ul.style.flexDirection = 'column';
    ul.style.gap = '10px';
    latest.highlights.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    listEl.appendChild(ul);
    if (ModalManager) ModalManager.open('changelog-modal', modal);
    else modal.classList.add('show');
  }
}

const changelogClose = document.getElementById('changelog-close');
const changelogAck = document.getElementById('changelog-ack');
[changelogClose, changelogAck].forEach(el => {
  if (el) el.onclick = () => {
    if (ModalManager) ModalManager.close('changelog-modal');
    else document.getElementById('changelog-modal').classList.remove('show');
  };
});

let notes = [];
let folders = [];
let notesLoaded = false;

async function loadFolders() {
  folders = await Storage.getFolders();
  renderFolders();
}

async function loadNotes() {
  try {
    const storedNotes = await Storage.getNotes({ sortByUpdatedAt: false });
    // Sort by sortOrder if available
    const sortedNotes = storedNotes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    notes = sortedNotes.map(note => ({
      ...note,
      _searchText: [
        note.title || '',
        note.contentMarkdown || (note.content || '').replace(/<[^>]+>/g, ''),
        note.label || ''
      ].join(' ').toLowerCase()
    }));
    notesLoaded = true;
    return notes;
  } catch (error) {
    if (error?.code === 'STORAGE_LOCKED') return notes;
    console.error('Gagal memuat catatan', error);
    return notes;
  }
}

function noteDraftKey(id = 'new') {
  return `note-${id}`;
}


function markdownFromNote(note) {
  if (!note) return '';
  if (note.contentMarkdown) return note.contentMarkdown;
  if (NoteEditor && typeof NoteEditor.toMarkdown === 'function') {
    return NoteEditor.toMarkdown(note.content || '') || '';
  }
  const temp = document.createElement('div');
  temp.innerHTML = note.content || '';
  return temp.textContent || '';
}

function renderMarkdown(markdown) {
  if (NoteEditor && typeof NoteEditor.toHtml === 'function') {
    return NoteEditor.toHtml(markdown);
  }
  return sanitizeRichContent(sanitizeText(markdown));
}

function showXPToast({ xp, message, streak, bonus }) {
  if (!xp) return;
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.innerHTML = `
    <div class="xp-toast-icon">⭐</div>
    <div class="xp-toast-content">
      <strong>+${xp} XP</strong>
      <span>${message || ''}</span>
      ${bonus > 0 ? `<small>🔥 Bonus streak +${bonus} XP</small>` : (streak > 1 ? `<small>🔥 ${streak} hari berturut-turut!</small>` : '')}
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

if (Gamification) {
  Gamification.trackDailyLogin().then(res => {
    if (res && res.xp > 0) {
      showXPToast({ xp: res.xp, message: 'Login harian', streak: res.streak, bonus: res.bonus });
    }
  }).catch(console.error);
}

async function persistNotes() {
  // Assign sortOrder based on current index to preserve drag-and-drop order
  const notesWithOrder = notes.map((note, index) => ({
    ...note,
    sortOrder: index
  }));
  await Storage.setNotes(notesWithOrder);
}

// --- Mood Graph ---
function renderHeroContent() {
  const mottos = [
    "“Gagal sekali bukan berarti gagal selamanya.”",
    "“Catat hari ini, eksekusi hari esok.”",
    "“Ide adalah aset, jangan biarkan ia menguap.”",
    "“Kualitas pikiran ditentukan oleh kualitas catatan.”",
    "“Setiap langkah kecil adalah progres.”"
  ];
  const mottoEl = document.getElementById('dynamic-motto');
  if (mottoEl) mottoEl.textContent = mottos[Math.floor(Math.random() * mottos.length)];

  const greetingEl = document.getElementById('dynamic-greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    let prefix = 'Halo';
    if (hour >= 5 && hour < 11) prefix = 'Selamat Pagi';
    else if (hour >= 11 && hour < 15) prefix = 'Selamat Siang';
    else if (hour >= 15 && hour < 19) prefix = 'Selamat Sore';
    else prefix = 'Selamat Malam';
    greetingEl.textContent = `${prefix}, siap mencatat hari ini?`;
  }
}

async function renderMoodGraph() {
  const el = document.getElementById('mood-graph');
  if (!el) return;
  const stored = await Storage.getValue(STORAGE_KEYS.MOODS, {});
  const days = [];
  const formatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
  const todayIso = new Date().toISOString().split('T')[0];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    days.push({
      iso,
      label: formatter.format(d).replace(/\.$/, ''),
      isToday: iso === todayIso
    });
  }

  el.innerHTML = days.map(m => `
    <div class="mood-bar ${m.isToday ? 'today' : ''}">
      <div class="mood-emoji">${stored[m.iso] || '⚪'}</div>
      <div class="mood-date">${m.label}</div>
    </div>
  `).join('');
}

function updateMood() {
  const modal = document.getElementById('mood-picker-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('mood-picker-close');
  const options = document.querySelectorAll('.mood-option-btn');

  const hide = () => {
    if (ModalManager) ModalManager.close('mood-picker-modal');
    else modal.classList.remove('show');
  };

  options.forEach(btn => {
    btn.onclick = async () => {
      const mood = btn.dataset.mood;
      const today = new Date().toISOString().split('T')[0];
      const stored = await Storage.getValue(STORAGE_KEYS.MOODS, {});
      stored[today] = mood;
      await Storage.setValue(STORAGE_KEYS.MOODS, stored);
      await renderMoodGraph();

      if (Gamification && typeof Gamification.awardXP === 'function') {
        Gamification.awardXP(10, 'Tracking mood harian');
      }

      hide();
    };
  });

  closeBtn.onclick = hide;
  if (ModalManager) ModalManager.open('mood-picker-modal', modal);
  else modal.classList.add('show');
}

// --- Search & Filter ---
let searchQuery = '';
let filterByTag = '';
let activeFolderId = 'all';
let activeNoteId = null;

function renderFolders() {
  const el = document.getElementById('folder-list');
  if (!el) return;

  const allActive = activeFolderId === 'all' ? ' active' : '';
  let html = `<div class="folder-pill${allActive}" data-id="all" style="${allActive ? 'background: var(--primary); color: white;' : 'background: var(--surface-alt); color: var(--text-secondary);'} padding: 8px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;">Semua</div>`;

  folders.forEach(f => {
    const active = activeFolderId === f.id ? ' active' : '';
    html += `
      <div class="folder-pill${active}" data-id="${f.id}" style="${active ? 'background: var(--primary); color: white;' : 'background: var(--surface-alt); color: var(--text-secondary);'} padding: 8px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;">
        ${f.icon || '📁'} ${f.name}
      </div>
    `;
  });

  const archivedActive = activeFolderId === 'archived' ? ' active' : '';
  html += `<div class="folder-pill${archivedActive}" data-id="archived" style="${archivedActive ? 'background: var(--text-secondary); color: white;' : 'background: var(--surface-alt); color: var(--text-secondary);'} padding: 8px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;">📦 Arsip</div>`;

  const trashActive = activeFolderId === 'trash' ? ' active' : '';
  html += `<div class="folder-pill${trashActive}" data-id="trash" style="${trashActive ? 'background: var(--danger); color: white;' : 'background: var(--surface-alt); color: var(--text-secondary);'} padding: 8px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;">🗑️ Sampah</div>`;

  el.innerHTML = html;

  el.querySelectorAll('.folder-pill').forEach(pill => {
    pill.onclick = () => {
      activeFolderId = pill.dataset.id;
      renderFolders();
      renderNotes();
    };
  });
}

function addFolder() {
  const modal = document.getElementById('folder-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('folder-modal-close');
  const nameInput = document.getElementById('folder-name-input');
  const iconInput = document.getElementById('folder-icon-input');
  const saveBtn = document.getElementById('save-folder-btn');

  const hide = () => {
    if (ModalManager) ModalManager.close('folder-modal');
    else modal.classList.remove('show');
  };

  saveBtn.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) return;

    const newFolder = {
      id: generateId('folder'),
      name,
      icon: iconInput.value.trim() || '📁',
      createdAt: new Date().toISOString()
    };

    folders.push(newFolder);
    await Storage.setFolders(folders);
    renderFolders();
    hide();

    nameInput.value = '';
    iconInput.value = '';
  };

  closeBtn.onclick = hide;
  if (ModalManager) ModalManager.open('folder-modal', modal);
  else modal.classList.add('show');
}

function renderSearchBar() {
  let searchDiv = document.getElementById('search-bar');
  if (!searchDiv) {
    searchDiv = document.createElement('div');
    searchDiv.id = 'search-bar';
    searchDiv.innerHTML = `<input id="search-input" class="search-input" type="text" placeholder="Cari catatan..." autocomplete="off"/>`;
    const grid = document.getElementById('notes-grid');
    grid.parentNode.insertBefore(searchDiv, grid);
    document.getElementById('search-input').addEventListener('input', debounce(function() {
      searchQuery = sanitizeText(this.value).toLowerCase();
      renderNotes();
    }, 250));
  }
}

async function renderNotes() {
  const grid = document.getElementById("notes-grid");

  if (activeFolderId === 'trash') {
    const trash = await Storage.getTrash();
    if (!trash.length) {
      grid.innerHTML = `<div class="notes-empty"><h3>Sampah kosong</h3></div>`;
      return;
    }
    grid.innerHTML = trash.map(n => `
      <div class="note-card" data-id="${n.id}" data-type="trash">
        <div class="note-actions">
          <button class="action-btn restore" data-action="restore" title="Pulihkan">🔄</button>
          <button class="action-btn delete-perm" data-action="delete-perm" title="Hapus Permanen">❌</button>
        </div>
        <div class="note-title">${sanitizeText(n.title)}</div>
        <div class="note-date">Dihapus: ${formatTanggalRelative(n.deletedAt)}</div>
      </div>
    `).join('');
    return;
  }

  if (!notes.length) {
    grid.innerHTML = `<div class="notes-empty"><h3>Belum ada catatan</h3><button class="btn-blue" onclick="document.getElementById('add-note-btn').click()">Buat catatan</button></div>`;
    return;
  }

  const filtered = notes.filter(n => {
    const matchSearch = !searchQuery || (n._searchText || '').includes(searchQuery);
    const matchTag = !filterByTag || (n.label || '').toLowerCase() === filterByTag.toLowerCase();

    if (activeFolderId === 'archived') return n.isArchived && matchSearch && matchTag;
    if (activeFolderId === 'all') return !n.isArchived && matchSearch && matchTag;

    const matchFolder = n.folderId === activeFolderId;
    return matchSearch && matchTag && matchFolder && !n.isArchived;
  });

  // Keep manual order if no search/filter/tag active, otherwise sort by pinned/date
  let sorted = filtered;
  if (searchQuery || filterByTag || activeFolderId !== 'all') {
    sorted = [...filtered].sort((a, b) => (b.pinned - a.pinned) || new Date(b.date) - new Date(a.date));
  }

  if (!sorted.length) {
    grid.innerHTML = `<div class="notes-empty"><p>Catatan tidak ditemukan.</p></div>`;
    return;
  }

  grid.innerHTML = sorted.map(n => {
    const isSecret = Boolean(n.isSecret);
    // Mask in grid if it's secret (always, for privacy in list view)
    const maskContent = isSecret;

    const content = maskContent
      ? `<div class="note-content-masked"><span class="lock-icon">🔒</span> Konten ini dirahasiakan</div>`
      : `<div class="note-content">${renderMarkdown(n.contentMarkdown || markdownFromNote(n))}</div>`;

    const activeClass = activeNoteId === n.id ? ' note-card--active' : '';
    const secretClass = isSecret ? ' note-card--secret' : '';

    return `
      <div class="note-card${activeClass}${secretClass}" data-id="${n.id}" tabindex="0">
        <div class="note-actions">
          <button class="action-btn pin ${n.pinned ? 'pin-active' : ''}" data-action="pin" title="Pin">📌</button>
          <button class="action-btn star ${n.isFavorite ? 'star-active' : ''}" data-action="star" title="Favorit">⭐</button>
          <button class="action-btn archive" data-action="archive" title="${n.isArchived ? 'Buka Arsip' : 'Arsipkan'}">📦</button>
          <button class="action-btn copy" data-action="copy" title="Salin">📋</button>
          <button class="action-btn delete" data-action="delete" title="Hapus">🗑️</button>
        </div>
        <div class="note-title">
          ${n.icon ? `<span class="icon">${sanitizeText(n.icon)}</span>` : ''}
          ${sanitizeText(n.title)}
        </div>
        ${content}
        <div class="note-date">Ditulis: ${formatTanggalRelative(n.date)}</div>
      </div>
    `;
  }).join('');
}

function initSortable() {
  const grid = document.getElementById("notes-grid");
  if (!grid || typeof Sortable === 'undefined') return;

  Sortable.create(grid, {
    animation: 150,
    ghostClass: 'note-card--ghost',
    onEnd: async () => {
      const newOrderIds = Array.from(grid.querySelectorAll('.note-card')).map(el => el.dataset.id);

      // Update notes array to match new order
      const orderedNotes = [];
      newOrderIds.forEach(id => {
        const n = notes.find(note => note.id === id);
        if (n) orderedNotes.push(n);
      });

      // Add back any notes that might have been filtered out but are in the original list
      notes.forEach(n => {
        if (!orderedNotes.find(on => on.id === n.id)) {
          orderedNotes.push(n);
        }
      });

      notes = orderedNotes;
      await persistNotes();
    }
  });
}

function initCommandPalette() {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-input');
  const results = document.getElementById('command-results');

  const commands = [
    { name: 'Tulis Catatan Baru', icon: '📝', action: () => openNoteModal('create') },
    { name: 'Buka Pengaturan', icon: '⚙️', action: () => window.location.href = 'pages/settings.html' },
    { name: 'Buka Profil', icon: '👤', action: () => window.location.href = 'pages/profile.html' },
    { name: 'Lihat Arsip', icon: '📦', action: () => { activeFolderId = 'archived'; renderFolders(); renderNotes(); } },
    { name: 'Lihat Sampah', icon: '🗑️', action: () => { activeFolderId = 'trash'; renderFolders(); renderNotes(); } },
    { name: 'Ganti Tema', icon: '🌓', action: () => {
        const current = AbelionTheme.getTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        AbelionTheme.applyTheme(next);
      }
    }
  ];

  function show() {
    palette.style.display = 'flex';
    input.focus();
    renderResults('');
  }

  function hide() {
    palette.style.display = 'none';
    input.value = '';
  }

  function renderResults(query) {
    results.innerHTML = '';
    const q = query.toLowerCase();

    const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(q));
    const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(q)).slice(0, 5);

    if (filteredCommands.length > 0) {
      const h = document.createElement('div');
      h.textContent = 'Perintah';
      h.style = 'font-size: 0.8em; color: var(--text-muted); margin-bottom: 8px; padding-left: 10px;';
      results.appendChild(h);

      filteredCommands.forEach(c => {
        const item = document.createElement('div');
        item.className = 'command-item';
        item.style = 'padding: 12px 15px; border-radius: 10px; cursor: pointer; display: flex; gap: 10px; align-items: center; transition: background 0.2s;';
        item.innerHTML = `<span>${c.icon}</span> <span>${c.name}</span>`;
        item.onclick = () => { c.action(); hide(); };
        item.onmouseover = () => item.style.background = 'var(--surface-alt)';
        item.onmouseout = () => item.style.background = 'transparent';
        results.appendChild(item);
      });
    }

    if (filteredNotes.length > 0) {
      const h = document.createElement('div');
      h.textContent = 'Catatan';
      h.style = 'font-size: 0.8em; color: var(--text-muted); margin: 12px 0 8px; padding-left: 10px;';
      results.appendChild(h);

      filteredNotes.forEach(n => {
        const item = document.createElement('div');
        item.className = 'command-item';
        item.style = 'padding: 12px 15px; border-radius: 10px; cursor: pointer; display: flex; gap: 10px; align-items: center; transition: background 0.2s;';
        item.innerHTML = `<span>📄</span> <span>${n.title}</span>`;
        item.onclick = () => { openNoteModal('edit', n); hide(); };
        item.onmouseover = () => item.style.background = 'var(--surface-alt)';
        item.onmouseout = () => item.style.background = 'transparent';
        results.appendChild(item);
      });
    }
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      show();
    }
    if (e.key === 'Escape') hide();
  });

  input.addEventListener('input', (e) => renderResults(e.target.value));

  palette.onclick = (e) => { if (e.target === palette) hide(); };
}

function setupDelegation() {
  const grid = document.getElementById("notes-grid");
  const confirmAction = (title, message, okLabel = 'Hapus') => {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-modal');
      const titleEl = document.getElementById('confirm-title');
      const messageEl = document.getElementById('confirm-message');
      const okBtn = document.getElementById('confirm-ok');
      const cancelBtn = document.getElementById('confirm-cancel');

      titleEl.textContent = title;
      messageEl.textContent = message;
      okBtn.textContent = okLabel;

      const hide = (res) => {
        if (ModalManager) ModalManager.close('confirm-modal');
        else modal.classList.remove('show');
        resolve(res);
      };

      okBtn.onclick = () => hide(true);
      cancelBtn.onclick = () => hide(false);

      if (ModalManager) ModalManager.open('confirm-modal', modal);
      else modal.classList.add('show');
    });
  };

  grid.addEventListener('contextmenu', (e) => {
    const card = e.target.closest('.note-card');
    if (!card) return;
    e.preventDefault();

    const id = card.dataset.id;
    const note = notes.find(n => n.id === id);
    if (!note) return;

    // We can just trigger the same actions or show a better custom menu later
    // For now, let's just make the pin/unpin/archive easier
    note.pinned = !note.pinned;
    persistNotes().then(renderNotes);
  });

  grid.addEventListener('click', async (e) => {
    const card = e.target.closest('.note-card');
    const actionBtn = e.target.closest('.action-btn');
    const wikiLink = e.target.closest('.wiki-link');

    if (wikiLink) {
      e.preventDefault();
      e.stopPropagation();
      const targetTitle = wikiLink.dataset.target.toLowerCase();
      const targetNote = notes.find(n => n.title.toLowerCase() === targetTitle);
      if (targetNote) {
        openNoteModal('edit', targetNote);
      } else {
        alert(`Catatan "${wikiLink.dataset.target}" tidak ditemukan.`);
      }
      return;
    }

    if (!card) return;

    const id = card.dataset.id;
    const note = notes.find(n => n.id === id);

    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.action;
      if (action === 'pin') {
        note.pinned = !note.pinned;
        await persistNotes();
        renderNotes();
      } else if (action === 'star') {
        note.isFavorite = !note.isFavorite;
        await persistNotes();
        renderNotes();
      } else if (action === 'archive') {
        note.isArchived = !note.isArchived;
        await persistNotes();
        renderNotes();
      } else if (action === 'delete') {
        const confirmed = await confirmAction('Hapus Catatan', `Pindahkan "${note.title}" ke sampah?`);
        if (confirmed) {
          await Storage.moveToTrash(id);
          notes = notes.filter(n => n.id !== id);
          if (Gamification) Gamification.recordNoteDeleted({ id, createdAt: note.createdAt });
          renderNotes();
        }
      } else if (action === 'restore') {
        await Storage.restoreFromTrash(id);
        await loadNotes();
        renderNotes();
      } else if (action === 'delete-perm') {
        const confirmed = await confirmAction('Hapus Permanen', 'Tindakan ini tidak bisa dibatalkan.', 'Hapus Selamanya');
        if (confirmed) {
           // Implement individual delete from trash
           const trash = await Storage.getTrash();
           const newTrash = trash.filter(n => n.id !== id);
           // We need a way to set trash directly or delete by id
           // Since storage.js doesn't have setTrash, I'll use vacuum as a hint or implement it if possible
           // Actually, let's just use Storage.vacuum() for now as suggested or implement a simple one
           alert('Segera hadir: Hapus permanen individu.');
        }
      } else if (action === 'copy') {
        const text = `${note.title}\n\n${markdownFromNote(note)}`;
        navigator.clipboard.writeText(text).then(() => {
           actionBtn.textContent = '✅';
           setTimeout(() => { actionBtn.textContent = '📋'; }, 2000);
        });
      }
      return;
    }

    activeNoteId = id;
    if (note.isSecret && Storage.isLocked() && Storage.isEncryptionEnabled()) {
       alert('Catatan ini terkunci. Harap buka kunci penyimpanan di Pengaturan.');
       return;
    }
    openNoteModal('edit', note);
  });
}

function openNoteModal(mode = 'create', existingNote = null) {
  const NoteEditor = window.NoteEditorModal;
  if (!NoteEditor) {
    console.error('NoteEditorModal not loaded');
    alert('Editor belum siap. Silakan coba lagi sebentar.');
    return;
  }
  NoteEditor.open({
    mode,
    initialValue: {
      icon: existingNote?.icon || '',
      title: existingNote?.title || '',
      content: markdownFromNote(existingNote),
      isSecret: existingNote?.isSecret || false
    },
    onSave: async (payload) => {
      const iso = new Date().toISOString();
      if (mode === 'edit' && existingNote) {
        Object.assign(existingNote, {
          icon: payload.icon,
          title: payload.title,
          content: payload.contentHtml,
          contentMarkdown: payload.contentMarkdown,
          isSecret: payload.isSecret,
          updatedAt: iso
        });
        if (Gamification) {
          const oldLen = (existingNote.contentMarkdown || existingNote.content || '').length;
          const newLen = (payload.contentMarkdown || payload.contentHtml || '').length;
          const charDiff = Math.abs(newLen - oldLen);
          Gamification.recordNoteUpdated({ id: existingNote.id, updatedAt: iso, charDiff });
          if (payload.isSecret) Gamification.recordSecretNoteUsed();
        }
      } else {
        const id = generateId('note');
        notes.unshift({
          id,
          ...payload,
          content: payload.contentHtml,
          date: iso.slice(0, 10),
          createdAt: iso,
          pinned: false
        });
        if (Gamification) {
          Gamification.recordNoteCreated({ id, createdAt: iso });
          if (payload.isSecret) Gamification.recordSecretNoteUsed();
        }
      }
      await persistNotes();
      renderNotes();
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  const addBtn = document.getElementById('add-note-btn');
  if (addBtn) {
    addBtn.onclick = () => openNoteModal('create');
  }

  const aboutBtn = document.getElementById('nav-about');
  const aboutModal = document.getElementById('about-modal');
  const aboutClose = document.getElementById('about-close');
  const moodBtn = document.getElementById('update-mood-btn');

  if (moodBtn) {
    moodBtn.onclick = updateMood;
  }

  if (aboutBtn && aboutModal) {
    aboutBtn.onclick = () => {
      if (ModalManager) ModalManager.open('about-modal', aboutModal);
      else aboutModal.classList.add('show');
    };
  }
  if (aboutClose) {
    aboutClose.onclick = () => {
      if (ModalManager) ModalManager.close('about-modal');
      else aboutModal.classList.remove('show');
    };
  }

  function updateOnlineStatus() {
    const badge = document.getElementById('offline-badge');
    if (!badge) return;
    if (navigator.onLine) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Reading progress
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    const bar = document.getElementById('reading-progress');
    if (bar) bar.style.width = scrolled + "%";
  });

  await Storage.ready;
  await loadFolders();
  await loadNotes();
  await renderMoodGraph();
  renderHeroContent();
  renderSearchBar();
  renderNotes();
  setupDelegation();
  initSortable();
  initCommandPalette();
  checkAppVersion();

  const addFolderBtn = document.getElementById('add-folder-btn');
  if (addFolderBtn) addFolderBtn.onclick = addFolder;

  // Drag & Drop Import
  document.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
  document.addEventListener('drop', async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (const file of e.dataTransfer.files) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const newNote = {
            id: generateId('note'),
            title: file.name.replace(/\.[^/.]+$/, ""),
            contentMarkdown: event.target.result,
            content: event.target.result,
            date: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString()
          };
          notes.unshift(newNote);
          await persistNotes();
          renderNotes();
        };
        reader.readAsText(file);
      }
    }
  });

  const intro = document.getElementById('intro-anim');
  const main = document.getElementById('main-content');
  if (!intro || !main) return;

  if (sessionStorage.getItem('skipIntro')) {
    intro.style.display = 'none';
    main.classList.remove('hidden');
    sessionStorage.removeItem('skipIntro');
    return;
  }

  let p = 0;
  const pt = document.getElementById('progress-text');
  let interval = setInterval(() => {
    p = Math.min(100, p + Math.floor(Math.random() * 15 + 5));
    if (pt) pt.textContent = p + "%";
    if (p >= 100) {
      clearInterval(interval);
      intro.style.opacity = 0;
      setTimeout(() => {
        intro.style.display = "none";
        main.classList.remove('hidden');
      }, 800);
    }
  }, 50);
});
