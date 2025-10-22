import {
  LANG_KEY,
  loadNotes,
  saveNotes,
  loadXpState,
  saveXpState,
  xpThreshold,
  formatDate,
  htmlToMarkdown,
  stripHtml,
  uniqueTags,
  loadMoodLog,
  updateMoodLogForDay,
  getWeeklyMood,
  loadDraft,
  saveDraft,
  clearDraft,
  getProfileSnapshot,
  DEFAULT_AVATAR
} from './data.js';
import { applyTranslations } from './i18n.js';

let translations = new Map();
let autosaveTimer = null;

const tutorialSteps = [
  { titleKey: 'tutorialStep1Title', bodyKey: 'tutorialStep1Body' },
  { titleKey: 'tutorialStep2Title', bodyKey: 'tutorialStep2Body' },
  { titleKey: 'tutorialStep3Title', bodyKey: 'tutorialStep3Body' }
];

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

function showToast(message) {
  ensureToastStyles();
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

function calculateLevel(xp) {
  let level = 1;
  let xpNeeded = xpThreshold(level);
  let remaining = xp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level += 1;
    xpNeeded = xpThreshold(level);
  }
  const progress = Math.min(1, remaining / xpNeeded);
  return { level, progress, remainder: remaining, threshold: xpNeeded };
}

function updateBadges(notes, xpState) {
  const badges = new Set(xpState.badges || []);
  if (notes.length >= 1) badges.add('✨ Pemula');
  if (notes.length >= 5) badges.add('🚀 Momentum');
  if (xpState.level >= 3) badges.add('🛡️ Penjaga Fokus');
  if (xpState.streak >= 3) badges.add('🔥 Streak Master');
  return Array.from(badges);
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

function renderXp(xpState) {
  const { level, progress } = calculateLevel(xpState.totalXp);
  const percent = Math.round(progress * 100);
  const levelEl = document.getElementById('xp-level');
  const progressEl = document.getElementById('xp-progress');
  const percentEl = document.getElementById('xp-percent');
  if (levelEl) levelEl.textContent = `Lv. ${level}`;
  if (progressEl) progressEl.style.width = `${percent}%`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  const streakMetric = document.getElementById('metric-streak');
  if (streakMetric) streakMetric.textContent = xpState.streak.toString();
  const badgesMetric = document.getElementById('metric-badges');
  if (badgesMetric) badgesMetric.textContent = xpState.badges.length.toString();
  const badgeList = document.getElementById('badge-list');
  if (badgeList) {
    badgeList.innerHTML = xpState.badges.slice(-4).map(label => `<span class="badge">${label}</span>`).join('');
  }
  const streakLabel = translations.get('metricStreak');
  if (streakLabel) {
    const metricLabel = document.querySelector('.metric:nth-child(2) .metric-label');
    if (metricLabel) metricLabel.textContent = streakLabel;
  }
  const badgeLabel = translations.get('metricBadges');
  if (badgeLabel) {
    const badgeMetricLabel = document.querySelector('.metric:nth-child(3) .metric-label');
    if (badgeMetricLabel) badgeMetricLabel.textContent = badgeLabel;
  }
}

function renderNotes(notes, { search, tag }) {
  const grid = document.getElementById('notes-grid');
  const empty = document.getElementById('notes-empty');
  if (!grid || !empty) return;
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
  if (!container) return;
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
  const notesMetric = document.getElementById('metric-notes');
  if (notesMetric) notesMetric.textContent = notes.length.toString();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(err => console.warn('SW failed', err));
  }
}

