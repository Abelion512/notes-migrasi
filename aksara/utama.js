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

function prepareNoteForSearch(note) {
  return {
    ...note,
    _searchText: [
      note.title || '',
      note.contentMarkdown || (note.content || '').replace(/<[^>]+>/g, ''),
      note.label || ''
    ].join(' ').toLowerCase()
  };
}

async function loadNotes() {
  try {
    const storedNotes = await Storage.getNotes({ sortByUpdatedAt: false });
    // Sort by sortOrder if available
    const sortedNotes = storedNotes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    notes = sortedNotes.map(prepareNoteForSearch);
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
    <div class="xp-toast-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="var(--primary)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
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
    let prefix = 'Halo 👋';
    if (hour >= 5 && hour < 11) prefix = 'Selamat Pagi 🌅';
    else if (hour >= 11 && hour < 15) prefix = 'Selamat Siang ☀️';
    else if (hour >= 15 && hour < 19) prefix = 'Selamat Sore 🌇';
    else prefix = 'Selamat Malam 🌙';
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
      <div class="mood-emoji">${stored[m.iso] || '<div style="width:24px;height:24px;border:2px solid var(--border-subtle);border-radius:50%"></div>'}</div>
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

let isSelectionMode = false;
let selectedNoteIds = new Set();

let notesRenderLimit = 20;
let currentNotesBatch = [];

function renderFolders() {
  const el = document.getElementById('folder-list');
  if (!el) return;

  const allActive = activeFolderId === 'all' ? ' active' : '';
  let html = `<div class="folder-pill${allActive}" data-id="all">Semua</div>`;

  // Build hierarchy
  const folderMap = {};
  folders.forEach(f => { folderMap[f.id] = { ...f, children: [] }; });
  const roots = [];
  folders.forEach(f => {
    if (f.parentId && folderMap[f.parentId]) {
      folderMap[f.parentId].children.push(folderMap[f.id]);
    } else {
      roots.push(folderMap[f.id]);
    }
  });

  function renderFolderItem(f, level = 0) {
    const active = activeFolderId === f.id ? ' active' : '';
    const indent = level > 0 ? `<span style="opacity: 0.5; margin-right: 4px;">${'↳'.repeat(level)}</span>` : '';
    let itemHtml = `
      <div class="folder-pill${active}" data-id="${f.id}" style="margin-left: ${level * 8}px">
        ${indent}${sanitizeText(f.icon || '📁')} ${sanitizeText(f.name)}
      </div>
    `;
    f.children.forEach(child => {
      itemHtml += renderFolderItem(child, level + 1);
    });
    return itemHtml;
  }

  roots.forEach(root => {
    html += renderFolderItem(root);
  });

  const archivedActive = activeFolderId === 'archived' ? ' active' : '';
  html += `<div class="folder-pill${archivedActive}" data-id="archived">Arsip</div>`;

  const trashActive = activeFolderId === 'trash' ? ' active' : '';
  html += `<div class="folder-pill${trashActive}" data-id="trash">Sampah</div>`;

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
  openFolderModal();
}

function editFolder(folderId) {
  const folder = folders.find(f => f.id === folderId);
  if (folder) openFolderModal(folder);
}

function openFolderModal(existingFolder = null) {
  const modal = document.getElementById('folder-modal');
  if (!modal) return;

  const titleEl = document.getElementById('folder-modal-title');
  const idInput = document.getElementById('folder-id-input');
  const nameInput = document.getElementById('folder-name-input');
  const iconInput = document.getElementById('folder-icon-input');
  const parentSelect = document.getElementById('folder-parent-input');
  const saveBtn = document.getElementById('save-folder-btn');
  const closeBtn = document.getElementById('folder-modal-close');

  titleEl.textContent = existingFolder ? 'Edit Folder' : 'Folder Baru';
  idInput.value = existingFolder ? existingFolder.id : '';
  nameInput.value = existingFolder ? existingFolder.name : '';

  const iconTrigger = document.getElementById('folder-icon-trigger');
  const initialIcon = existingFolder ? existingFolder.icon || '📁' : '📁';
  iconInput.value = initialIcon;
  if (iconTrigger) iconTrigger.textContent = initialIcon;

  if (iconTrigger) {
    iconTrigger.onclick = (e) => {
      e.stopPropagation();
      let pickerContainer = document.getElementById('folder-emoji-picker-container');
      if (pickerContainer) {
        pickerContainer.classList.toggle('hidden');
        return;
      }

      pickerContainer = document.createElement('div');
      pickerContainer.id = 'folder-emoji-picker-container';
      pickerContainer.style = `
        position: absolute; bottom: 100%; right: 0; z-index: 1000;
        background: var(--surface); border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        border: 0.5px solid var(--border-subtle);
        margin-bottom: 8px; overflow: hidden;
      `;

      const picker = document.createElement('emoji-picker');
      if (document.documentElement.getAttribute('data-theme') === 'dark') {
        picker.classList.add('dark');
      }

      pickerContainer.appendChild(picker);
      iconTrigger.parentElement.appendChild(pickerContainer);

      picker.addEventListener('emoji-click', event => {
        const emoji = event.detail.unicode;
        iconTrigger.textContent = emoji;
        iconInput.value = emoji;
        pickerContainer.classList.add('hidden');
      });

      const closePicker = (ev) => {
        if (!pickerContainer.contains(ev.target) && ev.target !== iconTrigger) {
          pickerContainer.classList.add('hidden');
          document.removeEventListener('click', closePicker);
        }
      };
      document.addEventListener('click', closePicker);
    };
  }

  // Populate parent select
  if (parentSelect) {
    parentSelect.innerHTML = '<option value="">(Jadikan Folder Utama)</option>';
    folders.forEach(f => {
      // Prevent selecting itself or its children as parent (basic check: itself)
      if (existingFolder && f.id === existingFolder.id) return;

      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      parentSelect.appendChild(opt);
    });
    parentSelect.value = existingFolder ? (existingFolder.parentId || '') : '';
    if (window.initCustomSelects) window.initCustomSelects();
  }

  const hide = () => {
    if (ModalManager) ModalManager.close('folder-modal');
    else modal.classList.remove('show');
  };

  saveBtn.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) return;

    const parentId = parentSelect ? parentSelect.value || null : null;
    const iso = new Date().toISOString();

    if (existingFolder) {
      existingFolder.name = name;
      existingFolder.icon = iconInput.value.trim() || '📁';
      existingFolder.parentId = parentId;
      existingFolder.updatedAt = iso;
    } else {
      const newFolder = {
        id: generateId('folder'),
        name,
        icon: iconInput.value.trim() || '📁',
        parentId,
        createdAt: iso
      };
      folders.push(newFolder);
    }

    await Storage.setFolders(folders);
    renderFolders();
    hide();
  };

  closeBtn.onclick = hide;
  if (ModalManager) ModalManager.open('folder-modal', modal);
  else modal.classList.add('show');
}

