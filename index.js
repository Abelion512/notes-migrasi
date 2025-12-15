const {
  STORAGE_KEYS,
  sanitizeText,
  sanitizeRichContent,
  safeGetItem,
  safeSetItem,
  formatTanggal,
  formatTanggalRelative,
  debounce,
  awardXP
} = AbelionUtils;

const Gamification = window.AbelionGamification || null;

// --- Live time pojok kanan atas ---
function updateTime() {
  const el = document.getElementById('top-time');
  if (!el) return;
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
setInterval(updateTime, 1000);
updateTime();

// --- Notes: localStorage
const notes = [];

function loadNotes() {
  const storedNotes = safeGetItem(STORAGE_KEYS.NOTES, []);
  notes.splice(0, notes.length, ...storedNotes);
  return notes;
}

loadNotes();

function showXPToast({ xp, message, streak }) {
  if (!xp) return;
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.innerHTML = `
    <div class="xp-toast-icon">⭐</div>
    <div class="xp-toast-content">
      <strong>+${xp} XP</strong>
      <span>${message}</span>
      ${streak > 1 ? `<small>🔥 ${streak} hari berturut-turut!</small>` : ''}
    </div>
  `;
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
  const loginResult = Gamification.trackDailyLogin();
  if (loginResult && loginResult.xp > 0) {
    const bonusMessage = loginResult.bonus > 0
      ? `🎉 Streak bonus! +${loginResult.bonus} XP`
      : `+${loginResult.xp} XP dari login harian`;
    showXPToast({
      xp: loginResult.xp,
      message: bonusMessage,
      streak: loginResult.streak || 0
    });
  }
}

function persistNotes() {
  safeSetItem(STORAGE_KEYS.NOTES, notes);
}

// --- Mood Graph harian (centered) ---
function loadMoods() {
  return safeGetItem(STORAGE_KEYS.MOODS, {});
}

function saveMoods(data) {
  safeSetItem(STORAGE_KEYS.MOODS, data);
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

function renderMoodGraph() {
  const el = document.getElementById('mood-graph');
  if (!el) return;
  const stored = loadMoods();
  const fallback = ['😄','🙂','😐','😊','😢','😐','😴'];
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
function renderSearchBar() {
  let searchDiv = document.getElementById('search-bar');
  if(!searchDiv) {
    searchDiv = document.createElement('div');
    searchDiv.id = 'search-bar';
    searchDiv.innerHTML = `
      <input id="search-input" class="search-input" type="text" placeholder="Cari catatan..." autocomplete="off"/>
    `;
    const notesGrid = document.getElementById('notes-grid');
    notesGrid.parentNode.insertBefore(searchDiv, notesGrid);
    const handleSearch = debounce(function(){
      searchQuery = this.value.trim().toLowerCase();
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
    btn.onclick = function() {
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
    const titleMatch = (n.title || '').toLowerCase().includes(searchQuery);
    const contentText = (n.content || '').replace(/<[^>]+>/g, '').toLowerCase();
    const searchMatch = !searchQuery || titleMatch || contentText.includes(searchQuery);
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
  grid.innerHTML = sorted.map(n=>{
    const safeTitle = sanitizeText(n.title || '');
    const safeIcon = sanitizeText(n.icon || '').slice(0, 2);
    const label = sanitizeText(n.label || '');
    const content = sanitizeRichContent(n.content || '');
    const dateLabel = formatTanggalRelative(n.date || '') || '';
    return `
    <div class="note-card" data-id="${n.id}" tabindex="0" role="link">
      <div class="note-actions">
        <button class="action-btn pin${n.pinned?' pin-active':''}" data-action="pin" title="Pin/Unpin" aria-label="Pin/Unpin catatan">
          <span class="pin-inner">${n.pinned?'📌':'📍'}</span>
        </button>
        <button class="action-btn delete" data-action="delete" title="Hapus" aria-label="Hapus catatan">
          <span class="delete-inner">🗑️</span>
        </button>
      </div>
      <div class="note-title">
        ${safeIcon?`<span class="icon">${safeIcon}</span>`:""}${safeTitle}
      </div>
      ${label?`<div class="note-label">${label}</div>`:''}
      <div class="note-content">${content}</div>
      <div class="note-date">${dateLabel ? `Ditulis: ${dateLabel}` : ''}</div>
    </div>
  `;}).join("");

  // Interaktif event
  grid.querySelectorAll('.note-card').forEach(card => {
    // Card click: redirect to note.html?id=...
    card.addEventListener('click', function(e) {
      if(e.target.closest('.action-btn')) return;
      window.location.href = `note.html?id=${card.getAttribute('data-id')}`;
    });
    card.onkeydown = function(e) {
      if(e.key==='Enter' || e.key===' ') {
        window.location.href = `note.html?id=${card.getAttribute('data-id')}`;
      }
    };
    // Pin/Delete
    card.querySelectorAll('.action-btn').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const id = card.getAttribute('data-id');
        const idx = notes.findIndex(n=>n.id===id);
        if(idx<0) return;
        const note = notes[idx];
        if(this.dataset.action==="pin") {
          note.pinned = !note.pinned;
          persistNotes();
          this.querySelector('.pin-inner').animate([
            {transform:'scale(1.2)'},{transform:'scale(1)'}
          ],{duration:200});
        } else if(this.dataset.action==="delete") {
          if(confirm('Hapus catatan ini?')) {
            const deletedAt = new Date().toISOString();
            const createdAt = note.createdAt || note.date;
            notes.splice(idx,1);
            persistNotes();
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
      }
    });
  });
}

// --- About Modal (nav About) ---
const aboutModal = document.getElementById("about-modal");
const aboutTrigger = document.getElementById("nav-about");
const aboutClose = document.getElementById("about-close");
const navHome = document.getElementById("nav-home");

if (aboutTrigger && aboutModal) {
  aboutTrigger.onclick = function(e) {
    e.preventDefault();
    aboutModal.classList.add("show");
  };
}

if (aboutClose && aboutModal) {
  aboutClose.onclick = function() {
    aboutModal.classList.remove("show");
  };
}

if (navHome && aboutModal) {
  navHome.onclick = function(e) {
    e.preventDefault();
    aboutModal.classList.remove("show");
  };
}

window.onclick = function(e) {
  if(aboutModal && e.target === aboutModal) aboutModal.classList.remove("show");
};
// Di index.js
function showMiniProfile() {
  let data = safeGetItem(STORAGE_KEYS.PROFILE, {});
  const avatar = document.getElementById('profile-mini-avatar');
  const name = document.getElementById('profile-mini-name');
  if (avatar) avatar.src = data?.photo || 'default-avatar.svg';
  if (name) name.textContent = data?.name ? sanitizeText(data.name) : 'Profile';
}
window.addEventListener('DOMContentLoaded', showMiniProfile);
window.addEventListener('storage', (event) => {
  if (event.storageArea !== localStorage) return;
  if (event.key === STORAGE_KEYS.PROFILE) {
    showMiniProfile();
  }
  if (event.key === STORAGE_KEYS.NOTES) {
    loadNotes();
    renderSearchBar();
    renderNotes();
  }
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
// --- Tambah catatan baru ---
document.getElementById('add-note-btn').onclick = function() {
  let titleInput = prompt("Judul catatan:");
  if(!titleInput) return;
  let contentInput = prompt("Isi catatan (boleh pakai baris baru untuk membuat list):");
  if(!contentInput) return;
  let iconInput = prompt("Emoji/icon catatan (boleh kosong):") || "";
  let title = sanitizeText(titleInput.trim());
  let icon = sanitizeText(iconInput.trim()).slice(0, 2);
  let lines = contentInput.split('\n');
  let htmlList = lines.length > 1
    ? '<ul>' + lines.map(x=>`<li>${sanitizeText(x)}</li>`).join('') + '</ul>'
    : sanitizeText(contentInput);
  htmlList = sanitizeRichContent(htmlList);
  let now = new Date();
  let tgl = now.toISOString().slice(0,10);
  const id = String(Date.now());
  const createdAt = now.toISOString();
  notes.unshift({
    id,
    icon,
    title,
    content: htmlList,
    date: tgl,
    createdAt,
    pinned: false
  });
  persistNotes();
  if (Gamification) {
    Gamification.recordNoteCreated({ id, createdAt });
  }
  renderNotes();
};

// --- Mood selector ---
function openMoodSelector() {
  const modalId = 'mood-modal';
  if (document.getElementById(modalId)) return;
  const moods = ['😄','🙂','😐','😢','😠','😴'];
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
  modal.addEventListener('click', (event) => {
    if (event.target.id === 'mood-modal-close' || event.target === modal) {
      modal.remove();
    }
  });
  modal.querySelectorAll('.mood-option').forEach(btn => {
    btn.addEventListener('click', () => {
      saveTodayMood(btn.dataset.emoji);
      modal.remove();
    });
  });
}

function saveTodayMood(emoji) {
  const data = loadMoods();
  const today = new Date().toISOString().split('T')[0];
  data[today] = emoji;
  saveMoods(data);
  renderMoodGraph();
}

const updateMoodBtn = document.getElementById('update-mood-btn');
if (updateMoodBtn) {
  updateMoodBtn.addEventListener('click', openMoodSelector);
}
// --- Entrance: skip animasi jika dari note.html (back) ---
window.addEventListener('DOMContentLoaded', ()=>{
  renderMoodGraph(); renderSearchBar(); renderNotes();
  if(sessionStorage.getItem('skipIntro')) {
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
  let interval = setInterval(()=>{
    p = Math.min(100, p+Math.floor(Math.random()*7+1));
    pt.textContent = p+"%";
    if(p>=100){
      clearInterval(interval);
      intro.style.opacity = 0;
      setTimeout(()=>{
        intro.style.display="none";
        main.classList.remove('hidden');
        setTimeout(()=>document.querySelector('.title-abelion').classList.add('animated'),100);
      },1300);
    }
  }, 40);
});
