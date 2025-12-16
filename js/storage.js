(function (global) {
  const utils = global.AbelionUtils || {};
  const STORAGE_KEYS = utils.STORAGE_KEYS || {};

  const ENGINE = Object.freeze({
    LOCAL: 'localStorage',
    INDEXED_DB: 'indexedDB',
    SUPABASE: 'supabase'
  });

  const ENCRYPTION = Object.freeze({
    VERSION: 'aes-gcm-v1'
  });

  const DB_NAME = 'abelion-notes-db';
  const DB_VERSION = 1;
  const META_KEY = 'abelion-storage-meta';

  const DEFAULT_META = {
    schemaVersion: 1,
    engine: ENGINE.LOCAL,
    encryption: { enabled: false, salt: null, encryptedKeys: [] },
    indexes: { updatedAt: [], pinned: [], tags: {} },
    lastMigrationAt: null,
    lastVacuumAt: null
  };

  const CLEAN_KEYS = ['abelion-drafts', 'abelion-cache', 'abelion-logs'];

  const cache = new Map();
  const encryptedCache = new Map();
  const MAX_CACHE_SIZE = 50;

  function cacheGet(key) {
    return cache.get(key);
  }

  function cacheSet(key, value) {
    if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== META_KEY) { // Protect meta
        cache.delete(firstKey);
      }
    }
    cache.set(key, value);
  }

  function encryptedCacheGet(key) {
    return encryptedCache.get(key);
  }

  function encryptedCacheSet(key, value) {
    if (encryptedCache.size >= MAX_CACHE_SIZE && !encryptedCache.has(key)) {
      const firstKey = encryptedCache.keys().next().value;
      encryptedCache.delete(firstKey);
    }
    encryptedCache.set(key, value);
  }
  let activeEngine = ENGINE.LOCAL;
  let db = null;
  let encryptionKey = null;
  let isLocked = false;

  const listeners = {
    unlock: new Set(),
    lock: new Set()
  };

  const SENSITIVE_KEYS = new Set([
    STORAGE_KEYS.NOTES,
    STORAGE_KEYS.PROFILE,
    STORAGE_KEYS.MOODS,
    STORAGE_KEYS.GAMIFICATION,
    STORAGE_KEYS.VERSION_META
  ].filter(Boolean));

  const ready = (async () => {
    // 1. Wait for Supabase Env to load (optional)
    // 1. Wait for Supabase Env to load (optional) with Timeout
    if (global.AbelionSupabase && global.AbelionSupabase.ready) {
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase init timeout')), 2000));
        const client = await Promise.race([global.AbelionSupabase.ready, timeout]);

        if (client) {
          activeEngine = ENGINE.SUPABASE;
          console.log('Storage Engine switched to SUPABASE');
        }
      } catch (e) {
        console.warn('Supabase init skipped/failed (using local storage):', e.message);
      }
    }

    await primeLocalCache();
    if (activeEngine !== ENGINE.SUPABASE && canUseIndexedDB()) {
      activeEngine = ENGINE.INDEXED_DB;
      await ensureDatabase();
      await migrateLocalToIndexedDB();
    }
    await refreshIndexes();
    return true;
  })();

  function canUseIndexedDB() {
    return typeof global.indexedDB !== 'undefined';
  }

  async function ensureDatabase() {
    if (db) return db;
    db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('notes')) {
          const store = database.createObjectStore('notes', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('pinned', 'pinned', { unique: false });
          store.createIndex('tag', 'label', { unique: false });
        }
        if (!database.objectStoreNames.contains('kv')) {
          database.createObjectStore('kv');
        }
        if (!database.objectStoreNames.contains('meta')) {
          database.createObjectStore('meta');
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    return db;
  }

  function localRead(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.error('Failed to read localStorage', error);
      return fallback;
    }
  }

  function localWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to write localStorage', error);
      return false;
    }
  }

  async function idbTransaction(store, mode, handler) {
    const database = await ensureDatabase();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(store, mode);
      const objectStore = tx.objectStore(store);
      let resolved = false;
      let handlerResult;

      tx.oncomplete = () => {
        if (!resolved) {
          resolved = true;
          resolve(handlerResult);
        }
      };

      tx.onerror = () => {
        if (!resolved) {
          resolved = true;
          reject(tx.error);
        }
      };

      tx.onabort = () => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Transaction aborted'));
        }
      };

      try {
        const result = handler(objectStore);
        if (result instanceof Promise) {
          result
            .then((res) => {
              handlerResult = res;
              // If we are 'readwrite' and the promise resolved, the transaction might commit automatically
              // but we don't resolve the outer promise until tx.oncomplete fires.
            })
            .catch((err) => {
              if (!resolved) {
                // Try to abort if possible
                if (tx.readyState === 'active') {
                  try { tx.abort(); } catch (e) { /* ignore */ }
                }
                resolved = true;
                reject(err);
              }
            });
        } else {
          handlerResult = result;
          // For synchronous handlers, we just wait for oncomplete
        }
      } catch (error) {
        if (!resolved) {
          if (tx.readyState === 'active') {
            try { tx.abort(); } catch (e) { /* ignore */ }
          }
          resolved = true;
          reject(error);
        }
      }
    });
  }

  async function idbGet(store, key, fallback = null) {
    return idbTransaction(store, 'readonly', (objectStore) => {
      return new Promise((resolve, reject) => {
        const req = objectStore.get(key);
        req.onsuccess = () => resolve(req.result ?? fallback);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async function idbSet(store, key, value) {
    return idbTransaction(store, 'readwrite', (objectStore) => {
      return new Promise((resolve, reject) => {
        const req = objectStore.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async function idbPut(store, value) {
    return idbTransaction(store, 'readwrite', (objectStore) => {
      return new Promise((resolve, reject) => {
        const req = objectStore.put(value);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async function idbGetAll(store) {
    return idbTransaction(store, 'readonly', (objectStore) => {
      return new Promise((resolve, reject) => {
        const req = objectStore.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async function primeLocalCache() {
    const keysToPrime = [
      STORAGE_KEYS.NOTES,
      STORAGE_KEYS.PROFILE,
      STORAGE_KEYS.MOODS,
      STORAGE_KEYS.GAMIFICATION,
      STORAGE_KEYS.VERSION_META,
      META_KEY
    ];

    keysToPrime.forEach((key) => {
      if (!key) return;
      const value = localRead(key, null);
      if (key === META_KEY) {
        cacheSet(key, value);
      } else {
        encryptedCacheSet(key, value);
      }
    });
    const currentMeta = cacheGet(META_KEY) || {};
    cacheSet(META_KEY, { ...DEFAULT_META, ...currentMeta });

    if (cacheGet(META_KEY)?.encryption?.enabled) {
      isLocked = true;
    }
  }

  function emit(event) {
    (listeners[event] || []).forEach((fn) => {
      try { fn(); } catch (error) { console.error('Lock listener failed', error); }
    });
  }

  function toBuffer(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  }

  function toBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  async function deriveKey(passphrase, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 600000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptValue(value) {
    if (!encryptionKey) throw Object.assign(new Error('Storage locked'), { code: 'STORAGE_LOCKED' });
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(value));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encryptionKey, encoded);
    return {
      __enc: ENCRYPTION.VERSION,
      iv: toBase64(iv),
      data: toBase64(ciphertext)
    };
  }

  async function decryptValue(payload) {
    if (!payload) return payload;
    if (payload.__enc !== ENCRYPTION.VERSION) return payload;
    if (!encryptionKey) throw Object.assign(new Error('Storage locked'), { code: 'STORAGE_LOCKED' });
    const iv = toBuffer(payload.iv);
    const data = toBuffer(payload.data);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encryptionKey, data);
    const text = new TextDecoder().decode(decrypted);
    return JSON.parse(text);
  }

  function buildNoteIndexes(notes = []) {
    const seenIds = new Set();

    // Filter valid notes with deduplication
    const validNotes = notes.filter(note => {
      if (!note || !note.id || seenIds.has(note.id)) return false;
      seenIds.add(note.id);
      return true;
    });

    const byUpdated = [...validNotes]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.date || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || b.date || 0);
        return dateB - dateA;
      })
      .map(note => note.id);

    const pinned = validNotes.filter(note => note.pinned === true).map(note => note.id);

    const tags = validNotes.reduce((acc, note) => {
      if (note.label) {
        const tag = String(note.label).toLowerCase().trim();
        if (tag) {
          if (!acc[tag]) acc[tag] = [];
          if (!acc[tag].includes(note.id)) {
            acc[tag].push(note.id);
          }
        }
      }
      return acc;
    }, {});

    return { updatedAt: byUpdated, pinned, tags };
  }

  async function refreshIndexes() {
    const notes = cacheGet(STORAGE_KEYS.NOTES) || [];
    const currentMeta = cacheGet(META_KEY) || {};

    const newMeta = {
      ...DEFAULT_META,
      ...currentMeta,
      engine: activeEngine,
      schemaVersion: DEFAULT_META.schemaVersion,
      indexes: buildNoteIndexes(notes)
    };

    cacheSet(META_KEY, newMeta);
    await persistMeta();
  }

  async function persistMeta() {
    const meta = cacheGet(META_KEY);
    if (activeEngine === ENGINE.INDEXED_DB) {
      await idbSet('meta', META_KEY, meta);
    } else {
      localWrite(META_KEY, meta);
    }
  }

  async function migrateLocalToIndexedDB() {
    const localNotes = cacheGet(STORAGE_KEYS.NOTES) || [];
    const remoteMeta = await idbGet('meta', META_KEY, null);

    let currentMeta = cacheGet(META_KEY) || DEFAULT_META;

    if (remoteMeta) {
      currentMeta = { ...DEFAULT_META, ...remoteMeta };
      cacheSet(META_KEY, currentMeta);
    }

    const existing = await idbGetAll('notes');
    if (!existing.length && localNotes.length) {
      await Promise.all(localNotes.map(note => idbPut('notes', note)));
    } else if (existing.length && !currentMeta.encryption?.enabled) {
      cacheSet(STORAGE_KEYS.NOTES, existing);
      localWrite(STORAGE_KEYS.NOTES, existing);
    }

    const kvKeys = [STORAGE_KEYS.PROFILE, STORAGE_KEYS.MOODS, STORAGE_KEYS.GAMIFICATION, STORAGE_KEYS.VERSION_META];
    for (const key of kvKeys) {
      if (!key) continue;
      const current = cacheGet(key);
      if (current) {
        await idbSet('kv', key, current);
      } else {
        const remote = await idbGet('kv', key, null);
        if (remote) {
          cacheSet(key, remote);
          localWrite(key, remote);
        }
      }
    }

    currentMeta = cacheGet(META_KEY);
    currentMeta.engine = ENGINE.INDEXED_DB;
    currentMeta.lastMigrationAt = new Date().toISOString();
    cacheSet(META_KEY, currentMeta);
    await persistMeta();
  }

  async function getValue(key, fallback = null) {
    await ready;
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    const encrypted = meta.encryption?.enabled && SENSITIVE_KEYS.has(key);
    if (encrypted && isLocked) {
      if (key === STORAGE_KEYS.NOTES) return []; // Graceful fail for notes
      throw Object.assign(new Error('Storage locked'), { code: 'STORAGE_LOCKED' });
    }
    if (cache.has(key)) return cacheGet(key);

    try {
      let value;
      if (activeEngine === ENGINE.SUPABASE && global.AbelionSupabaseDB) {
        value = await global.AbelionSupabaseDB.getValue(key);
        if (value === null) value = fallback; // Handle missing
      } else if (activeEngine === ENGINE.INDEXED_DB) {
        const stored = await idbGet('kv', key, fallback);
        value = encrypted ? await decryptValue(stored) : stored;
      } else {
        const stored = encryptedCacheGet(key) ?? localRead(key, fallback);
        value = encrypted ? await decryptValue(stored) : stored;
      }
      const result = value ?? fallback;
      cacheSet(key, result);
      return result;
    } catch (error) {
      console.error(`Failed to retrieve/decrypt value for key ${key}:`, error);
      return fallback;
    }
  }

  function getCachedValue(key, fallback = null) {
    if (cache.has(key)) return cacheGet(key);
    return fallback;
  }

  async function setValue(key, value) {
    await ready;
    cacheSet(key, value);
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    const encrypted = meta.encryption?.enabled && SENSITIVE_KEYS.has(key);
    const payload = encrypted ? await encryptValue(value) : value;
    if (key === STORAGE_KEYS.NOTES) {
      await setNotes(value || []);
      return true;
    }

    if (activeEngine === ENGINE.SUPABASE && global.AbelionSupabaseDB) {
      return global.AbelionSupabaseDB.setValue(key, payload);
    } else if (activeEngine === ENGINE.INDEXED_DB) {
      await idbSet('kv', key, payload);
    } else {
      localWrite(key, payload);
    }
    return true;
  }

  async function getNotes(filters = {}) {
    await ready;
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    if (meta.encryption?.enabled && isLocked) throw Object.assign(new Error('Storage locked'), { code: 'STORAGE_LOCKED' });

    // If Supabase, fetch fresh?
    if (activeEngine === ENGINE.SUPABASE && global.AbelionSupabaseDB) {
      try {
        const remoteNotes = await global.AbelionSupabaseDB.getNotes();
        // Update cache so UI renders fast next time?
        if (remoteNotes) {
          cacheSet(STORAGE_KEYS.NOTES, remoteNotes);
          return remoteNotes;
        }
      } catch (err) {
        console.error('Supabase getNotes failed', err);
        // Fallback to cache?
      }
    }

    const notes = cacheGet(STORAGE_KEYS.NOTES) || [];
    const indexes = meta.indexes || DEFAULT_META.indexes;

    let candidates = notes;
    if (filters.pinnedOnly) {
      const pinnedIds = new Set(indexes.pinned || []);
      candidates = notes.filter(note => pinnedIds.has(note.id));
    }

    if (filters.tag) {
      const tagKey = String(filters.tag).toLowerCase();
      const tagIds = new Set((indexes.tags && indexes.tags[tagKey]) || []);
      candidates = candidates.filter(note => tagIds.has(note.id));
    }

    if (filters.sortByUpdatedAt) {
      const order = indexes.updatedAt || [];
      const position = order.reduce((acc, id, idx) => { acc[id] = idx; return acc; }, {});
      candidates = [...candidates].sort((a, b) => {
        const posA = position[a.id] ?? Number.MAX_SAFE_INTEGER;
        const posB = position[b.id] ?? Number.MAX_SAFE_INTEGER;
        return posA - posB;
      });
    }

    return candidates;
  }

  async function setNotes(notes = []) {
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    const encrypted = meta.encryption?.enabled && SENSITIVE_KEYS.has(STORAGE_KEYS.NOTES);

    // Safety check: ensure notes is array
    const newNotes = Array.isArray(notes) ? notes : [];
    cacheSet(STORAGE_KEYS.NOTES, newNotes);

    const payload = encrypted ? await encryptValue(newNotes) : newNotes;

    if (activeEngine === ENGINE.SUPABASE && global.AbelionSupabaseDB) {
      try {
        await global.AbelionSupabaseDB.setNotes(payload);
      } catch (err) {
        console.error('Supabase setNotes failed', err);
        return false;
      }
    } else if (activeEngine === ENGINE.INDEXED_DB) {
      if (encrypted) {
        await idbTransaction('kv', 'readwrite', (store) => {
          store.put(payload, STORAGE_KEYS.NOTES);
        });
      } else {
        await idbTransaction('notes', 'readwrite', (store) => {
          store.clear();
          (newNotes || []).forEach(note => store.put(note));
        });
      }
    } else {
      localWrite(STORAGE_KEYS.NOTES, payload);
    }
    await refreshIndexes();
    return true;
  }

  async function decryptAllSensitive() {
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    const keys = Array.from(SENSITIVE_KEYS);
    for (const key of keys) {
      if (!key) continue;
      if (cache.has(key)) continue;
      if (activeEngine === ENGINE.INDEXED_DB) {
        if (key === STORAGE_KEYS.NOTES) {
          const encryptedNotes = await idbGet('kv', key, null);
          if (encryptedNotes) {
            cacheSet(key, await decryptValue(encryptedNotes));
          }
        } else {
          const stored = await idbGet('kv', key, null);
          if (stored) cacheSet(key, await decryptValue(stored));
        }
      } else {
        const stored = encryptedCacheGet(key) ?? localRead(key, null);
        if (stored) cacheSet(key, await decryptValue(stored));
      }
    }
    if (!cache.has(STORAGE_KEYS.NOTES)) cacheSet(STORAGE_KEYS.NOTES, []);
    await refreshIndexes();
    emit('unlock');
    return true;
  }

  async function unlock(passphrase) {
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    if (!meta.encryption?.enabled) return true;
    const salt = meta.encryption.salt ? toBuffer(meta.encryption.salt) : null;
    if (!salt) throw new Error('Missing encryption salt');
    try {
      encryptionKey = await deriveKey(passphrase, salt);
      isLocked = false;
      await decryptAllSensitive();
      return true;
    } catch (error) {
      encryptionKey = null;
      isLocked = true;
      throw Object.assign(new Error('Passphrase salah'), { code: 'BAD_PASSPHRASE' });
    }
  }

  function lock() {
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    if (!meta.encryption?.enabled) return;
    encryptionKey = null;
    isLocked = true;
    Array.from(SENSITIVE_KEYS).forEach((key) => { cache.delete(key); });
    emit('lock');
  }

  async function enableEncryption(passphrase) {
    await ready;
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    encryptionKey = await deriveKey(passphrase, salt);
    meta.encryption = {
      enabled: true,
      salt: toBase64(salt),
      encryptedKeys: Array.from(SENSITIVE_KEYS)
    };
    cacheSet(META_KEY, meta);
    isLocked = false;

    for (const key of SENSITIVE_KEYS) {
      if (!key) continue;
      let value;
      if (key === STORAGE_KEYS.NOTES) {
        if (cache.has(key)) {
          value = cacheGet(key);
        } else if (activeEngine === ENGINE.INDEXED_DB) {
          value = await idbGetAll('notes');
        } else {
          value = localRead(STORAGE_KEYS.NOTES, []);
        }
      } else {
        value = cache.has(key) ? cacheGet(key) : await getValue(key, {});
      }
      await setValue(key, value || (key === STORAGE_KEYS.NOTES ? [] : {}));
    }
    await persistMeta();
    return true;
  }

  function isEncryptionEnabled() {
    const meta = cacheGet(META_KEY) || DEFAULT_META;
    return !!meta.encryption?.enabled;
  }

  async function getMeta() {
    await ready;
    return { ...(cacheGet(META_KEY) || DEFAULT_META) };
  }

  async function getUsage() {
    await ready;
    if (navigator?.storage?.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate || null;
      } catch (error) {
        console.warn('Failed to estimate storage usage', error);
      }
    }
    return null;
  }

  async function vacuum() {
    await ready;
    CLEAN_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
    if (activeEngine === ENGINE.INDEXED_DB) {
      for (const key of CLEAN_KEYS) {
        await idbTransaction('kv', 'readwrite', (store) => { store.delete(key); });
      }
    }
    const meta = cacheGet(META_KEY);
    meta.lastVacuumAt = new Date().toISOString();
    cacheSet(META_KEY, meta);
    await persistMeta();
    return true;
  }

  global.AbelionStorage = {
    ready,
    getEngine: () => activeEngine,
    getCachedValue,
    getValue,
    setValue,
    getNotes,
    setNotes,
    unlock,
    lock,
    enableEncryption,
    isEncryptionEnabled: () => isEncryptionEnabled(),
    isLocked: () => isLocked,
    onUnlock: (fn) => { listeners.unlock.add(fn); return () => listeners.unlock.delete(fn); },
    onLock: (fn) => { listeners.lock.add(fn); return () => listeners.lock.delete(fn); },
    getMeta,
    getUsage,
    vacuum
  };
})(window);
