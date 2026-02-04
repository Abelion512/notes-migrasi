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
let notesLoaded = false;

async function loadNotes() {
  try {
    const storedNotes = await Storage.getNotes({ sortByUpdatedAt: true });
    notes = storedNotes.map(note => ({
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
  await Storage.setNotes(notes);
}

// --- Mood Graph ---
async function renderMoodGraph() {
  const el = document.getElementById('mood-graph');
  if (!el) return;
  const stored = await Storage.getValue(STORAGE_KEYS.MOODS, {});
  const days = [];
  const formatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    days.push({ iso, label: formatter.format(d).replace(/\.$/, '') });
  }
  el.innerHTML = days.map(m => `
    <div class="mood-bar">
      <div class="mood-emoji">${stored[m.iso] || '⚪'}</div>
      <div class="mood-date">${m.label}</div>
    </div>
  `).join('');
}

async function updateMood() {
  const emojis = ['😊', '😐', '😔', '😴', '🔥', '🌈', '💪'];
  const mood = prompt(`Bagaimana perasaanmu hari ini?\n${emojis.join(' ')}`, '😊');
  if (!mood || !emojis.includes(mood)) return;

  const today = new Date().toISOString().split('T')[0];
  const stored = await Storage.getValue(STORAGE_KEYS.MOODS, {});
  stored[today] = mood;
  await Storage.setValue(STORAGE_KEYS.MOODS, stored);
  await renderMoodGraph();
  if (Gamification) {
    // Optional: give XP for tracking mood
    // Gamification.awardXP(10, 'Tracking mood harian');
  }
}

// --- Search & Filter ---
let searchQuery = '';
let filterByTag = '';
let activeNoteId = null;

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

function renderNotes() {
  const grid = document.getElementById("notes-grid");
  if (!notes.length) {
    grid.innerHTML = `<div class="notes-empty"><h3>Belum ada catatan</h3><button class="btn-blue" onclick="document.getElementById('add-note-btn').click()">Buat catatan</button></div>`;
    return;
  }

  const filtered = notes.filter(n => {
    const matchSearch = !searchQuery || (n._searchText || '').includes(searchQuery);
    const matchTag = !filterByTag || (n.label || '').toLowerCase() === filterByTag.toLowerCase();
    return matchSearch && matchTag;
  });

  const sorted = [...filtered].sort((a, b) => (b.pinned - a.pinned) || new Date(b.date) - new Date(a.date));

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

function setupDelegation() {
  const grid = document.getElementById("notes-grid");
  grid.addEventListener('click', async (e) => {
    const card = e.target.closest('.note-card');
    const actionBtn = e.target.closest('.action-btn');
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
      } else if (action === 'delete') {
        if (confirm('Hapus catatan?')) {
          notes = notes.filter(n => n.id !== id);
          await persistNotes();
          if (Gamification) Gamification.recordNoteDeleted({ id, createdAt: note.createdAt });
          renderNotes();
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

  await Storage.ready;
  await loadNotes();
  await renderMoodGraph();
  renderSearchBar();
  renderNotes();
  setupDelegation();
  checkAppVersion();

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
