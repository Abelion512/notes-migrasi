const STORAGE_KEY = 'abelion-notes-secure-v1';
const XP_KEY = 'abelion-notes-xp';
const PROFILE_KEY = 'abelion-profile';
const LANG_KEY = 'abelion-lang';
const LEGACY_KEY = 'abelion-notes-v2';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const i18n = {
  id: {
    brand: 'Abelion Notes',
    profile: 'Profil',
    heroTitle: 'Catatan pintar yang memotivasimu setiap hari',
    heroSub: 'Catat ide, lacak progres dengan XP, dan kumpulkan badge eksklusif saat produktivitasmu meningkat.',
    ctaButton: 'Mulai menulis catatan',
    ctaSecondary: 'Pelajari cara kerjanya',
    metricNotes: 'catatan aktif',
    metricStreak: 'hari berturut-turut',
    metricBadges: 'badge diraih',
    featuresTitle: 'Semua yang kamu butuhkan untuk fokus',
    featureEditorTitle: 'Editor kaya fitur',
    featureEditorCopy: 'Gunakan bold, italic, checklist, dan bullet agar catatan tetap rapi dengan editor Quill.',
    featureTagsTitle: 'Tag & pencarian',
    featureTagsCopy: 'Kelompokkan catatan dengan tag seperti #kerja atau #jurnal, lalu temukan kembali dalam hitungan detik.',
    featureExportTitle: 'Ekspor fleksibel',
    featureExportCopy: 'Unduh catatan sebagai Markdown untuk backup atau dibagikan ke tim.',
    gamiTitle: 'Gamifikasi yang transparan',
    gamiCopy: 'Setiap aksi produktif memberi XP, membuka level baru, dan menghadiahkan badge unik. Tidak ada rahasia—semuanya terlihat.',
    ruleCreate: 'Tulis catatan baru = +10 XP',
    ruleStreak: 'Catat 3 hari beruntun = +30 XP bonus',
    ruleBadge: 'Level 3 ke atas membuka tema dan badge baru',
    xpHeading: 'Perjalanan XP',
    xpToNext: 'menuju level selanjutnya',
    badgeHeading: 'Badge terbaru',
    howTitle: 'Cara kerjanya',
    stepOneTitle: 'Tulis catatan dengan cepat',
    stepOneCopy: 'Tekan tombol "Mulai menulis catatan" lalu gunakan editor kaya fitur untuk menyimpan ide.',
    stepTwoTitle: 'Tambahkan tag & mood',
    stepTwoCopy: 'Beri tag untuk memudahkan pencarian dan catat suasana hati untuk refleksi harian.',
    stepThreeTitle: 'Level-up otomatis',
    stepThreeCopy: 'Setiap catatan menambah XP, membuka badge, dan menampilkan statistik perjalananmu.',
    demoTitle: 'Demo singkat',
    demoCopy: 'Pilih catatan di bawah untuk melihat detail, edit dengan bebas, atau ekspor sebagai Markdown.',
    searchPlaceholder: 'Cari catatan atau tag',
    emptyNotes: 'Belum ada catatan. Mulai tulis satu sekarang!',
    faqTitle: 'Pertanyaan yang sering diajukan',
    faqOfflineTitle: 'Bisakah dipakai offline?',
    faqOfflineCopy: 'Ya. Instal sebagai PWA di perangkatmu dan catatan akan tersimpan di penyimpanan lokal.',
    faqPrivacyTitle: 'Di mana data saya disimpan?',
    faqPrivacyCopy: 'Catatan tersimpan di browser kamu. Jika login ke backend pilihanmu, semua data dienkripsi end-to-end.',
    faqExportTitle: 'Bagaimana cara ekspor?',
    faqExportCopy: 'Buka catatan dan klik "Ekspor" untuk mengunduh file Markdown atau langsung salin ke clipboard.',
    privacyTitle: 'Privasi & keamanan',
    privacyLocal: 'Catatan disimpan di perangkatmu menggunakan enkripsi Web Crypto.',
    privacyPolicy: 'Baca kebijakan privasi lengkap di bagian pengaturan aplikasi.',
    privacyAnon: 'Dukung login anonim atau Google sesuai preferensi pengguna.',
    footer: 'Dibuat dengan semangat belajar oleh Abelion. Instal ke layar utama untuk pengalaman terbaik.',
    modalTitle: 'Catatan baru',
    modalTitleLabel: 'Judul',
    modalContentLabel: 'Isi catatan',
    modalTagsLabel: 'Tag (pisahkan dengan koma)',
    modalMoodLabel: 'Mood hari ini',
    modalSave: 'Simpan & tambah XP',
    modalCancel: 'Batal',
    modalTitlePlaceholder: 'Contoh: Ide produk Q3',
    modalTagsPlaceholder: '#kerja, #jurnal',
    moodHappy: 'Senang',
    moodFocus: 'Fokus',
    moodCalm: 'Tenang',
    moodTired: 'Lelah',
    noteEdited: 'Catatan diperbarui',
    noteCreated: 'Catatan disimpan',
    noteDeleted: 'Catatan dihapus',
    exportLabel: 'Ekspor',
    copyLabel: 'Salin',
    editLabel: 'Edit',
    deleteLabel: 'Hapus',
    xpGainLabel: '+10 XP',
    confirmDelete: 'Hapus catatan ini?',
    markdownDownloaded: 'Markdown siap diunduh',
    copied: 'Catatan disalin ke clipboard',
    streakDays: 'hari berturut-turut'
  },
  en: {
    brand: 'Abelion Notes',
    profile: 'Profile',
    heroTitle: 'A note app that keeps you motivated',
    heroSub: 'Capture ideas, track progress with XP, and unlock exclusive badges as your productivity grows.',
    ctaButton: 'Start a new note',
    ctaSecondary: 'See how it works',
    metricNotes: 'active notes',
    metricStreak: 'day streak',
    metricBadges: 'badges earned',
    featuresTitle: 'Everything you need to stay focused',
    featureEditorTitle: 'Rich text editor',
    featureEditorCopy: 'Use bold, italic, checklists, and bullets to keep notes tidy with the Quill editor.',
    featureTagsTitle: 'Tags & search',
    featureTagsCopy: 'Group notes with tags like #work or #journal and find them in seconds.',
    featureExportTitle: 'Flexible export',
    featureExportCopy: 'Download notes as Markdown for backup or sharing with your team.',
    gamiTitle: 'Transparent gamification',
    gamiCopy: 'Every productive action gives XP, unlocks new levels, and rewards unique badges. No secrets—everything is visible.',
    ruleCreate: 'Create a new note = +10 XP',
    ruleStreak: 'Write 3 days in a row = +30 XP bonus',
    ruleBadge: 'Reach level 3 to unlock new themes & badges',
    xpHeading: 'XP journey',
    xpToNext: 'to the next level',
    badgeHeading: 'Latest badges',
    howTitle: 'How it works',
    stepOneTitle: 'Write notes fast',
    stepOneCopy: 'Press "Start a new note" and use the rich editor to keep ideas safe.',
    stepTwoTitle: 'Add tags & mood',
    stepTwoCopy: 'Tag notes for quick filtering and log your mood for daily reflection.',
    stepThreeTitle: 'Level up automatically',
    stepThreeCopy: 'Each note adds XP, unlocks badges, and tracks your personal stats.',
    demoTitle: 'Quick demo',
    demoCopy: 'Pick a note below to see details, edit freely, or export as Markdown.',
    searchPlaceholder: 'Search notes or tags',
    emptyNotes: 'No notes yet. Start your first one now!',
    faqTitle: 'Frequently asked questions',
    faqOfflineTitle: 'Does it work offline?',
    faqOfflineCopy: 'Yes. Install it as a PWA and your notes stay in secure local storage.',
    faqPrivacyTitle: 'Where is my data stored?',
    faqPrivacyCopy: 'Notes live in your browser. If you connect to your preferred backend, we encrypt everything end-to-end.',
    faqExportTitle: 'How do I export?',
    faqExportCopy: 'Open a note and hit "Export" to download Markdown or copy instantly.',
    privacyTitle: 'Privacy & security',
    privacyLocal: 'Notes are stored on-device with Web Crypto encryption.',
    privacyPolicy: 'Read the full privacy policy inside the settings page.',
    privacyAnon: 'Supports anonymous sign-in or Google login depending on your needs.',
    footer: 'Built with curiosity by Abelion. Install to your home screen for the best experience.',
    modalTitle: 'New note',
    modalTitleLabel: 'Title',
    modalContentLabel: 'Content',
    modalTagsLabel: 'Tags (comma separated)',
    modalMoodLabel: 'Mood today',
    modalSave: 'Save & gain XP',
    modalCancel: 'Cancel',
    modalTitlePlaceholder: 'Example: Q3 product ideas',
    modalTagsPlaceholder: '#work, #journal',
    moodHappy: 'Happy',
    moodFocus: 'Focused',
    moodCalm: 'Calm',
    moodTired: 'Tired',
    noteEdited: 'Note updated',
    noteCreated: 'Note saved',
    noteDeleted: 'Note deleted',
    exportLabel: 'Export',
    copyLabel: 'Copy',
    editLabel: 'Edit',
    deleteLabel: 'Delete',
    xpGainLabel: '+10 XP',
    confirmDelete: 'Delete this note?',
    markdownDownloaded: 'Markdown ready to download',
    copied: 'Note copied to clipboard',
    streakDays: 'day streak'
  }
};

