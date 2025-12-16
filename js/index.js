const {
  STORAGE_KEYS,
  sanitizeText,
  sanitizeRichContent,
  formatTanggal,
  formatTanggalRelative,
  debounce,
  awardXP
} = AbelionUtils;

const Gamification = window.AbelionGamification || null;
const Storage = window.AbelionStorage;

const NoteEditor = window.NoteEditorModal;
const ModalManager = AbelionUtils.ModalManager;

// Global Error Handling
window.onerror = function (message, source, lineno, colno, error) {
  console.error('Global Error:', { message, source, lineno, colno, error });
  // Ignore resize observation errors usage
  if (message && message.includes('ResizeObserver')) return;
  alert('Maaf, terjadi kesalahan: ' + message);
};
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Don't alert on unhandled rejections to avoid spam, just log
});

// --- Live time pojok kanan atas ---
function updateTime() {
  // Optimization: Don't update DOM if tab is hidden
  if (document.hidden) return;

  const el = document.getElementById('top-time');
  if (!el) return;
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// Check every second, but updateTime internal check will skip render if hidden
const timeInterval = setInterval(updateTime, 1000);
updateTime();

// --- Network Status & Quota ---
window.addEventListener('load', async () => {
  if (AbelionUtils && AbelionUtils.checkStorageQuota) {
    const status = await AbelionUtils.checkStorageQuota();
    if (status === 'critical') {
      alert('Peringatan: Penyimpanan browser hampir penuh. Harap cadangkan data Anda.');
    }
  }
});

function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  const statusEl = document.getElementById('network-status'); // Assume we might add this
  if (!isOnline) {
    document.body.classList.add('offline-mode');
    // Create element if not exists
    let offlineBadge = document.getElementById('offline-badge');
    if (!offlineBadge) {
      offlineBadge = document.createElement('div');
      offlineBadge.id = 'offline-badge';
      offlineBadge.className = 'offline-badge';
      offlineBadge.textContent = 'Offline';
      document.body.appendChild(offlineBadge);
    }
  } else {
    document.body.classList.remove('offline-mode');
    const offlineBadge = document.getElementById('offline-badge');
    if (offlineBadge) offlineBadge.remove();
  }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// --- Notes: Storage Abstraction
// --- Notes: Storage Abstraction
// --- Version Check & Changelog ---
async function checkAppVersion() {
  const currentMeta = AbelionUtils.getVersionMeta();
  const storedVersion = localStorage.getItem('abelion-last-version');

  // Update UI version badge if exists
  const versionBadge = document.querySelector('.nav-button[aria-label="Versi"] .nav-label');
  if (versionBadge) versionBadge.textContent = 'v' + currentMeta.version;

  if (storedVersion !== currentMeta.version) {
    // Show changelog
    showChangelog(currentMeta.version);
    localStorage.setItem('abelion-last-version', currentMeta.version);
  }
}

function showChangelog(version) {
  const modal = document.getElementById('changelog-modal');
  const verEl = document.getElementById('changelog-version');
  const listEl = document.getElementById('changelog-list');
  const logs = AbelionUtils.getVersionChangelog();

  // Get latest log
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
      li.style.color = 'var(--text-primary)';
      li.style.lineHeight = '1.5';
      ul.appendChild(li);
    });
    listEl.appendChild(ul);

    // Open modal
    if (ModalManager) {
      ModalManager.open('changelog-modal', modal);
    } else {
      modal.classList.add('show');
    }
  }
}

// Bind changelog events
const changelogClose = document.getElementById('changelog-close');
const changelogAck = document.getElementById('changelog-ack');
const changelogModal = document.getElementById('changelog-modal');

[changelogClose, changelogAck].forEach(el => {
  if (el) el.onclick = () => {
    if (ModalManager) ModalManager.close('changelog-modal');
    else changelogModal && changelogModal.classList.remove('show');
  };
});

let notes = [];
let notesLoaded = false;

let loadNotesPromise = null;

