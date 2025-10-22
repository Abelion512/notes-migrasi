(function(global){
  const STORAGE_KEYS = {
    NOTES: 'abelion-notes-v2',
    PROFILE: 'abelion-profile',
    MOODS: 'abelion-moods',
    GAMIFICATION: 'abelion-gamification'
  };

  const APP_META = Object.freeze({
    version: '2025.06.0-design-preview',
    build: '2025-06-15',
    codename: 'Lavender Dawn',
    environment: 'prototype',
    changelog: Object.freeze([
      {
        version: '2025.06.0-design-preview',
        releasedAt: '2025-06-15',
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
    const allowed = new Set(['UL', 'OL', 'LI', 'P', 'BR']);

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
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return fallback;
    }
  }

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
      if (error && error.name === 'QuotaExceededError') {
        alert('Penyimpanan penuh. Hapus beberapa catatan atau data lama untuk melanjutkan.');
      }
      return false;
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

  function getVersionMeta() {
    return { ...APP_META };
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
    getVersionChangelog
  };
})(window);