const translations = new Map();

function applyTranslations(lang) {
  const strings = i18n[lang] ?? i18n.id;
  document.documentElement.lang = lang;
  translations.clear();
  Object.entries(strings).forEach(([key, value]) => translations.set(key, value));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations.has(key)) {
      el.textContent = translations.get(key);
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations.has(key)) {
      el.setAttribute('placeholder', translations.get(key));
    }
  });
  document.querySelectorAll('option[data-i18n]').forEach(option => {
    const key = option.dataset.i18n;
    if (translations.has(key)) option.textContent = translations.get(key);
  });
  document.getElementById('lang-toggle').textContent = lang === 'id' ? 'EN' : 'ID';
}

async function ensureKey() {
  const stored = localStorage.getItem('abelion-key');
  if (stored) {
    const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  const encoded = btoa(String.fromCharCode(...raw));
  localStorage.setItem('abelion-key', encoded);
  return key;
}

async function encryptData(payload) {
  try {
    const key = await ensureKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = encoder.encode(JSON.stringify(payload));
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.stringify({
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(cipher)))
    });
  } catch (error) {
    console.warn('Encryption failed, falling back to plain text', error);
    return JSON.stringify({ plain: payload });
  }
}

async function decryptData(serialized) {
  if (!serialized) return null;
  try {
    const parsed = JSON.parse(serialized);
    if (parsed.plain) return parsed.plain;
    const key = await ensureKey();
    const iv = Uint8Array.from(atob(parsed.iv), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(parsed.data), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    console.warn('Decryption failed', error);
    return null;
  }
}

function migrateLegacyNotes() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return [];
    const parsed = JSON.parse(legacy);
    if (!Array.isArray(parsed)) return [];
    localStorage.removeItem(LEGACY_KEY);
    return parsed.map(item => ({
      id: item.id,
      title: item.title,
      html: item.content,
      delta: null,
      tags: item.label ? [item.label] : [],
      mood: 'senang',
      createdAt: item.date,
      updatedAt: item.date,
      xpEarned: 10
    }));
  } catch (error) {
    console.warn('Legacy migration failed', error);
    return [];
  }
}

