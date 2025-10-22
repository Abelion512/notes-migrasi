const STORAGE_KEY = 'abelion-notes-secure-v1';
const XP_KEY = 'abelion-notes-xp';
const PROFILE_KEY = 'abelion-profile';
export const LANG_KEY = 'abelion-lang';
const LEGACY_KEY = 'abelion-notes-v2';
const KEY_STORAGE = 'abelion-key';
const MOOD_KEY = 'abelion-mood-log-v1';
const DRAFT_KEY = 'abelion-note-draft-v1';
export const DEFAULT_AVATAR = 'assets/images/default-avatar.svg';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getDocumentLang() {
  if (typeof document !== 'undefined' && document.documentElement?.lang) {
    return document.documentElement.lang;
  }
  return 'id';
}

async function ensureKey() {
  const stored = localStorage.getItem(KEY_STORAGE);
  if (stored) {
    const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  const encoded = btoa(String.fromCharCode(...raw));
  localStorage.setItem(KEY_STORAGE, encoded);
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
    console.warn('Encryption failed, storing plain payload', error);
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

export async function loadNotes() {
  const raw = await decryptData(localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(raw)) return raw;
  const migrated = migrateLegacyNotes();
  if (migrated.length) return migrated;
  return getStarterNotes();
}

export async function saveNotes(notes) {
  const encrypted = await encryptData(notes);
  localStorage.setItem(STORAGE_KEY, encrypted);
}

export async function loadXpState() {
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

export async function saveXpState(state) {
  const encrypted = await encryptData(state);
  localStorage.setItem(XP_KEY, encrypted);
}

export function xpThreshold(level) {
  return 100 + (level - 1) * 60;
}

export function formatDate(dateStr, locale = getDocumentLang()) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function htmlToMarkdown(html) {
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

export function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

export function uniqueTags(notes) {
  const set = new Set();
  notes.forEach(note => note.tags?.forEach(tag => set.add(tag.trim())));
  return Array.from(set).filter(Boolean).sort();
}

export function loadProfile() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    return {
      name: raw.name || '',
      tagline: raw.tagline || '',
      social: raw.social || '',
      photo: raw.photo || DEFAULT_AVATAR,
      highlightBadge: raw.highlightBadge || '',
      locale: raw.locale || null
    };
  } catch {
    return {
      name: '',
      tagline: '',
      social: '',
      photo: DEFAULT_AVATAR,
      highlightBadge: ''
    };
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function getProfileSnapshot() {
  const profile = loadProfile();
  return {
    name: profile.name,
    photo: profile.photo || DEFAULT_AVATAR,
    highlightBadge: profile.highlightBadge || ''
  };
}

export function loadMoodLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(MOOD_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

export function saveMoodLog(log) {
  localStorage.setItem(MOOD_KEY, JSON.stringify(log));
}

export function updateMoodLogForDay(day, mood, currentLog = null) {
  const log = currentLog ? { ...currentLog } : loadMoodLog();
  log[day] = mood;
  saveMoodLog(log);
  return log;
}

export function getWeeklyMood(log) {
  const result = [];
  const today = new Date();
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    result.push({ date: key, mood: log[key] || null });
  }
  return result;
}

export function loadDraft() {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    return raw;
  } catch {
    return null;
  }
}

export function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export { PROFILE_KEY, MOOD_KEY, DRAFT_KEY };
