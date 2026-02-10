import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, Folder, AppSettings, UserProfile } from '@/types';

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

export const Basisdata = {
    async set<K extends keyof AbelionSchema>(store: K, key: string, value: AbelionSchema[K]['value']) {
        const db = await initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.put(store as any, value, key);
    },

    async get<K extends keyof AbelionSchema>(store: K, key: string) {
        const db = await initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.get(store as any, key);
    },

    async getAll<K extends keyof AbelionSchema>(store: K) {
        const db = await initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.getAll(store as any);
    },

    async delete(store: keyof AbelionSchema, key: string) {
        const db = await initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.delete(store as any, key);
    },

    async count(store: keyof AbelionSchema) {
        const db = await initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.count(store as any);
    },

    async clear(store: keyof AbelionSchema) {
        const db = await initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.clear(store as any);
    }
};