async function loadNotes() {
  const raw = await decryptData(localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(raw)) return raw;
  const migrated = migrateLegacyNotes();
  if (migrated.length) return migrated;
  return getStarterNotes();
}

async function saveNotes(notes) {
  const encrypted = await encryptData(notes);
  localStorage.setItem(STORAGE_KEY, encrypted);
}

function getStarterNotes() {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  return [
    {
      id: 'starter-1',
      title: 'Rencana Fokus Mingguan',
      html: '<p>Tentukan tiga prioritas utama:</p><ul><li>Kerjakan outline artikel UX</li><li>Review progres tim</li><li>Refleksi pribadi sebelum tidur</li></ul>',
      delta: null,
      tags: ['#kerja', '#jurnal'],
      mood: 'fokus',
      createdAt: iso,
      updatedAt: iso,
      xpEarned: 10
    }
  ];
}

async function loadXpState() {
  const raw = await decryptData(localStorage.getItem(XP_KEY));
  if (raw) return raw;
  return {
    totalXp: 10,
    level: 1,
    streak: 1,
    lastEntry: new Date().toISOString().slice(0, 10),
    lastBonusStreak: 0,
    badges: ['✨ Pemula']
  };
}

async function saveXpState(state) {
  const encrypted = await encryptData(state);
  localStorage.setItem(XP_KEY, encrypted);
}