function initTimeTicker() {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;
  let badge = nav.querySelector('.time-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'time-badge';
    nav.appendChild(badge);
  }
  const update = () => {
    const now = new Date();
    const opts = { hour: '2-digit', minute: '2-digit' };
    badge.textContent = now.toLocaleTimeString([], opts);
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

function updateProfileBadge() {
  try {
    const profile = getProfileSnapshot();
    const avatar = document.getElementById('header-avatar');
    const nameEl = document.getElementById('header-name');
    if (avatar) avatar.src = profile.photo || DEFAULT_AVATAR;
    if (nameEl) {
      const base = profile.name || translations.get('profile') || 'Profil';
      nameEl.textContent = profile.highlightBadge ? `${base} • ${profile.highlightBadge}` : base;
    }
  } catch {
    const fallback = document.getElementById('header-name');
    if (fallback) fallback.textContent = translations.get('profile') || 'Profil';
  }
}

function renderTutorial(state) {
  const buttons = document.querySelectorAll('[data-tutorial-step]');
  buttons.forEach(button => {
    button.classList.toggle('active', Number(button.dataset.tutorialStep) === state.tutorialStep);
  });
  const current = tutorialSteps[state.tutorialStep];
  const titleEl = document.getElementById('tutorial-step-title');
  const bodyEl = document.getElementById('tutorial-step-body');
  const indicatorEl = document.getElementById('tutorial-indicator');
  if (titleEl) titleEl.textContent = translations.get(current.titleKey) || '';
  if (bodyEl) bodyEl.textContent = translations.get(current.bodyKey) || '';
  if (indicatorEl) {
    const template = translations.get('tutorialIndicator') || '';
    indicatorEl.textContent = template
      .replace('{current}', state.tutorialStep + 1)
      .replace('{total}', tutorialSteps.length);
  }
  const prev = document.getElementById('tutorial-prev');
  const next = document.getElementById('tutorial-next');
  if (prev) prev.disabled = state.tutorialStep === 0;
  if (next) next.disabled = state.tutorialStep === tutorialSteps.length - 1;
}

function renderMood(log) {
  const todayValue = document.getElementById('mood-today-value');
  const todayEmpty = document.getElementById('mood-today-empty');
  const weekList = document.getElementById('mood-week-list');
  const weekEmpty = document.getElementById('mood-week-empty');
  if (!todayValue || !todayEmpty || !weekList || !weekEmpty) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const moodToday = log[todayKey];
  if (moodToday) {
    todayValue.textContent = moodLabel(moodToday);
    todayEmpty.hidden = true;
  } else {
    todayValue.textContent = '—';
    todayEmpty.hidden = false;
    todayEmpty.textContent = translations.get('moodTodayEmpty') || todayEmpty.textContent;
  }

  const weekly = getWeeklyMood(log);
  const hasMood = weekly.some(entry => entry.mood);
  if (!hasMood) {
    weekList.innerHTML = '';
    weekEmpty.hidden = false;
    weekEmpty.textContent = translations.get('moodWeekEmpty') || weekEmpty.textContent;
  } else {
    weekEmpty.hidden = true;
    const locale = document.documentElement.lang || 'id';
    weekList.innerHTML = weekly.map(entry => {
      const date = new Date(entry.date);
      const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' });
      const label = formatter.format(date);
      const displayMood = entry.mood ? moodLabel(entry.mood) : '—';
      return `<li><span>${label}</span><span>${displayMood}</span></li>`;
    }).join('');
  }
}

function updateAutosaveStatus(status, isoString) {
  const statusEl = document.getElementById('autosave-status');
  if (!statusEl) return;
  if (status === 'saved') {
    const label = translations.get('autosaveSaved') || 'Autosaved';
    const time = isoString ? new Date(isoString) : new Date();
    const timeText = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    statusEl.textContent = `${label} • ${timeText}`;
  } else if (status === 'restored') {
    statusEl.textContent = translations.get('autosaveRestored') || 'Draft restored';
  } else {
    statusEl.textContent = '';
  }
}

function refreshAutosaveStatus(state) {
  const dialog = document.getElementById('note-modal');
  if (dialog?.open && !state.editingId && state.draft) {
    updateAutosaveStatus('saved', state.draft.savedAt);
  } else {
    updateAutosaveStatus('');
  }
}

function queueDraftSave(state) {
  const dialog = document.getElementById('note-modal');
  if (!dialog?.open || state.editingId) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    const title = document.getElementById('note-title').value.trim();
    const tagsRaw = document.getElementById('note-tags').value;
    const mood = document.getElementById('note-mood').value;
    const html = state.quill.root.innerHTML;
    if (!title && !stripHtml(html)) {
      clearDraft();
      state.draft = null;
      updateAutosaveStatus('');
      return;
    }
    const draft = {
      title,
      tags: tagsRaw,
      mood,
      delta: state.quill.getContents(),
      savedAt: new Date().toISOString()
    };
    saveDraft(draft);
    state.draft = draft;
    updateAutosaveStatus('saved', draft.savedAt);
  }, 400);
}

function registerAutosaveListeners(state) {
  const titleInput = document.getElementById('note-title');
  const tagInput = document.getElementById('note-tags');
  const moodInput = document.getElementById('note-mood');
  titleInput?.addEventListener('input', () => queueDraftSave(state));
  tagInput?.addEventListener('input', () => queueDraftSave(state));
  moodInput?.addEventListener('change', () => queueDraftSave(state));
  state.quill.on('text-change', () => queueDraftSave(state));
}

function applyDraftToForm(state) {
  const dialog = document.getElementById('note-modal');
  if (!dialog) return;
  const titleInput = document.getElementById('note-title');
  const tagInput = document.getElementById('note-tags');
  const moodInput = document.getElementById('note-mood');
  if (state.draft) {
    titleInput.value = state.draft.title || '';
    tagInput.value = state.draft.tags || '';
    moodInput.value = state.draft.mood || 'senang';
    if (state.draft.delta) {
      state.quill.setContents(state.draft.delta);
    } else {
      state.quill.setContents([]);
    }
    updateAutosaveStatus('restored', state.draft.savedAt);
    showToast(translations.get('draftRestored'));
  } else {
    titleInput.value = '';
    tagInput.value = '';
    moodInput.value = 'senang';
    state.quill.setContents([]);
    updateAutosaveStatus('');
  }
}