function renderSearchBar() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      searchQuery = sanitizeText(this.value).toLowerCase();
      renderNotes();
    }, 250));
  }
}

function showSkeletons() {
  const grid = document.getElementById("notes-grid");
  if (!grid) return;
  grid.innerHTML = Array(5).fill(0).map(() => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="skeleton" style="height: 17px; width: 60%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 15px; width: 90%;"></div>
      </div>
    </div>
  `).join('');
}

window.handleSwipeAction = async (id, action) => {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  if (action === 'pin') {
    note.pinned = !note.pinned;
    await persistNotes();
  } else if (action === 'archive') {
    note.isArchived = !note.isArchived;
    await persistNotes();
  } else if (action === 'delete') {
    if (confirm(`Pindahkan "${note.title}" ke sampah?`)) {
      await Storage.moveToTrash(id);
      notes = notes.filter(n => n.id !== id);
    }
  }
  renderNotes();
};

let swipeActiveItem = null;

function initSwipeLogic() {
  const grid = document.getElementById("notes-grid");
  if (!grid) return;

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isSwiping = false;
  let activeItem = null;
  let initialTranslateX = 0;

  grid.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.list-item');
    if (!item || isSelectionMode) return;

    // If another item is open, close it
    if (swipeActiveItem && swipeActiveItem !== item) {
      swipeActiveItem.style.transform = '';
      swipeActiveItem = null;
    }

    activeItem = item;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    // Get current transform if any
    const style = window.getComputedStyle(activeItem);
    const matrix = new WebKitCSSMatrix(style.transform);
    initialTranslateX = matrix.m41;

    activeItem.classList.add('swiping');
    isSwiping = false;
  }, { passive: true });

  grid.addEventListener('touchmove', (e) => {
    if (!activeItem) return;

    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;

    // Detect if horizontal swipe or vertical scroll
    if (!isSwiping && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping = true;
    }

    if (isSwiping) {
      currentX = initialTranslateX + deltaX;

      // Limit swipe range
      // Left actions (Pin): Max positive translateX
      // Right actions (Archive/Delete): Max negative translateX
      if (currentX > 80) currentX = 80 + (currentX - 80) * 0.2; // Rubber band effect
      if (currentX < -160) currentX = -160 + (currentX + 160) * 0.2;

      activeItem.style.transform = `translateX(${currentX}px)`;
    }
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    if (!activeItem) return;
    activeItem.classList.remove('swiping');

    if (isSwiping) {
      const threshold = 60;
      if (currentX > threshold) {
        // Snap to open Left (Pin)
        activeItem.style.transform = 'translateX(74px)';
        swipeActiveItem = activeItem;
      } else if (currentX < -threshold) {
        // Snap to open Right (Archive/Delete)
        activeItem.style.transform = 'translateX(-148px)';
        swipeActiveItem = activeItem;
      } else {
        // Snap back
        activeItem.style.transform = '';
        swipeActiveItem = null;
      }
    }

    activeItem = null;
    isSwiping = false;
  });

  // Close swipe on click elsewhere
  document.addEventListener('touchstart', (e) => {
    if (swipeActiveItem && !swipeActiveItem.contains(e.target)) {
      swipeActiveItem.style.transform = '';
      swipeActiveItem = null;
    }
  }, { passive: true });
}

async function renderNotes(append = false) {
  const grid = document.getElementById("notes-grid");
  const header = document.getElementById("notes-list-header");
  if (!grid || !header) return;

  if (!append) {
    grid.innerHTML = '';
    notesRenderLimit = 20;
  }

  if (activeFolderId === 'trash') {
    header.textContent = "Sampah";
    const trash = await Storage.getTrash();
    if (!trash.length) {
      grid.innerHTML = `<div class="notes-empty" style="padding: 40px; text-align: center; color: var(--text-muted);">Sampah kosong</div>`;
      return;
    }
    grid.innerHTML = trash.map(n => `
      <div class="list-item-container" data-id="${n.id}">
        <div class="list-item" data-id="${n.id}" data-type="trash">
          <div class="list-item-content">
            <div class="list-item-title">${sanitizeText(n.title || 'Tanpa Judul')}</div>
            <div class="list-item-subtitle">Dihapus ${formatTanggalRelative(n.deletedAt)}</div>
          </div>
          <div class="list-item-chevron"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></div>
        </div>
      </div>
    `).join('');
    return;
  }

  const folderName = activeFolderId === 'all' ? 'Semua Catatan' : (activeFolderId === 'archived' ? 'Arsip' : (folders.find(f => f.id === activeFolderId)?.name || 'Catatan'));
  header.textContent = folderName;

  const filtered = notes.filter(n => {
    let matchSearch = true;
    if (searchQuery) {
      const words = searchQuery.split(/\s+/).filter(Boolean);
      matchSearch = words.every(word => (n._searchText || '').includes(word));
    }

    if (activeFolderId === 'archived') return n.isArchived && matchSearch;
    if (activeFolderId === 'all') return !n.isArchived && matchSearch;

    return n.folderId === activeFolderId && !n.isArchived && matchSearch;
  });

  if (!filtered.length && !append) {
    grid.innerHTML = `<div class="notes-empty" style="padding: 40px; text-align: center; color: var(--text-muted);">Belum ada catatan</div>`;
    return;
  }

  let sorted = [...filtered].sort((a, b) => (b.pinned - a.pinned) || new Date(b.date) - new Date(a.date));

  const totalNotes = sorted.length;
  const batch = sorted.slice(append ? notesRenderLimit - 20 : 0, notesRenderLimit);

  const batchHtml = batch.map(n => {
    const isSecret = Boolean(n.isSecret);
    const isSelected = selectedNoteIds.has(n.id);
    const summary = n.contentMarkdown ? n.contentMarkdown.slice(0, 60).replace(/\n/g, ' ') : 'Tidak ada konten';

    return `
      <div class="list-item-container" data-id="${n.id}">
        <div class="list-item-actions list-item-actions-left">
          <button class="swipe-action-btn pin" data-action="pin" data-id="${n.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2a10 10 0 0 0 10 10 10 10 0 0 0 10-10z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>${n.pinned ? 'Lepas' : 'Sematkan'}</span>
          </button>
        </div>
        <div class="list-item-actions list-item-actions-right">
          <button class="swipe-action-btn archive" data-action="archive" data-id="${n.id}">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
             <span>Arsip</span>
          </button>
          <button class="swipe-action-btn delete" data-action="delete" data-id="${n.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Hapus</span>
          </button>
        </div>
        <div class="list-item${isSelected ? ' selected' : ''}" data-id="${n.id}" tabindex="0">
          <div class="list-item-content">
            <div class="list-item-title">
              ${n.pinned ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="var(--primary)" style="margin-right:4px; vertical-align:middle"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2a10 10 0 0 0 10 10 10 10 0 0 0 10-10z"></path></svg>' : ''}${isSecret ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="var(--text-muted)" style="margin-right:4px; vertical-align:middle"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' : ''}${n.icon ? n.icon + ' ' : ''}${sanitizeText(n.title || 'Tanpa Judul')}
            </div>
            <div class="list-item-subtitle">
              <span style="color: var(--text-muted); min-width: 80px;">${formatTanggalRelative(n.date)}</span>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.6;">${sanitizeText(isSecret ? 'Konten dirahasiakan' : summary)}</span>
            </div>
          </div>
          <div class="list-item-more" data-action="more">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (append) {
    grid.insertAdjacentHTML('beforeend', batchHtml);
  } else {
    grid.innerHTML = batchHtml;
  }

  // Infinite Scroll Observer
  const existingObserver = document.getElementById('infinite-scroll-trigger');
  if (existingObserver) existingObserver.remove();

  if (notesRenderLimit < totalNotes) {
    const trigger = document.createElement('div');
    trigger.id = 'infinite-scroll-trigger';
    trigger.style.height = '10px';
    grid.appendChild(trigger);

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        notesRenderLimit += 20;
        renderNotes(true);
      }
    }, { rootMargin: '100px' });
    observer.observe(trigger);
  }
}