function xpThreshold(level) {
  return 100 + (level - 1) * 60;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(document.documentElement.lang || 'id', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function htmlToMarkdown(html) {
  return html
    .replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, (_, text) => `\n# ${text}\n`)
    .replace(/<li>(.*?)<\/li>/gi, (_, text) => `\n- ${text}`)
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n')
    .replace(/<br\s*\/>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

function uniqueTags(notes) {
  const set = new Set();
  notes.forEach(note => note.tags?.forEach(tag => set.add(tag.trim())));
  return Array.from(set).filter(Boolean).sort();
}

function updateProfileBadge() {
  try {
    const data = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    const avatar = data.photo || 'default-avatar.svg';
    const name = data.name || translations.get('profile') || 'Profil';
    document.getElementById('header-avatar').src = avatar;
    document.getElementById('header-name').textContent = name;
  } catch {
    document.getElementById('header-name').textContent = translations.get('profile') || 'Profil';
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

function ensureToastStyles() {
  if (document.getElementById('toast-style')) return;
  const style = document.createElement('style');
  style.id = 'toast-style';
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: rgba(32,112,234,0.95);
      color: #fff;
      padding: 12px 20px;
      border-radius: 999px;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity .3s ease, transform .3s ease;
      z-index: 50;
      font-weight: 600;
      box-shadow: 0 12px 24px rgba(32,112,234,0.35);
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    @media (max-width: 600px) {
      .toast {
        left: 50%;
        right: auto;
        transform: translate(-50%, 16px);
      }
      .toast.show {
        transform: translate(-50%, 0);
      }
    }
  `;
  document.head.appendChild(style);
}

function calculateLevel(xp) {
  let level = 1;
  let xpNeeded = xpThreshold(level);
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    xpNeeded = xpThreshold(level);
  }
  const progress = Math.min(1, xp / xpNeeded);
  return { level, progress, remainder: xp, threshold: xpNeeded };
}

function updateBadges(notes, xpState) {
  const badges = new Set(xpState.badges || []);
  if (notes.length >= 1) badges.add('✨ Pemula');
  if (notes.length >= 5) badges.add('🚀 Momentum');
  if (xpState.level >= 3) badges.add('🛡️ Penjaga Fokus');
  if (xpState.streak >= 3) badges.add('🔥 Streak Master');
  return Array.from(badges);
}

function renderXp(xpState) {
  const { level, progress, threshold } = calculateLevel(xpState.totalXp);
  const percent = Math.round(progress * 100);
  document.getElementById('xp-level').textContent = `Lv. ${level}`;
  document.getElementById('xp-progress').style.width = `${percent}%`;
  document.getElementById('xp-percent').textContent = `${percent}%`;
  document.getElementById('metric-streak').textContent = xpState.streak.toString();
  document.getElementById('metric-badges').textContent = xpState.badges.length.toString();
  const badgeList = document.getElementById('badge-list');
  badgeList.innerHTML = xpState.badges.slice(-4).map(label => `<span class="badge">${label}</span>`).join('');
  const lang = document.documentElement.lang;
  const streakLabel = translations.get('metricStreak') || (lang === 'en' ? 'day streak' : 'hari berturut-turut');
  document.querySelector('.metric:nth-child(2) .metric-label').textContent = streakLabel;
  document.querySelector('.metric:nth-child(3) .metric-label').textContent = translations.get('metricBadges');
}

function moodLabel(value) {
  const map = {
    senang: translations.get('moodHappy') || 'Senang',
    fokus: translations.get('moodFocus') || 'Fokus',
    tenang: translations.get('moodCalm') || 'Tenang',
    lelah: translations.get('moodTired') || 'Lelah'
  };
  return map[value] || value || '—';
}

function renderNotes(notes, { search, tag }) {
  const grid = document.getElementById('notes-grid');
  const empty = document.getElementById('notes-empty');
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = notes.filter(note => {
    const matchesSearch = !normalizedSearch ||
      note.title.toLowerCase().includes(normalizedSearch) ||
      stripHtml(note.html).toLowerCase().includes(normalizedSearch) ||
      note.tags.some(t => t.toLowerCase().includes(normalizedSearch));
    const matchesTag = !tag || note.tags.includes(tag);
    return matchesSearch && matchesTag;
  });

  if (!filtered.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = filtered.map(note => `
    <article class="note-card" data-id="${note.id}">
      <header>
        <div class="note-title">
          <span>${note.emoji ?? '📝'}</span>
          <span>${note.title}</span>
        </div>
        <div class="note-actions">
          <button class="icon-button" data-action="edit">${translations.get('editLabel')}</button>
          <button class="icon-button" data-action="export">${translations.get('exportLabel')}</button>
          <button class="icon-button" data-action="copy">${translations.get('copyLabel')}</button>
          <button class="icon-button" data-action="delete">${translations.get('deleteLabel')}</button>
        </div>
      </header>
      <div class="note-content">${note.html}</div>
      <div class="note-tags">${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}</div>
      <footer class="note-footer">
        <span>${formatDate(note.createdAt)} · ${translations.get('xpGainLabel')}</span>
        <span>${moodLabel(note.mood)}</span>
      </footer>
    </article>
  `).join('');
}

function renderTags(tags, activeTag) {
  const container = document.getElementById('tag-filter');
  container.innerHTML = tags.map(tag => `
    <button class="tag-chip${tag === activeTag ? ' active' : ''}" data-tag="${tag}">${tag}</button>
  `).join('');
}

function downloadMarkdown(note) {
  const blob = new Blob([`# ${note.title}\n\n${htmlToMarkdown(note.html)}`], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${note.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'catatan'}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  showToast(translations.get('markdownDownloaded'));
}

function copyNote(note) {
  navigator.clipboard.writeText(`${note.title}\n\n${htmlToMarkdown(note.html)}`).then(() => {
    showToast(translations.get('copied'));
  }).catch(() => {
    showToast('Clipboard unavailable');
  });
}

function updateMetrics(notes) {
  document.getElementById('metric-notes').textContent = notes.length.toString();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(err => console.warn('SW failed', err));
  }
}

function initTimeTicker() {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;
  const timeBadge = document.createElement('span');
  timeBadge.className = 'time-badge';
  nav.appendChild(timeBadge);
  const update = () => {
    const now = new Date();
    const opts = { hour: '2-digit', minute: '2-digit' };
    timeBadge.textContent = now.toLocaleTimeString([], opts);
  };
  update();
  setInterval(update, 60000);
}

function ensureTimeStyles() {
  if (document.getElementById('time-style')) return;
  const style = document.createElement('style');
  style.id = 'time-style';
  style.textContent = `
    .time-badge {
      margin-left: auto;
      margin-right: 24px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(32,112,234,0.12);
      color: var(--primary);
      font-weight: 600;
    }
    @media (max-width: 600px) {
      .time-badge { display: none; }
    }
  `;
  document.head.appendChild(style);
}

(async function init() {
  ensureToastStyles();
  ensureTimeStyles();
  registerServiceWorker();

  const lang = localStorage.getItem(LANG_KEY) || 'id';
  applyTranslations(lang);
  updateProfileBadge();

  const langToggle = document.getElementById('lang-toggle');
  langToggle.addEventListener('click', () => {
    const next = (document.documentElement.lang === 'id') ? 'en' : 'id';
    localStorage.setItem(LANG_KEY, next);
    applyTranslations(next);
    updateProfileBadge();
    renderNotes(appState.notes, appState.filters);
    renderXp(appState.xpState);
    renderTags(uniqueTags(appState.notes), appState.filters.tag);
  });

  const notes = await loadNotes();
  const xpState = await loadXpState();
  xpState.badges = updateBadges(notes, xpState);
  await saveXpState(xpState);

  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ header: [1, 2, 3, false] }],
        ['clean']
      ]
    }
  });

  const appState = {
    notes,
    xpState,
    filters: { search: '', tag: '' },
    editingId: null,
    quill
  };

  window.appState = appState;

  const tagContainer = document.getElementById('tag-filter');
  tagContainer.addEventListener('click', event => {
    const btn = event.target.closest('.tag-chip');
    if (!btn) return;
    const tag = btn.dataset.tag;
    appState.filters.tag = (appState.filters.tag === tag) ? '' : tag;
    renderTags(uniqueTags(appState.notes), appState.filters.tag);
    renderNotes(appState.notes, appState.filters);
  });

  document.getElementById('search-input').addEventListener('input', event => {
    appState.filters.search = event.target.value;
    renderNotes(appState.notes, appState.filters);
  });

  document.getElementById('open-note-modal').addEventListener('click', () => openModal(appState));
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-note').addEventListener('click', () => {
    closeModal();
  });

  document.getElementById('note-form').addEventListener('submit', async event => {
    event.preventDefault();
    await saveNote(appState);
  });

  document.getElementById('notes-grid').addEventListener('click', event => {
    const card = event.target.closest('.note-card');
    if (!card) return;
    const id = card.dataset.id;
    const note = appState.notes.find(n => n.id === id);
    if (!note) return;
    const actionButton = event.target.closest('.icon-button');
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === 'edit') {
      openModal(appState, note);
    } else if (action === 'export') {
      downloadMarkdown(note);
    } else if (action === 'copy') {
      copyNote(note);
    } else if (action === 'delete') {
      if (confirm(translations.get('confirmDelete'))) {
        appState.notes = appState.notes.filter(n => n.id !== id);
        await saveNotes(appState.notes);
        showToast(translations.get('noteDeleted'));
        renderNotes(appState.notes, appState.filters);
        renderTags(uniqueTags(appState.notes), appState.filters.tag);
        updateMetrics(appState.notes);
        appState.xpState.badges = updateBadges(appState.notes, appState.xpState);
        renderXp(appState.xpState);
      }
    }
  });

  renderNotes(appState.notes, appState.filters);
  renderTags(uniqueTags(appState.notes), appState.filters.tag);
  renderXp(appState.xpState);
  updateMetrics(appState.notes);
  initTimeTicker();
})();

