(function(global){
  const STORAGE_KEYS = {
    NOTES: 'abelion-notes-v2',
    PROFILE: 'abelion-profile',
    MOODS: 'abelion-moods',
    GAMIFICATION: 'abelion-gamification',
    NOTE_DRAFTS: 'abelion-note-drafts',
    VERSION_META: 'abelion-version-meta'
  };

  const APP_VERSION_BASE = Object.freeze({
    major: 2025,
    minor: 6,
    patch: 0,
    channel: 'design-preview',
    codename: 'Lavender Dawn',
    build: '2025-06-15',
    environment: 'prototype'
  });

  const INITIAL_VERSION_STRING = `${APP_VERSION_BASE.major}.${String(APP_VERSION_BASE.minor).padStart(2, '0')}.${APP_VERSION_BASE.patch}-${APP_VERSION_BASE.channel}`;

  const APP_META = Object.freeze({
    versioning: APP_VERSION_BASE,
    changelog: Object.freeze([
      {
        version: INITIAL_VERSION_STRING,
        releasedAt: APP_VERSION_BASE.build,
        highlights: [
          'Penyegaran tampilan profil agar selaras dengan halaman beranda.',
          'Penambahan sistem meta versi yang siap untuk riwayat rilis.',
          'Fondasi gamifikasi XP & badge secara realtime (sinkron dengan penyimpanan lokal).'
        ]
      }
    ])
  });

  function sanitizeHTML(input) {
    const temp = document.createElement('div');
    temp.textContent = input == null ? '' : String(input);
    return temp.innerHTML;
  }

  function sanitizeText(input) {
    return sanitizeHTML(input).replace(/\u00A0/g, ' ');
  }

  function sanitizeRichContent(html) {
    if (!html) return '';
    const template = document.createElement('template');
    template.innerHTML = html;
    const allowed = new Set(['UL', 'OL', 'LI', 'P', 'BR', 'STRONG', 'EM', 'CODE', 'PRE']);

    const walk = (node) => {
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowed.has(child.tagName)) {
            const text = document.createTextNode(child.textContent || '');
            child.replaceWith(text);
          } else {
            Array.from(child.attributes).forEach(attr => child.removeAttribute(attr.name));
            walk(child);
          }
        }
      });
    };

    walk(template.content || template);
    return template.innerHTML;
  }

  function safeGetItem(key, fallback = null) {
    const storage = window.AbelionStorage;
    if (storage && typeof storage.getCachedValue === 'function') {
      try {
        return storage.getCachedValue(key, fallback);
      } catch (error) {
        console.error(`Error reading storage key "${key}":`, error);
        return fallback;
      }
    }

    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return fallback;
    }
  }

  function safeSetItem(key, value) {
    const storage = window.AbelionStorage;
    if (storage && typeof storage.setValue === 'function') {
      return storage.setValue(key, value)
        .then(() => true)
        .catch((error) => {
          console.error(`Error writing storage key "${key}":`, error);
          alert('Gagal menyimpan data. Periksa kuota penyimpanan.');
          return false;
        });
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return Promise.resolve(true);
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
      if (error && error.name === 'QuotaExceededError') {
        alert('Penyimpanan penuh. Hapus beberapa catatan atau data lama untuk melanjutkan.');
      }
      return Promise.resolve(false);
    }
  }

  function formatTanggal(tglStr) {
    if (!tglStr) return '';
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const d = new Date(tglStr);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatTanggalRelative(tglStr) {
    const date = new Date(tglStr);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return 'Baru saja';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)} menit lalu`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)} jam lalu`;
    if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} hari lalu`;
    return formatTanggal(tglStr);
  }

  function debounce(fn, delay = 300) {
    let timeoutId;
    return function debounced(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function isSameDay(a, b) {
    if (!a || !b) return false;
    const first = new Date(a);
    const second = new Date(b);
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }

  function differenceInDays(later, earlier) {
    if (!later || !earlier) return Number.POSITIVE_INFINITY;
    const end = new Date(later);
    const start = new Date(earlier);
    if (Number.isNaN(end.getTime()) || Number.isNaN(start.getTime())) return Number.POSITIVE_INFINITY;
    const diff = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
    return Math.round(diff / (24 * 60 * 60 * 1000));
  }

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, number));
  }

  function resolveVersioning() {
    const base = APP_META.versioning;
    const stored = safeGetItem(STORAGE_KEYS.VERSION_META, null);

    const parseNumeric = (value, fallback) => {
      const number = Number.parseInt(value, 10);
      return Number.isFinite(number) ? Math.max(0, number) : fallback;
    };

    const sanitize = (value, fallback = '') => {
      const text = value == null ? '' : String(value);
      const trimmed = text.trim();
      return trimmed.length ? trimmed : fallback;
    };

    const versioning = {
      major: parseNumeric(stored?.major, base.major),
      minor: parseNumeric(stored?.minor, base.minor),
      patch: parseNumeric(stored?.patch, base.patch),
      channel: sanitize(stored?.channel, base.channel),
      codename: sanitize(stored?.codename, base.codename),
      build: sanitize(stored?.build, base.build),
      environment: sanitize(stored?.environment, base.environment),
      updatedAt: sanitize(stored?.updatedAt, base.build)
    };

    return versioning;
  }

  function computeVersionString(versioning) {
    if (!versioning) return INITIAL_VERSION_STRING;
    const minor = String(versioning.minor).padStart(2, '0');
    const patch = String(versioning.patch);
    const suffix = versioning.channel ? `-${versioning.channel}` : '';
    return `${versioning.major}.${minor}.${patch}${suffix}`;
  }

  function getVersionMeta() {
    const versioning = resolveVersioning();
    return {
      version: computeVersionString(versioning),
      codename: versioning.codename,
      build: versioning.build,
      environment: versioning.environment,
      versioning: { ...versioning }
    };
  }

  function bumpVersion(kind = 'patch', overrides = {}) {
    const versioning = resolveVersioning();
    switch (kind) {
      case 'major':
        versioning.major += 1;
        versioning.minor = 0;
        versioning.patch = 0;
        break;
      case 'minor':
        versioning.minor += 1;
        versioning.patch = 0;
        break;
      default:
        versioning.patch += 1;
        break;
    }

    if (overrides.codename) versioning.codename = String(overrides.codename).trim();
    if (overrides.build) versioning.build = String(overrides.build).trim();
    if (overrides.environment) versioning.environment = String(overrides.environment).trim();
    if (overrides.channel !== undefined) {
      versioning.channel = String(overrides.channel || '').trim();
    }

    versioning.updatedAt = new Date().toISOString();
    safeSetItem(STORAGE_KEYS.VERSION_META, versioning);
    return getVersionMeta();
  }

  function getVersionChangelog() {
    return APP_META.changelog.map(item => ({ ...item, highlights: [...item.highlights] }));
  }

  global.AbelionUtils = {
    STORAGE_KEYS,
    sanitizeHTML,
    sanitizeText,
    sanitizeRichContent,
    safeGetItem,
    safeSetItem,
    formatTanggal,
    formatTanggalRelative,
    debounce,
    isSameDay,
    differenceInDays,
    clamp,
    getVersionMeta,
    getVersionChangelog,
    bumpVersion
  };
})(window);