function openModal(state, note) {
  const dialog = document.getElementById('note-modal');
  const titleInput = document.getElementById('note-title');
  const tagInput = document.getElementById('note-tags');
  const moodInput = document.getElementById('note-mood');
  state.editingId = note?.id ?? null;
  if (note) {
    titleInput.value = note.title;
    tagInput.value = note.tags.join(', ');
    moodInput.value = note.mood;
    if (note.delta) {
      state.quill.setContents(note.delta);
    } else {
      state.quill.root.innerHTML = note.html;
    }
    updateAutosaveStatus('');
  } else {
    applyDraftToForm(state);
  }
  dialog.showModal();
}

function closeModal() {
  const dialog = document.getElementById('note-modal');
  if (dialog?.open) dialog.close();
  updateAutosaveStatus('');
}

async function saveNote(state) {
  const title = document.getElementById('note-title').value.trim();
  const tags = document.getElementById('note-tags').value
    .split(',').map(tag => tag.trim()).filter(Boolean);
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

  state.moodLog = updateMoodLogForDay(day, mood, state.moodLog);
  state.draft = null;
  clearDraft();
  state.editingId = null;
  closeModal();
  renderNotes(state.notes, state.filters);
  renderTags(uniqueTags(state.notes), state.filters.tag);
  renderXp(state.xpState);
  renderMood(state.moodLog);
  updateMetrics(state.notes);
}

async function updateXpForNewNote(xpState, today, notes) {
  xpState.totalXp += 10;
  if (!xpState.lastEntry) xpState.lastEntry = today;
  const last = xpState.lastEntry;
  const diff = (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);
  if (diff === 1) {
    xpState.streak += 1;
  } else if (diff > 1 || diff < 0) {
    xpState.streak = 1;
  }
  xpState.lastEntry = today;
  if (xpState.streak >= 3 && xpState.streak > (xpState.lastBonusStreak || 0)) {
    xpState.totalXp += 30;
    xpState.lastBonusStreak = xpState.streak;
  }
  const levelInfo = calculateLevel(xpState.totalXp);
  xpState.level = levelInfo.level;
  xpState.badges = updateBadges(notes, xpState);
}

(async function init() {
  ensureToastStyles();
  ensureTimeStyles();
  registerServiceWorker();

  const storedLang = localStorage.getItem(LANG_KEY) || 'id';
  translations = applyTranslations(storedLang, '#lang-toggle');
  updateProfileBadge();

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
    quill,
    moodLog: loadMoodLog(),
    tutorialStep: 0,
    draft: loadDraft()
  };

  window.appState = appState;

  const langToggle = document.getElementById('lang-toggle');
  langToggle?.addEventListener('click', () => {
    const next = (document.documentElement.lang === 'id') ? 'en' : 'id';
    localStorage.setItem(LANG_KEY, next);
    translations = applyTranslations(next, '#lang-toggle');
    updateProfileBadge();
    renderNotes(appState.notes, appState.filters);
    renderTags(uniqueTags(appState.notes), appState.filters.tag);
    renderXp(appState.xpState);
    renderMood(appState.moodLog);
    renderTutorial(appState);
    refreshAutosaveStatus(appState);
  });

  const tagContainer = document.getElementById('tag-filter');
  tagContainer?.addEventListener('click', event => {
    const btn = event.target.closest('.tag-chip');
    if (!btn) return;
    const tag = btn.dataset.tag;
    appState.filters.tag = (appState.filters.tag === tag) ? '' : tag;
    renderTags(uniqueTags(appState.notes), appState.filters.tag);
    renderNotes(appState.notes, appState.filters);
  });

  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', event => {
    appState.filters.search = event.target.value;
    renderNotes(appState.notes, appState.filters);
  });

  document.getElementById('open-note-modal')?.addEventListener('click', () => openModal(appState));
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-note')?.addEventListener('click', closeModal);

  document.getElementById('note-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    await saveNote(appState);
  });

  document.getElementById('notes-grid')?.addEventListener('click', async event => {
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
        renderMood(appState.moodLog);
      }
    }
  });

  document.getElementById('tutorial-steps')?.addEventListener('click', event => {
    const button = event.target.closest('[data-tutorial-step]');
    if (!button) return;
    appState.tutorialStep = Number(button.dataset.tutorialStep);
    renderTutorial(appState);
  });

  document.getElementById('tutorial-prev')?.addEventListener('click', () => {
    if (appState.tutorialStep > 0) {
      appState.tutorialStep -= 1;
      renderTutorial(appState);
    }
  });

  document.getElementById('tutorial-next')?.addEventListener('click', () => {
    if (appState.tutorialStep < tutorialSteps.length - 1) {
      appState.tutorialStep += 1;
      renderTutorial(appState);
    }
  });

  registerAutosaveListeners(appState);

  renderNotes(appState.notes, appState.filters);
  renderTags(uniqueTags(appState.notes), appState.filters.tag);
  renderXp(appState.xpState);
  renderMood(appState.moodLog);
  renderTutorial(appState);
  updateMetrics(appState.notes);
  initTimeTicker();
})();