function openModal(state, note) {
  state.editingId = note?.id ?? null;
  const dialog = document.getElementById('note-modal');
  const titleInput = document.getElementById('note-title');
  const tagInput = document.getElementById('note-tags');
  const moodInput = document.getElementById('note-mood');
  if (note) {
    titleInput.value = note.title;
    tagInput.value = note.tags.join(', ');
    moodInput.value = note.mood;
    if (note.delta) {
      state.quill.setContents(note.delta);
    } else {
      state.quill.root.innerHTML = note.html;
    }
  } else {
    titleInput.value = '';
    tagInput.value = '';
    moodInput.value = 'senang';
    state.quill.setContents([]);
  }
  dialog.showModal();
}

function closeModal() {
  const dialog = document.getElementById('note-modal');
  dialog.close();
}

async function saveNote(state) {
  const title = document.getElementById('note-title').value.trim();
  const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);
  const mood = document.getElementById('note-mood').value;
  const html = state.quill.root.innerHTML.trim();
  const delta = state.quill.getContents();
  if (!title || !stripHtml(html)) return;
  const now = new Date();
  const iso = now.toISOString();
  const day = iso.slice(0, 10);

  if (state.editingId) {
    const idx = state.notes.findIndex(note => note.id === state.editingId);
    if (idx >= 0) {
      state.notes[idx] = {
        ...state.notes[idx],
        title,
        tags,
        mood,
        html,
        delta,
        updatedAt: iso
      };
      await saveNotes(state.notes);
      showToast(translations.get('noteEdited'));
    }
  } else {
    const note = {
      id: crypto.randomUUID(),
      title,
      tags,
      mood,
      html,
      delta,
      createdAt: iso,
      updatedAt: iso,
      xpEarned: 10
    };
    state.notes.unshift(note);
    await saveNotes(state.notes);
    await updateXpForNewNote(state.xpState, day, state.notes);
    await saveXpState(state.xpState);
    showToast(translations.get('noteCreated'));
  }

  state.editingId = null;
  closeModal();
  renderNotes(state.notes, state.filters);
  renderTags(uniqueTags(state.notes), state.filters.tag);
  renderXp(state.xpState);
  updateMetrics(state.notes);
}

async function updateXpForNewNote(xpState, today, notes) {
  xpState.totalXp += 10;
  if (!xpState.lastEntry) xpState.lastEntry = today;
  const last = xpState.lastEntry;
  const diff = (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);
  if (diff === 0) {
    // same day, streak unchanged
  } else if (diff === 1) {
    xpState.streak += 1;
  } else {
    xpState.streak = 1;
  }
  xpState.lastEntry = today;
  if (xpState.streak >= 3 && xpState.streak > xpState.lastBonusStreak) {
    xpState.totalXp += 30;
    xpState.lastBonusStreak = xpState.streak;
  }
  const levelInfo = calculateLevel(xpState.totalXp);
  xpState.level = levelInfo.level;
  xpState.badges = updateBadges(notes, xpState);
}