async function loadNotes() {
  if (loadNotesPromise) return loadNotesPromise;

  loadNotesPromise = (async () => {
    try {
      const storedNotes = await Storage.getNotes({ sortByUpdatedAt: true });

      // Build search index
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
    } finally {
      loadNotesPromise = null;
    }
  })();

  return loadNotesPromise;
}
async function ensureNotesLoaded() {
  if (!notesLoaded) await loadNotes();
  return notes;
}

function noteDraftKey(id = 'new') {
  return `note-${id}`;
}

function generateNoteId() {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  }
  // Fallback for very old browsers (Math.random + High Res Time)
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const perf = (performance && performance.now) ? performance.now().toString(36).replace('.', '') : '';
  return `uid-${timestamp}-${randomPart}-${perf}`;
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

function ensureNoteHtml(note) {
  if (!note) return '';
  const html = note.content || '';
  if (html && html.trim()) return html;
  const markdown = markdownFromNote(note);
  const rendered = renderMarkdown(markdown);
  note.content = rendered;
  note.contentMarkdown = markdown;
  return rendered;
}

function isTypingContext(event) {
  const target = event?.target || document.activeElement;
  if (!target) return false;
  return target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.isContentEditable
    || !!target.closest('.note-editor-modal');
}

function setActiveNote(id) {
  activeNoteId = id;
  document.querySelectorAll('.note-card').forEach(card => {
    const isActive = card.getAttribute('data-id') === id;
    card.classList.toggle('note-card--active', isActive);
  });
}

function showXPToast({ xp, message, streak, bonus }) {
  if (!xp) return;
  const toast = document.createElement('div');
  toast.className = 'xp-toast';

  const icon = document.createElement('div');
  icon.className = 'xp-toast-icon';
  icon.textContent = '⭐';

  const content = document.createElement('div');
  content.className = 'xp-toast-content';

  const title = document.createElement('strong');
  title.textContent = `+${xp} XP`;

  const messageEl = document.createElement('span');
  messageEl.textContent = message || '';

  content.append(title, messageEl);

  const bonusValue = Number(bonus) || 0;
  if (bonusValue > 0) {
    const bonusEl = document.createElement('small');
    const streakLabel = streak > 1 ? ` • ${streak} hari berturut-turut` : '';
    bonusEl.textContent = `🔥 Bonus streak +${bonusValue} XP${streakLabel}`;
    content.appendChild(bonusEl);
  } else if (streak > 1) {
    const streakEl = document.createElement('small');
    streakEl.textContent = `🔥 ${streak} hari berturut-turut!`;
    content.appendChild(streakEl);
  }

  toast.append(icon, content);
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

if (Gamification) {
  (async () => {
    try {
      const loginResult = await Gamification.trackDailyLogin();
      if (loginResult && loginResult.xp > 0) {
        const baseMessage = `Login harian: +${loginResult.xp} XP`;
        showXPToast({
          xp: loginResult.xp,
          message: baseMessage,
          streak: loginResult.streak || 0,
          bonus: loginResult.bonus || 0
        });
      }
    } catch (error) {
      console.error('Failed to track daily login:', error);
    }
  })();
}

async function persistNotes() {
  await Storage.setNotes(notes);
}

// --- Mood Graph harian (centered) ---
async function loadMoods() {
  return Storage.getValue(STORAGE_KEYS.MOODS, {});
}

async function saveMoods(data) {
  await Storage.setValue(STORAGE_KEYS.MOODS, data);
}

function getPastSevenDays() {
  const days = [];
  const formatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const iso = date.toISOString().split('T')[0];
    days.push({ iso, label: formatter.format(date).replace(/\.$/, '') });
  }
  return days;
}

async function renderMoodGraph() {
  const el = document.getElementById('mood-graph');
  if (!el) return;
  const stored = await loadMoods();
  const fallback = ['😄', '🙂', '😐', '😊', '😢', '😐', '😴'];
  const items = getPastSevenDays().map((day, idx) => ({
    emoji: stored?.[day.iso] || fallback[idx % fallback.length],
    day: day.label
  }));
  el.innerHTML = items.map(m => `
    <div class="mood-bar">
      <div class="mood-emoji">${m.emoji}</div>
      <div class="mood-date">${m.day}</div>
    </div>
  `).join('');
}

