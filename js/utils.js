(function (global) {
  const STORAGE_KEYS = {
    NOTES: 'abelion-notes-v2',
    FOLDERS: 'abelion-folders',
    PROFILE: 'abelion-profile',
    MOODS: 'abelion-moods',
    GAMIFICATION: 'abelion-gamification',
    NOTE_DRAFTS: 'abelion-note-drafts',
    VERSION_META: 'abelion-version-meta',
    TRASH: 'abelion-trash'
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
        version: '2025.06.1-patch',
        releasedAt: '2025-12-16',
        highlights: [
          'Redesign Profil: Tampilan lebih bersih dengan navigasi intuitif.',
          'Gamifikasi 2.0: XP, Level, dan Badge kini tersinkronisasi realtime.',
          'Avatar Interaktif: Ganti foto profil langsung dari halaman profil.',
          'Smart Stats: Menyederhanakan tampilan statistik XP dan Level.',
        ]
      },
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

  function sanitizeRichContent(html, maxDepth = 10) {
    if (!html) return '';
    const template = document.createElement('template');
    template.innerHTML = html;
    const allowed = new Set(['UL', 'OL', 'LI', 'P', 'BR', 'STRONG', 'EM', 'CODE', 'PRE', 'SPAN', 'DIV']);

    const walk = (node, depth) => {
      if (depth > maxDepth) {
        // Too deep, flatten it
        const text = document.createTextNode(node.textContent || '');
        node.replaceWith(text);
        return;
      }

      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowed.has(child.tagName)) {
            const text = document.createTextNode(child.textContent || '');
            child.replaceWith(text);
          } else {
            Array.from(child.attributes).forEach(attr => child.removeAttribute(attr.name));
            walk(child, depth + 1);
          }
        }
      });
    };

    walk(template.content || template, 0);
    return template.innerHTML;
  }

  // --- DateUtils: Centralized Date Handling ---
  const DateUtils = {
    nowISO: () => new Date().toISOString(),

    toCalendarDay: (input) => {
      const d = input ? new Date(input) : new Date();
      // Reset hours to avoid timezone shifting when just needing the date part locally
      // This creates a date at 00:00:00 local time
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    },

    // Returns string 'YYYY-MM-DD' in local time
    toLocalISODate: (input) => {
      const d = input ? new Date(input) : new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },

    diffDays: (later, earlier) => {
      // Calculate diff based on calendar days, ignoring time
      const l = DateUtils.toCalendarDay(later);
      const e = DateUtils.toCalendarDay(earlier);
      const diffMs = l.getTime() - e.getTime();
      return Math.floor(diffMs / (24 * 60 * 60 * 1000));
    }
  };

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
          // Alert removed to prevent spamming. Callers should handle failure.
          return false;
        });
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return Promise.resolve(true);
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
      // Suppress quota alert spam, just log it.
      return Promise.resolve(false);
    }
  }

  function formatTanggal(tglStr) {
    if (!tglStr) return '';
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
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
      timeoutId = setTimeout(() => {
        // Arrow function preserves lexical 'this' where debounced is called
        // If 'debounce' is called as a method, 'this' should be correct.
        // However, safest way is to capture 'this' from the outer scope if needed, 
        // OR rely on call/apply. 
        fn.apply(this, args);
      }, delay);
    };
  }

  function checkStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate().then(estimate => {
        if (estimate.quota && estimate.usage) {
          const percentUsed = (estimate.usage / estimate.quota) * 100;
          if (percentUsed > 80) {
            console.warn(`Storage usage is high: ${percentUsed.toFixed(1)}%`);
            return 'critical';
          }
        }
        return 'ok';
      });
    }
    return Promise.resolve('unknown');
  }

  const ModalManager = {
    stack: [],
    baseZIndex: 1000,

    open(id, element) {
      this.close(id); // Close if already open

      const index = this.stack.length;
      const zIndex = this.baseZIndex + (index * 10);

      element.style.zIndex = zIndex;
      element.dataset.modalIndex = index;
      this.stack.push({ id, element, zIndex });

      if (this.stack.length === 1) {
        document.body.classList.add('modal-open');
      }

      return () => this.close(id);
    },

    close(id) {
      const idx = this.stack.findIndex(m => m.id === id);
      if (idx === -1) return;

      const modal = this.stack[idx];
      // Note: we don't remove element here, caller handles display:none
      // We just manage the stack state
      this.stack.splice(idx, 1);

      if (this.stack.length === 0) {
        document.body.classList.remove('modal-open');
      }
    },

    closeAll() {
      // Return IDs so callers can handle cleanup
      const ids = this.stack.map(m => m.id);
      this.stack = [];
      document.body.classList.remove('modal-open');
      return ids;
    }
  };

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

  function generateId(prefix = 'uid') {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback using crypto.getRandomValues if available
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      return `${prefix}-${Date.now()}-${arr[0].toString(36)}${arr[1].toString(36)}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
    bumpVersion,
    ModalManager,
    DateUtils,
    checkStorageQuota,
    generateId
  };
})(window);
