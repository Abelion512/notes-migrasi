import {
  LANG_KEY,
  loadNotes,
  loadXpState,
  loadProfile,
  saveProfile,
  DEFAULT_AVATAR,
  loadMoodLog,
  getWeeklyMood
} from './data.js';
import { applyTranslations } from './i18n.js';

let translations = new Map();

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
  let xpNeeded = 100;
  let remaining = xp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level += 1;
    xpNeeded = 100 + (level - 1) * 60;
  }
  const progress = xpNeeded ? Math.min(1, remaining / xpNeeded) : 0;
  return { level, progress, remainder: remaining, threshold: xpNeeded };
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

function renderHeaderProfile(profile) {
  const avatar = document.getElementById('header-avatar');
  const nameEl = document.getElementById('header-name');
  if (avatar) avatar.src = profile.photo || DEFAULT_AVATAR;
  if (nameEl) {
    const base = profile.name || translations.get('profile') || 'Profil';
    nameEl.textContent = profile.highlightBadge ? `${base} • ${profile.highlightBadge}` : base;
  }
}

function renderHeroHighlight(profile) {
  const highlight = document.getElementById('profile-highlight');
  if (!highlight) return;
  if (profile.highlightBadge) {
    const label = translations.get('profileBadgeLabel') || 'Primary badge';
    highlight.textContent = `${label}: ${profile.highlightBadge}`;
    highlight.hidden = false;
  } else {
    highlight.textContent = '';
    highlight.hidden = true;
  }
}

function renderStats(notes, xpState) {
  const notesEl = document.getElementById('profile-notes');
  const levelEl = document.getElementById('profile-level');
  const xpEl = document.getElementById('profile-xp');
  const bar = document.getElementById('profile-progress-bar');
  if (notesEl) notesEl.textContent = notes.length.toString();
  const levelInfo = calculateLevel(xpState.totalXp || 0);
  if (levelEl) levelEl.textContent = (xpState.level || levelInfo.level).toString();
  if (xpEl) xpEl.textContent = xpState.totalXp?.toString() ?? '0';
  if (bar) {
    bar.style.width = `${Math.round(levelInfo.progress * 100)}%`;
  }
}

function renderMood(log) {
  const list = document.getElementById('profile-mood-list');
  const empty = document.getElementById('profile-mood-empty');
  if (!list || !empty) return;
  const weekly = getWeeklyMood(log);
  const hasMood = weekly.some(entry => entry.mood);
  if (!hasMood) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = translations.get('profileMoodEmpty') || empty.textContent;
    return;
  }
  empty.hidden = true;
  const locale = document.documentElement.lang || 'id';
  list.innerHTML = weekly.map(entry => {
    const date = new Date(entry.date);
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' });
    const label = formatter.format(date);
    const mood = entry.mood ? moodLabel(entry.mood) : '—';
    return `<li><span>${label}</span><span>${mood}</span></li>`;
  }).join('');
}

function renderBadges(badges, highlight) {
  const container = document.getElementById('profile-badges');
  if (!container) return;
  if (!badges.length) {
    container.innerHTML = `<p class="profile-panel-empty">${translations.get('profileBadgesEmpty') || 'Belum ada badge yang terbuka.'}</p>`;
    return;
  }
  container.innerHTML = badges.map(badge => `
    <span class="profile-badge-chip${badge === highlight ? ' active' : ''}">${badge}</span>
  `).join('');
}

function populateBadgeSelect(badges, highlight) {
  const select = document.getElementById('profile-badge');
  if (!select) return;
  while (select.options.length > 1) {
    select.remove(1);
  }
  badges.forEach(badge => {
    const option = document.createElement('option');
    option.value = badge;
    option.textContent = badge;
    select.appendChild(option);
  });
  select.value = highlight || '';
}

function hydrateForm(profile) {
  const name = document.getElementById('display-name');
  const tagline = document.getElementById('profile-tagline');
  const social = document.getElementById('profile-social');
  const photo = document.getElementById('profile-photo');
  const badge = document.getElementById('profile-badge');
  if (name) name.value = profile.name || '';
  if (tagline) tagline.value = profile.tagline || '';
  if (social) social.value = profile.social || '';
  if (photo) photo.src = profile.photo || DEFAULT_AVATAR;
  if (badge) badge.value = profile.highlightBadge || '';
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(err => console.warn('SW failed', err));
  }
}

(async function init() {
  registerServiceWorker();
  const storedLang = localStorage.getItem(LANG_KEY) || 'id';
  translations = applyTranslations(storedLang, '#lang-toggle');

  const profileState = loadProfile();
  const notes = await loadNotes();
  const xpState = await loadXpState();
  const moodLog = loadMoodLog();

  renderHeaderProfile(profileState);
  renderHeroHighlight(profileState);
  renderStats(notes, xpState);
  renderMood(moodLog);
  renderBadges(xpState.badges || [], profileState.highlightBadge);
  populateBadgeSelect(xpState.badges || [], profileState.highlightBadge);
  hydrateForm(profileState);

  const langToggle = document.getElementById('lang-toggle');
  langToggle?.addEventListener('click', () => {
    const next = (document.documentElement.lang === 'id') ? 'en' : 'id';
    localStorage.setItem(LANG_KEY, next);
    translations = applyTranslations(next, '#lang-toggle');
    renderHeaderProfile(profileState);
    renderHeroHighlight(profileState);
    renderMood(moodLog);
    renderBadges(xpState.badges || [], profileState.highlightBadge);
  });

  document.getElementById('profile-upload')?.addEventListener('click', () => {
    document.getElementById('profile-file')?.click();
  });

  document.getElementById('profile-file')?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      profileState.photo = reader.result || DEFAULT_AVATAR;
      hydrateForm(profileState);
      renderHeaderProfile(profileState);
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('profile-remove')?.addEventListener('click', () => {
    profileState.photo = DEFAULT_AVATAR;
    hydrateForm(profileState);
    renderHeaderProfile(profileState);
  });

  document.getElementById('profile-badge')?.addEventListener('change', event => {
    profileState.highlightBadge = event.target.value;
    renderHeroHighlight(profileState);
    renderBadges(xpState.badges || [], profileState.highlightBadge);
    renderHeaderProfile(profileState);
  });

  document.getElementById('profile-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const updated = {
      ...profileState,
      name: document.getElementById('display-name').value.trim(),
      tagline: document.getElementById('profile-tagline').value.trim(),
      social: document.getElementById('profile-social').value.trim(),
      highlightBadge: document.getElementById('profile-badge').value,
      photo: document.getElementById('profile-photo').src,
      locale: document.documentElement.lang
    };
    Object.assign(profileState, updated);
    saveProfile(profileState);
    renderHeaderProfile(profileState);
    renderHeroHighlight(profileState);
    renderBadges(xpState.badges || [], profileState.highlightBadge);
    showToast(translations.get('profileToastSaved'));
  });

  document.getElementById('profile-reset')?.addEventListener('click', () => {
    const reset = {
      name: '',
      tagline: '',
      social: '',
      photo: DEFAULT_AVATAR,
      highlightBadge: '',
      locale: document.documentElement.lang
    };
    Object.assign(profileState, reset);
    saveProfile(profileState);
    hydrateForm(profileState);
    renderHeaderProfile(profileState);
    renderHeroHighlight(profileState);
    renderBadges(xpState.badges || [], profileState.highlightBadge);
    showToast(translations.get('profileToastReset'));
  });
})();