// --- Search Functionality ---
let searchQuery = '';
let filterByTag = '';
let activeNoteId = null;
function renderSearchBar() {
  let searchDiv = document.getElementById('search-bar');
  if (!searchDiv) {
    searchDiv = document.createElement('div');
    searchDiv.id = 'search-bar';
    searchDiv.innerHTML = `
      <input id="search-input" class="search-input" type="text" placeholder="Cari catatan..." autocomplete="off"/>
    `;
    const notesGrid = document.getElementById('notes-grid');
    notesGrid.parentNode.insertBefore(searchDiv, notesGrid);
    const handleSearch = debounce(function () {
      const normalized = sanitizeText(this.value || '').trim().toLowerCase();
      searchQuery = normalized;
      renderNotes();
    }, 250);
    document.getElementById('search-input').addEventListener('input', handleSearch);
  }
}

// --- Notes Card (klik ke note.html?id=..., pin/delete interaktif, search) ---
function renderTagCloud() {
  const tags = new Set();
  notes.forEach(note => {
    if (note.label) tags.add(note.label);
  });

  let tagCloud = document.getElementById('tag-cloud');
  if (!tags.size) {
    if (filterByTag) filterByTag = '';
    if (tagCloud) tagCloud.remove();
    return;
  }

  const searchBar = document.getElementById('search-bar');
  if (!searchBar) return;

  if (!tagCloud) {
    tagCloud = document.createElement('div');
    tagCloud.id = 'tag-cloud';
    tagCloud.className = 'tag-cloud';
    searchBar.parentNode.insertBefore(tagCloud, searchBar.nextSibling);
  }

  const normalizedFilter = (filterByTag || '').toLowerCase();
  const tagButtons = Array.from(tags).map(tag => {
    const safeTag = sanitizeText(tag);
    const isActive = normalizedFilter && safeTag.toLowerCase() === normalizedFilter;
    return `<button class="tag-filter${isActive ? ' tag-filter--active' : ''}" data-tag="${safeTag}">${safeTag}</button>`;
  }).join('');

  tagCloud.innerHTML = `
    <div class="tag-cloud-title">Filter by tag:</div>
    <div class="tag-cloud-items">
      <button class="tag-filter${normalizedFilter ? '' : ' tag-filter--active'}" data-tag="">Semua</button>
      ${tagButtons}
    </div>
  `;

  tagCloud.querySelectorAll('.tag-filter').forEach(btn => {
    btn.onclick = function () {
      filterByTag = sanitizeText(this.dataset.tag || '');
      tagCloud.querySelectorAll('.tag-filter').forEach(b => b.classList.remove('tag-filter--active'));
      this.classList.add('tag-filter--active');
      renderNotes();
    };
  });
}

