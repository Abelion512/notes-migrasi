import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, Folder, AppSettings, UserProfile } from '@/aksara/Rumus';

const DB_NAME = 'abelion_next';
const DB_VERSION = 1;

export interface AbelionSchema extends DBSchema {
    notes: {
        key: string;
        value: Note;
        indexes: { 'updatedAt': string; 'folderId': string };
    };
    folders: {
        key: string;
        value: Folder;
    };
    kv: {
        key: string;
        value: AppSettings | UserProfile | unknown;
    };
    meta: {
        key: string;
        value: unknown;
    };
}

export const initDB = async (): Promise<IDBPDatabase<AbelionSchema>> => {
    return openDB<AbelionSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Notes store
            if (!db.objectStoreNames.contains('notes')) {
                const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
                noteStore.createIndex('updatedAt', 'updatedAt');
                noteStore.createIndex('folderId', 'folderId');
            }

            // Folders store
            if (!db.objectStoreNames.contains('folders')) {
                db.createObjectStore('folders', { keyPath: 'id' });
            }

            // Key-Value store (Configuration, Settings)
            if (!db.objectStoreNames.contains('kv')) {
                db.createObjectStore('kv');
            }

            // Metadata store (Versions, Salts)
            if (!db.objectStoreNames.contains('meta')) {
                db.createObjectStore('meta');
            }
        },
    });
};

export const Gudang = {
    async set<K extends keyof AbelionSchema>(store: K, key: string, value: AbelionSchema[K]['value']) {
        const db = await initDB();
        // Jika store memiliki keyPath (inline keys), jangan sertakan parameter key ke db.put
        if (store === 'notes') {
            return db.put('notes', value as Note);
        }
        if (store === 'folders') {
            return db.put('folders', value as Folder);
        }
        if (store === 'kv') {
            return db.put('kv', value as AppSettings | UserProfile | unknown, key);
        }
        if (store === 'meta') {
            return db.put('meta', value, key);
        }
        throw new Error(`Unknown store: ${store}`);
    },

    async get<K extends keyof AbelionSchema>(store: K, key: string) {
        const db = await initDB();
        return db.get(store, key);
    },

    async getAll<K extends keyof AbelionSchema>(store: K) {
        const db = await initDB();
        return db.getAll(store);
    },

    async delete<K extends keyof AbelionSchema>(store: K, key: string) {
        const db = await initDB();
        return db.delete(store, key);
    },

    async count<K extends keyof AbelionSchema>(store: K) {
        const db = await initDB();
        return db.count(store);
    },

    async clear<K extends keyof AbelionSchema>(store: K) {
        const db = await initDB();
        return db.clear(store);
    }
};