function toggleSelectionMode(force = null) {
  isSelectionMode = force !== null ? force : !isSelectionMode;
  const btn = document.getElementById('toggle-selection-mode');
  const bar = document.getElementById('selection-bar');

  if (isSelectionMode) {
    btn.textContent = 'Batal';
    bar.classList.remove('hidden');
  } else {
    btn.textContent = 'Pilih';
    bar.classList.add('hidden');
    selectedNoteIds.clear();
    updateSelectionUI();
  }
  renderNotes();
}

function updateSelectionUI() {
  const countEl = document.getElementById('selection-count');
  if (countEl) countEl.textContent = selectedNoteIds.size;
}

function initSortable() {
  const grid = document.getElementById("notes-grid");
  if (!grid || typeof Sortable === 'undefined') return;

  Sortable.create(grid, {
    animation: 150,
    ghostClass: 'list-item--ghost',
    onEnd: async () => {
      const newOrderIds = Array.from(grid.querySelectorAll('.list-item')).map(el => el.dataset.id);

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

  if (!palette || !input || !results) return;

  const commands = [
    { name: 'Tulis Catatan Baru', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>', action: () => openNoteModal('create') },
    { name: 'Buka Pengaturan', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>', action: () => window.location.href = 'lembaran/setelan.html' },
    { name: 'Buka Profil', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', action: () => window.location.href = 'lembaran/biodata.html' },
    { name: 'Lihat Arsip', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>', action: () => { activeFolderId = 'archived'; renderFolders(); renderNotes(); } },
    { name: 'Lihat Sampah', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>', action: () => { activeFolderId = 'trash'; renderFolders(); renderNotes(); } },
    { name: 'Ganti Tema', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>', action: () => {
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
        item.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg> <span>${sanitizeText(n.title)}</span>`;
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

window.ContextMenu = {
  el: null,
  activeTarget: null,
  activeType: null,

  initialized: false,
  init() {
    if (this.initialized) return;
    this.el = document.getElementById('custom-context-menu');
    document.addEventListener('click', (e) => {
      if (this.el && !this.el.contains(e.target)) this.hide();
    });

    this.el.addEventListener('click', (e) => {
      const item = e.target.closest('.context-menu-item');
      if (item) {
        this.handleAction(item.dataset.action);
      }
    });

    window.addEventListener('scroll', () => this.hide(), { passive: true });
    this.initialized = true;
  },

  show(e, type, target) {
    e.preventDefault();
    e.stopPropagation();
    this.activeTarget = target;
    this.activeType = type;

    this.render();

    this.el.style.display = 'flex';

    const { clientX: x, clientY: y } = e;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const menuW = this.el.offsetWidth || 180;
    const menuH = this.el.offsetHeight || 200;

    let posX = x;
    let posY = y;

    if (x + menuW > winW) posX = winW - menuW - 10;
    if (y + menuH > winH) posY = winH - menuH - 10;

    this.el.style.left = `${posX}px`;
    this.el.style.top = `${posY}px`;
  },

  hide() {
    if (this.el) this.el.style.display = 'none';
  },

  async handleAction(action) {
    const id = this.activeTarget.id;
    const note = notes.find(n => n.id === id);

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
      if (confirm(`Pindahkan "${note.title}" ke sampah?`)) {
        await Storage.moveToTrash(id);
        notes = notes.filter(n => n.id !== id);
        renderNotes();
      }
    } else if (action === 'copy') {
      const text = `${note.title}\n\n${markdownFromNote(note)}`;
      navigator.clipboard.writeText(text);
    } else if (action === 'edit') {
      openNoteModal('edit', note);
    } else if (action === 'move') {
      this.showMoveModal(note);
    } else if (action === 'delete-folder') {
      this.handleDeleteFolder(this.activeTarget.id);
    } else if (action === 'edit-folder') {
      editFolder(this.activeTarget.id);
    }
    this.hide();
  },

  async handleDeleteFolder(id) {
    const folder = folders.find(f => f.id === id);
    if (!folder) return;

    if (confirm(`Hapus folder "${folder.name}"? Catatan di dalamnya tidak akan dihapus. Sub-folder akan dipindahkan ke tingkat utama.`)) {
      // Re-assign child folders to root or parent's parent? Let's go with parent of deleted or null.
      const newParentId = folder.parentId || null;

      folders.forEach(f => {
        if (f.parentId === id) f.parentId = newParentId;
      });

      // Filter out the deleted folder
      folders = folders.filter(f => f.id !== id);

      // Update notes that were in this folder
      notes.forEach(n => {
        if (n.folderId === id) n.folderId = null;
      });

      await Storage.setFolders(folders);
      await persistNotes();
      renderFolders();
      renderNotes();
    }
  },

  showMoveModal(note) {
    const modal = document.getElementById('move-note-modal');
    const listEl = document.getElementById('move-note-list');
    const closeBtn = document.getElementById('move-note-close');
    if (!modal || !listEl) return;

    const hide = () => {
      if (ModalManager) ModalManager.close('move-note-modal');
      else modal.classList.remove('show');
    };

    const renderList = () => {
      let html = `
        <div class="context-menu-item" data-id="" style="border: 1px solid var(--border-subtle)">
          <span>📁</span> (Tanpa Folder)
        </div>
      `;

      // Use hierarchy for better UX
      const folderMap = {};
      folders.forEach(f => { folderMap[f.id] = { ...f, children: [] }; });
      const roots = [];
      folders.forEach(f => {
        if (f.parentId && folderMap[f.parentId]) {
          folderMap[f.parentId].children.push(folderMap[f.id]);
        } else {
          roots.push(folderMap[f.id]);
        }
      });

      const addItems = (f, level = 0) => {
        const active = note.folderId === f.id ? ' style="background: var(--primary-soft); border: 1px solid var(--primary)"' : ' style="border: 1px solid var(--border-subtle)"';
        const indent = level > 0 ? '　'.repeat(level) + '↳ ' : '';
        html += `
          <div class="context-menu-item" data-id="${f.id}"${active}>
            <span>📁</span> ${indent}${sanitizeText(f.name)}
          </div>
        `;
        f.children.forEach(child => addItems(child, level + 1));
      };

      roots.forEach(root => addItems(root));
      listEl.innerHTML = html;

      listEl.querySelectorAll('.context-menu-item').forEach(item => {
        item.onclick = async () => {
          note.folderId = item.dataset.id || null;
          await persistNotes();
          renderNotes();
          hide();
        };
      });
    };

    renderList();
    closeBtn.onclick = hide;
    if (ModalManager) ModalManager.open('move-note-modal', modal);
    else modal.classList.add('show');
  },

  render() {
    if (this.activeType === 'note') {
      const id = this.activeTarget.id;
      const note = notes.find(n => n.id === id);
      this.el.innerHTML = `
        <div class="context-menu-item" data-action="edit">Edit Catatan</div>
        <div class="context-menu-item" data-action="move">Pindahkan Folder</div>
        <div class="context-menu-item" data-action="pin">${note.pinned ? 'Lepas Sematan' : 'Sematkan Catatan'}</div>
        <div class="context-menu-item" data-action="star">${note.isFavorite ? 'Hapus Favorit' : 'Jadikan Favorit'}</div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" data-action="archive">${note.isArchived ? 'Buka Arsip' : 'Arsipkan'}</div>
        <div class="context-menu-item" data-action="copy">Salin Teks</div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item danger" data-action="delete">Hapus</div>
      `;
    } else if (this.activeType === 'folder') {
       this.el.innerHTML = `
         <div class="context-menu-item" data-action="edit-folder">Edit Folder</div>
         <div class="context-menu-item danger" data-action="delete-folder">Hapus Folder</div>
       `;
    }
  }
};

function setupDelegation() {
  const grid = document.getElementById("notes-grid");
  const folderList = document.getElementById("folder-list");

  if (window.ContextMenu) window.ContextMenu.init();

  folderList.addEventListener('contextmenu', (e) => {
    const pill = e.target.closest('.folder-pill');
    if (!pill || pill.dataset.id === 'all' || pill.dataset.id === 'archived' || pill.dataset.id === 'trash') return;
    window.ContextMenu.show(e, 'folder', { id: pill.dataset.id });
  });

  // Delegate Swipe Actions
  grid.addEventListener('click', (e) => {
    const swipeBtn = e.target.closest('.swipe-action-btn');
    if (swipeBtn) {
      e.stopPropagation();
      const id = swipeBtn.dataset.id;
      const action = swipeBtn.dataset.action;
      window.handleSwipeAction(id, action);
    }
  });

  // Long press for mobile context menu
  let pressTimer;
  grid.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.list-item');
    if (!item) return;
    pressTimer = setTimeout(() => {
      window.ContextMenu.show(e, 'note', { id: item.dataset.id });
    }, 600);
  });
  grid.addEventListener('touchend', () => clearTimeout(pressTimer));

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
    const card = e.target.closest('.list-item');
    if (!card) return;
    window.ContextMenu.show(e, 'note', { id: card.dataset.id });
  });

  grid.addEventListener('click', async (e) => {
    const card = e.target.closest('.list-item');
    const actionBtn = e.target.closest('.action-btn');
    const moreBtn = e.target.closest('.list-item-more');
    const wikiLink = e.target.closest('.wiki-link');

    if (moreBtn && !isSelectionMode) {
      e.stopPropagation();
      const id = card.dataset.id;
      window.ContextMenu.show(e, 'note', { id });
      return;
    }

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

    if (isSelectionMode) {
      if (selectedNoteIds.has(id)) {
        selectedNoteIds.delete(id);
      } else {
        selectedNoteIds.add(id);
      }
      updateSelectionUI();
      renderNotes();
      return;
    }

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
           await Storage.deleteFromTrash(id);
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
    draftKey: existingNote ? existingNote.id : 'new',
    initialValue: {
      icon: existingNote?.icon || '',
      title: existingNote?.title || '',
      content: markdownFromNote(existingNote),
      isSecret: existingNote?.isSecret || false,
      folderId: existingNote?.folderId || ''
    },
    onSave: async (payload) => {
      const iso = new Date().toISOString();
      if (mode === 'edit' && existingNote) {
        Object.assign(existingNote, prepareNoteForSearch({
          ...existingNote,
          icon: payload.icon,
          title: payload.title,
          content: payload.contentHtml,
          contentMarkdown: payload.contentMarkdown,
          isSecret: payload.isSecret,
          updatedAt: iso,
          _dirty: true
        }));
        if (Gamification) {
          const oldLen = (existingNote.contentMarkdown || existingNote.content || '').length;
          const newLen = (payload.contentMarkdown || payload.contentHtml || '').length;
          const charDiff = Math.abs(newLen - oldLen);
          Gamification.recordNoteUpdated({ id: existingNote.id, updatedAt: iso, charDiff });
          if (payload.isSecret) Gamification.recordSecretNoteUsed();
        }
      } else {
        const id = generateId('note');
        const newNote = prepareNoteForSearch({
          id,
          ...payload,
          content: payload.contentHtml,
          date: iso.slice(0, 10),
          createdAt: iso,
          pinned: false,
          _dirty: true
        });
        notes.unshift(newNote);
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

async function handleSmartExport() {
  const format = document.getElementById('smart-export-format').value;
  const merge = document.getElementById('export-merge-check').checked;
  const selectedNotes = notes.filter(n => selectedNoteIds.has(n.id));
  const dateStr = new Date().toISOString().split('T')[0];

  if (selectedNotes.length === 0) return;

  try {
    if (format === 'json') {
      const data = JSON.stringify({ version: '3.0', exportedAt: new Date().toISOString(), notes: selectedNotes }, null, 2);
      downloadBlob(new Blob([data], { type: 'application/json' }), `abelion-selected-${dateStr}.json`);
    }
    else if (format === 'md' || format === 'txt') {
      const ext = format === 'md' ? '.md' : '.txt';
      if (merge) {
        let combined = '';
        selectedNotes.forEach(n => {
          combined += format === 'md'
            ? `\n\n# ${n.title}\n*Tanggal: ${n.date}*\n\n${n.contentMarkdown || n.content}\n\n---\n`
            : `\n\n${n.title.toUpperCase()}\n${n.date}\n${'-'.repeat(n.title.length)}\n\n${n.contentMarkdown || (n.content || '').replace(/<[^>]+>/g, '')}\n\n====================\n`;
        });
        downloadBlob(new Blob([combined], { type: format === 'md' ? 'text/markdown' : 'text/plain' }), `abelion-merged-${dateStr}${ext}`);
      } else {
        if (typeof JSZip === 'undefined') throw new Error('JSZip tidak termuat. Periksa koneksi internet.');
        const zip = new JSZip();
        selectedNotes.forEach(n => {
          const filename = (n.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-') + ext;
          const body = format === 'md'
            ? `---\ntitle: ${n.title}\ndate: ${n.date}\n---\n\n${n.contentMarkdown || n.content}`
            : `${n.title}\n${n.date}\n\n${n.contentMarkdown || (n.content || '').replace(/<[^>]+>/g, '')}`;
          zip.file(filename, body);
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(blob, `abelion-selected-${dateStr}.zip`);
      }
    }
    else if (format === 'pdf') {
      if (typeof jspdf === 'undefined') throw new Error('jspdf tidak termuat.');
      const doc = new jspdf.jsPDF({
        unit: 'mm',
        format: 'a4'
      });

      selectedNotes.forEach((n, i) => {
        if (i > 0) doc.addPage();

        // Minimalist Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(0, 122, 255); // iOS Blue
        doc.text(n.title || 'Tanpa Judul', 20, 30);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(142, 142, 147); // iOS Gray
        doc.text(formatTanggal(n.date), 20, 38);

        // Divider
        doc.setDrawColor(230, 230, 235);
        doc.line(20, 45, 190, 45);

        // Content
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const content = n.contentMarkdown || (n.content || '').replace(/<[^>]+>/g, '');
        const splitContent = doc.splitTextToSize(content, 170);

        let y = 55;
        splitContent.forEach(line => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 20, y);
          y += 7;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text('Dibuat dengan Lembaga Arsip Digital Abelion', 20, 287);
      });
      doc.save(`abelion-selected-${dateStr}.pdf`);
    }
    else if (format === 'docx') {
      if (typeof docx === 'undefined') throw new Error('docx library tidak termuat.');
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
      const sections = selectedNotes.map(n => ({
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
      downloadBlob(blob, `abelion-selected-${dateStr}.docx`);
    }

    toggleSelectionMode(false);
    ModalManager.close('export-modal');
  } catch (err) {
    alert('Ekspor gagal: ' + err.message);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

window.addEventListener('DOMContentLoaded', async () => {
  const addBtnNav = document.getElementById('add-note-btn-nav');
  if (addBtnNav) {
    addBtnNav.onclick = (e) => {
      e.preventDefault();
      openNoteModal('create');
    };
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

  showSkeletons();
  await Storage.ready;

  if (Gamification) {
    Gamification.trackDailyLogin().then(res => {
      if (res && res.xp > 0) {
        showXPToast({ xp: res.xp, message: 'Login harian', streak: res.streak, bonus: res.bonus });
      }
    }).catch(console.error);
  }

  await loadFolders();
  await loadNotes();
  if (Storage.purgeOldTrash) Storage.purgeOldTrash(30).catch(console.error);
  await renderMoodGraph();
  renderHeroContent();
  renderSearchBar();
  renderNotes();
  setupDelegation();
  initSwipeLogic();
  initSortable();
  initCommandPalette();
  checkAppVersion();

  // Handle URL actions (e.g., ?action=new)
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'new') {
    // Small delay to ensure everything is ready
    setTimeout(() => openNoteModal('create'), 500);
    // Clear the param without refreshing to avoid re-opening on manual refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const addFolderBtn = document.getElementById('add-folder-btn');
  if (addFolderBtn) addFolderBtn.onclick = addFolder;

  const toggleSelectBtn = document.getElementById('toggle-selection-mode');
  if (toggleSelectBtn) toggleSelectBtn.onclick = () => toggleSelectionMode();

  const cancelSelectBtn = document.getElementById('cancel-selection-btn');
  if (cancelSelectBtn) cancelSelectBtn.onclick = () => toggleSelectionMode(false);

  const exportSelectedBtn = document.getElementById('export-selected-btn');
  if (exportSelectedBtn) {
    exportSelectedBtn.onclick = () => {
      if (selectedNoteIds.size === 0) return;
      ModalManager.open('export-modal', document.getElementById('export-modal'));
    };
  }

  const exportModalClose = document.getElementById('export-modal-close');
  if (exportModalClose) exportModalClose.onclick = () => ModalManager.close('export-modal');

  const confirmExportBtn = document.getElementById('confirm-smart-export');
  if (confirmExportBtn) confirmExportBtn.onclick = handleSmartExport;

  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  if (deleteSelectedBtn) {
    deleteSelectedBtn.onclick = async () => {
      if (selectedNoteIds.size === 0) return;
      if (confirm(`Pindahkan ${selectedNoteIds.size} catatan ke sampah?`)) {
        for (const id of selectedNoteIds) {
          await Storage.moveToTrash(id);
          notes = notes.filter(n => n.id !== id);
        }
        toggleSelectionMode(false);
        renderNotes();
      }
    };
  }

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