function renderNotes() {
  let grid = document.getElementById("notes-grid");
  renderTagCloud();
  if (!notes.length) {
    grid.innerHTML = `
      <div class="notes-empty">
        <div class="notes-empty-emoji">📝</div>
        <h3>Belum ada catatan</h3>
        <p>Mulai catat ide, goals, atau apa saja yang ingin kamu ingat!</p>
        <button class="btn-blue" type="button" onclick="document.getElementById('add-note-btn').click()">Buat catatan pertama</button>
      </div>
    `;
    return;
  }
  const normalizedFilter = (filterByTag || '').toLowerCase();
  let filtered = notes.filter(n => {
    if (!searchQuery) return true;

    // Use pre-computed search text
    const searchMatch = (n._searchText || '').includes(searchQuery);
    if (!searchMatch) return false;

    if (!normalizedFilter) return true;
    const labelText = sanitizeText(n.label || '').toLowerCase();
    return labelText === normalizedFilter;
  });
  let sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  if (!sorted.length) {
    grid.innerHTML = `<div style="color:#aaa;text-align:center;margin:38px auto 0 auto;font-size:1.1em;">Catatan tidak ditemukan.</div>`;
    return;
  }
  const hasActive = sorted.some(n => n.id === activeNoteId);
  if ((!activeNoteId || !hasActive) && sorted[0]) {
    activeNoteId = sorted[0].id;
  }

  grid.innerHTML = sorted.map(n => {
    const safeTitle = sanitizeText(n.title || '');
    const safeIcon = sanitizeText(n.icon || '').slice(0, 2);
    const label = sanitizeText(n.label || '');
    const content = renderMarkdown(n.contentMarkdown || markdownFromNote(n));
    const dateLabel = formatTanggalRelative(n.date || '') || '';
    const isActive = activeNoteId === n.id;
    return `
    <div class="note-card${isActive ? ' note-card--active' : ''}" data-id="${n.id}" tabindex="0" role="link">
      <div class="note-actions">
        <button class="action-btn pin${n.pinned ? ' pin-active' : ''}" data-action="pin" title="Pin/Unpin" aria-label="Pin/Unpin catatan">
          <span class="pin-inner">${n.pinned ? '📌' : '📍'}</span>
        </button>
        <button class="action-btn delete" data-action="delete" title="Hapus" aria-label="Hapus catatan">
          <span class="delete-inner">🗑️</span>
        </button>
      </div>
      <div class="note-title">
        ${safeIcon ? `<span class="icon">${safeIcon}</span>` : ""}${safeTitle}
      </div>
      ${label ? `<div class="note-label">${label}</div>` : ''}
      <div class="note-content">${content}</div>
      <div class="note-date">${dateLabel ? `Ditulis: ${dateLabel}` : ''}</div>
    </div>
  `;
  }).join("");

  // Interaktif event
  // Listeners removed in favor of delegation
}

let delegationSetup = false;

function setupNotesDelegation() {
  if (delegationSetup) return;
  delegationSetup = true;

  const grid = document.getElementById("notes-grid");
  if (!grid) return;

  grid.addEventListener('click', async (e) => {
    const actionBtn = e.target.closest('.action-btn');
    const card = e.target.closest('.note-card');

    // Handle Action Buttons (Pin/Delete)
    if (actionBtn && card) {
      e.preventDefault();
      e.stopPropagation();
      const id = card.getAttribute('data-id');
      const idx = notes.findIndex(n => n.id === id);
      if (idx < 0) return;
      const note = notes[idx];

      if (actionBtn.dataset.action === "pin") {
        note.pinned = !note.pinned;
        await persistNotes();
        const pinInner = actionBtn.querySelector('.pin-inner');
        if (pinInner) {
          pinInner.animate([
            { transform: 'scale(1.2)' }, { transform: 'scale(1)' }
          ], { duration: 200 });
        }
      } else if (actionBtn.dataset.action === "delete") {
        if (confirm('Hapus catatan ini?')) {
          const deletedAt = new Date().toISOString();
          const createdAt = note.createdAt || note.date;
          notes.splice(idx, 1);
          if (NoteEditor) NoteEditor.clearDraft(noteDraftKey(id));
          await persistNotes();
          if (Gamification) {
            Gamification.recordNoteDeleted({
              id,
              createdAt,
              deletedAt
            });
          }
        }
      }
      renderNotes();
      return;
    }

    // Handle Card Click (Open)
    if (card) {
      const id = card.getAttribute('data-id');
      const note = notes.find(n => n.id === id);
      if (note) {
        setActiveNote(id);
        openNoteModal('edit', note);
      }
    }
  });

  grid.addEventListener('keydown', (e) => {
    const card = e.target.closest('.note-card');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      const id = card.getAttribute('data-id');
      const note = notes.find(n => n.id === id);
      if (note) {
        setActiveNote(id);
        openNoteModal('edit', note);
      }
    }
  });

  grid.addEventListener('focusin', (e) => {
    const card = e.target.closest('.note-card');
    if (card) setActiveNote(card.getAttribute('data-id'));
  });
}

async function togglePinForActiveNote() {
  if (!activeNoteId) return;
  const note = notes.find(n => n.id === activeNoteId);
  if (!note) return;
  note.pinned = !note.pinned;
  await persistNotes();
  renderNotes();
}

