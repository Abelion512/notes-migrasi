(function(global){
  const utils = global.AbelionUtils || {};
  const STORAGE_KEYS = utils.STORAGE_KEYS || {};

  const ENGINE = Object.freeze({
    LOCAL: 'localStorage',
    INDEXED_DB: 'indexedDB'
  });

  const DB_NAME = 'abelion-notes-db';
  const DB_VERSION = 1;
  const META_KEY = 'abelion-storage-meta';

  const DEFAULT_META = {
    schemaVersion: 1,
    engine: ENGINE.LOCAL,
    indexes: { updatedAt: [], pinned: [], tags: {} },
    lastMigrationAt: null,
    lastVacuumAt: null
  };

  const CLEAN_KEYS = ['abelion-drafts', 'abelion-cache', 'abelion-logs'];

  const cache = {};
  let activeEngine = ENGINE.LOCAL;
  let db = null;

  const ready = (async () => {
    await primeLocalCache();
    if (canUseIndexedDB()) {
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
      const result = handler(objectStore);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
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
      const fallback = key === STORAGE_KEYS.NOTES ? [] : {};
      cache[key] = localRead(key, fallback);
    });
    cache[META_KEY] = { ...DEFAULT_META, ...(cache[META_KEY] || {}) };
  }

  function buildNoteIndexes(notes = []) {
    const byUpdated = [...notes]
      .filter(note => note && note.updatedAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(note => note.id);

    const pinned = notes.filter(note => note?.pinned).map(note => note.id);
    const tags = notes.reduce((acc, note) => {
      if (note?.label) {
        const tag = String(note.label).toLowerCase();
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(note.id);
      }
      return acc;
    }, {});

    return { updatedAt: byUpdated, pinned, tags };
  }

  async function refreshIndexes() {
    const notes = cache[STORAGE_KEYS.NOTES] || [];
    cache[META_KEY] = {
      ...DEFAULT_META,
      ...(cache[META_KEY] || {}),
      engine: activeEngine,
      schemaVersion: DEFAULT_META.schemaVersion,
      indexes: buildNoteIndexes(notes)
    };
    await persistMeta();
  }

  async function persistMeta() {
    const meta = cache[META_KEY];
    if (activeEngine === ENGINE.INDEXED_DB) {
      await idbSet('meta', META_KEY, meta);
    } else {
      localWrite(META_KEY, meta);
    }
  }

  async function migrateLocalToIndexedDB() {
    const localNotes = cache[STORAGE_KEYS.NOTES] || [];
    const remoteMeta = await idbGet('meta', META_KEY, null);
    if (remoteMeta) {
      cache[META_KEY] = { ...DEFAULT_META, ...remoteMeta };
    }
    const existing = await idbGetAll('notes');
    if (!existing.length && localNotes.length) {
      await Promise.all(localNotes.map(note => idbPut('notes', note)));
    } else if (existing.length) {
      cache[STORAGE_KEYS.NOTES] = existing;
      localWrite(STORAGE_KEYS.NOTES, existing);
    }

    const kvKeys = [STORAGE_KEYS.PROFILE, STORAGE_KEYS.MOODS, STORAGE_KEYS.GAMIFICATION, STORAGE_KEYS.VERSION_META];
    for (const key of kvKeys) {
      if (!key) continue;
      const current = cache[key];
      if (current) {
        await idbSet('kv', key, current);
      } else {
        const remote = await idbGet('kv', key, null);
        if (remote) {
          cache[key] = remote;
          localWrite(key, remote);
        }
      }
    }

    cache[META_KEY].engine = ENGINE.INDEXED_DB;
    cache[META_KEY].lastMigrationAt = new Date().toISOString();
    await persistMeta();
  }

  async function getValue(key, fallback = null) {
    await ready;
    if (cache[key] !== undefined) return cache[key];

    if (activeEngine === ENGINE.INDEXED_DB) {
      const value = await idbGet('kv', key, fallback);
      cache[key] = value;
      return value;
    }

    const value = localRead(key, fallback);
    cache[key] = value;
    return value;
  }

  function getCachedValue(key, fallback = null) {
    if (cache[key] !== undefined) return cache[key];
    return fallback;
  }

  async function setValue(key, value) {
    await ready;
    cache[key] = value;
    if (key === STORAGE_KEYS.NOTES) {
      await setNotes(value || []);
      return true;
    }

    if (activeEngine === ENGINE.INDEXED_DB) {
      await idbSet('kv', key, value);
    } else {
      localWrite(key, value);
    }
    return true;
  }

  async function getNotes(filters = {}) {
    await ready;
    const notes = cache[STORAGE_KEYS.NOTES] || [];
    const indexes = cache[META_KEY]?.indexes || DEFAULT_META.indexes;

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
    cache[STORAGE_KEYS.NOTES] = Array.isArray(notes) ? notes : [];
    if (activeEngine === ENGINE.INDEXED_DB) {
      await idbTransaction('notes', 'readwrite', (store) => {
        store.clear();
      });
      await Promise.all((cache[STORAGE_KEYS.NOTES] || []).map(note => idbPut('notes', note)));
    } else {
      localWrite(STORAGE_KEYS.NOTES, cache[STORAGE_KEYS.NOTES]);
    }
    await refreshIndexes();
    return true;
  }

  async function getMeta() {
    await ready;
    return { ...(cache[META_KEY] || DEFAULT_META) };
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
    cache[META_KEY].lastVacuumAt = new Date().toISOString();
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
    getMeta,
    getUsage,
    vacuum
  };
})(window);
