import { openDB, IDBPDatabase } from 'idb';
import { StorageAdapter, AbelionSchema } from './types';

const DB_NAME = 'abelion_next';
const DB_VERSION = 1;

export class BrowserAdapter implements StorageAdapter {
    private dbInstance: IDBPDatabase<AbelionSchema> | null = null;

    private async initDB(): Promise<IDBPDatabase<AbelionSchema>> {
        if (this.dbInstance) return this.dbInstance;

        this.dbInstance = await openDB<AbelionSchema>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('notes')) {
                    const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
                    noteStore.createIndex('updatedAt', 'updatedAt');
                    noteStore.createIndex('folderId', 'folderId');
                }
                if (!db.objectStoreNames.contains('folders')) {
                    db.createObjectStore('folders', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('kv')) {
                    db.createObjectStore('kv');
                }
                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta');
                }
            },
        });

        return this.dbInstance;
    }

    async get<K extends keyof AbelionSchema>(store: K, key: string) {
        const db = await this.initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.get(store as any, key);
    }

    async set<K extends keyof AbelionSchema>(store: K, key: string, value: AbelionSchema[K]['value']) {
        const db = await this.initDB();
        if (store === 'notes' || store === 'folders') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return db.put(store as any, value);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.put(store as any, value, key);
    }

    async getAll<K extends keyof AbelionSchema>(store: K) {
        const db = await this.initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.getAll(store as any);
    }

    async delete(store: keyof AbelionSchema, key: string) {
        const db = await this.initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.delete(store as any, key);
    }

    async count(store: keyof AbelionSchema) {
        const db = await this.initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.count(store as any);
    }

    async clear(store: keyof AbelionSchema) {
        const db = await this.initDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db.clear(store as any);
    }
}