document.addEventListener('keydown', (event) => {
  const modifier = event.metaKey || event.ctrlKey;
  if (!modifier) return;
  const key = event.key.toLowerCase();
  if (isTypingContext(event)) return;
  if (key === 'k') {
    event.preventDefault();
    renderSearchBar();
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  } else if (key === 'n') {
    event.preventDefault();
    openNoteModal('create', null);
  } else if (key === 'p') {
    event.preventDefault();
    togglePinForActiveNote();
  }
});

// --- About Modal (nav About) ---
const aboutModal = document.getElementById("about-modal");
const aboutTrigger = document.getElementById("nav-about");
const aboutClose = document.getElementById("about-close");
const navHome = document.getElementById("nav-home");

if (aboutTrigger && aboutModal) {
  aboutTrigger.onclick = function (e) {
    e.preventDefault();
    aboutModal.classList.add("show");

    // Integrate with ModalManager
    if (ModalManager) {
      // Create a dummy ID for about modal
      const closeFn = ModalManager.open('about-modal', aboutModal);

      // Override default close behavior to sync with manager
      const originalRemove = aboutModal.classList.remove;
      aboutModal.classList.remove = function (...args) {
        if (args.includes('show')) closeFn();
        originalRemove.apply(this, args);
      };
    }
  };
}

if (aboutClose && aboutModal) {
  aboutClose.onclick = function () {
    aboutModal.classList.remove("show");
  };
}

if (navHome && aboutModal) {
  navHome.onclick = function (e) {
    e.preventDefault();
    aboutModal.classList.remove("show");
  };
}

window.onclick = function (e) {
  if (aboutModal && e.target === aboutModal) aboutModal.classList.remove("show");
};
// Di index.js
async function showMiniProfile() {
  await Storage.ready;
  let data = {};
  try {
    data = await Storage.getValue(STORAGE_KEYS.PROFILE, {});
  } catch (error) {
    if (error?.code !== 'STORAGE_LOCKED') console.error(error);
  }
  const avatar = document.getElementById('profile-mini-avatar');
  const name = document.getElementById('profile-mini-name');
  if (avatar) avatar.src = data?.photo || 'default-avatar.svg';
  if (name) name.textContent = data?.name ? sanitizeText(data.name) : 'Profile';
}
window.addEventListener('DOMContentLoaded', showMiniProfile);
window.addEventListener('storage', () => {
  showMiniProfile();
  loadNotes().then(() => {
    renderSearchBar();
    renderNotes();
  });
});

let lastScrollY = window.scrollY;
window.addEventListener('scroll', debounce(() => {
  const nav = document.querySelector('.nav-bottom');
  if (!nav) return;
  if (window.scrollY < lastScrollY) {
    nav.classList.add('show-on-scroll');
  } else {
    nav.classList.remove('show-on-scroll');
  }
  lastScrollY = window.scrollY;
}, 100));
// --- Modal editor catatan ---
function openNoteModal(mode = 'create', existingNote = null) {
  if (!NoteEditor) return;
  const draftKey = noteDraftKey(existingNote?.id || 'new');
  NoteEditor.open({
    mode,
    draftKey,
    initialValue: {
      icon: existingNote?.icon || '',
      title: existingNote?.title || '',
      content: markdownFromNote(existingNote)
    },
    onSave: async (payload) => {
      const now = new Date();
      const isoDate = now.toISOString();
      if (mode === 'edit' && existingNote) {
        existingNote.icon = payload.icon;
        existingNote.title = payload.title;
        existingNote.content = payload.contentHtml;
        existingNote.contentMarkdown = payload.contentMarkdown;
        existingNote.updatedAt = isoDate;
        existingNote.date = existingNote.date || isoDate.slice(0, 10);
        await persistNotes();
        if (Gamification && existingNote.id) {
          const oldContentLen = (existingNote.contentMarkdown || existingNote.content || '').length;
          const newContentLen = (payload.contentMarkdown || payload.contentHtml || '').length;
          const charDiff = Math.abs(newContentLen - oldContentLen);

          Gamification.recordNoteUpdated({
            id: existingNote.id,
            updatedAt: isoDate,
            createdAt: existingNote.createdAt || existingNote.date,
            charDiff: charDiff
          });
        }
        renderNotes();
        return;
      }

      const id = generateNoteId();
      const newNote = {
        id,
        icon: payload.icon,
        title: payload.title,
        content: payload.contentHtml,
        contentMarkdown: payload.contentMarkdown,
        date: isoDate.slice(0, 10),
        createdAt: isoDate,
        pinned: false
      };
      notes.unshift(newNote);
      await persistNotes();
      if (Gamification) {
        Gamification.recordNoteCreated({ id, createdAt: isoDate });
      }
      renderNotes();
    }
  });
}

document.getElementById('add-note-btn').onclick = function () {
  openNoteModal('create', null);
};

// --- Mood selector ---
function openMoodSelector() {
  const modalId = 'mood-modal';
  if (document.getElementById(modalId)) return;
  const moods = ['😄', '🙂', '😐', '😢', '😠', '😴'];
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'mood-modal';
  modal.innerHTML = `
    <div class="mood-modal-content" role="dialog" aria-modal="true" aria-labelledby="mood-modal-title">
      <h3 id="mood-modal-title">Bagaimana mood kamu hari ini?</h3>
      <div class="mood-modal-options">
        ${moods.map(emoji => `<button type="button" class="mood-option" data-emoji="${emoji}">${emoji}</button>`).join('')}
      </div>
      <button type="button" class="mood-modal-close" id="mood-modal-close">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);

  let closeFn = () => { };
  if (ModalManager) {
    closeFn = ModalManager.open(modalId, modal);
  } else {
    document.body.classList.add('modal-open');
  }

  const safeClose = () => {
    if (ModalManager) closeFn();
    else document.body.classList.remove('modal-open');
    modal.remove();
  };

  modal.addEventListener('click', (event) => {
    if (event.target.id === 'mood-modal-close' || event.target === modal) {
      safeClose();
    }
  });
  modal.querySelectorAll('.mood-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      await saveTodayMood(btn.dataset.emoji);
      safeClose();
    });
  });
}

async function saveTodayMood(emoji) {
  try {
    const data = await loadMoods();
    const today = new Date().toISOString().split('T')[0];
    data[today] = emoji;

    const success = await saveMoods(data);
    if (!success) throw new Error('Failed to save mood');

    await renderMoodGraph();

    // Optional: Show success feedback if you implement toasts
    // showToast('Mood tersimpan!', 'success');
  } catch (error) {
    console.error('Save mood error:', error);
    alert('Gagal menyimpan mood. Coba lagi.');
  }
}

const updateMoodBtn = document.getElementById('update-mood-btn');
if (updateMoodBtn) {
  updateMoodBtn.addEventListener('click', openMoodSelector);
}
// --- Entrance: skip animasi jika dari note.html (back) ---
window.addEventListener('DOMContentLoaded', async () => {
  await Storage.ready;
  await loadNotes();
  await checkAppVersion(); // Check version on load
  await renderMoodGraph();

  renderSearchBar(); setupNotesDelegation(); renderNotes();
  if (sessionStorage.getItem('skipIntro')) {
    document.getElementById('intro-anim').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    document.querySelector('.title-abelion').classList.add('animated');
    sessionStorage.removeItem('skipIntro');
    return;
  }
  // --- Animasi Intro 0-100% slow, fade out ---
  let p = 0;
  const pt = document.getElementById('progress-text');
  const intro = document.getElementById('intro-anim');
  const main = document.getElementById('main-content');
  let interval = setInterval(() => {
    p = Math.min(100, p + Math.floor(Math.random() * 7 + 1));
    pt.textContent = p + "%";
    if (p >= 100) {
      clearInterval(interval);
      intro.style.opacity = 0;
      setTimeout(() => {
        intro.style.display = "none";
        main.classList.remove('hidden');
        setTimeout(() => document.querySelector('.title-abelion').classList.add('animated'), 100);
      }, 1300);
    }
  }, 40);
});
