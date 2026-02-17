import { Note, Folder, AppSettings, UserProfile } from '@/aksara/Rumus';
import { DBSchema } from 'idb';

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

export interface StorageAdapter {
    get<K extends keyof AbelionSchema>(store: K, key: string): Promise<AbelionSchema[K]['value'] | undefined>;
    set<K extends keyof AbelionSchema>(store: K, key: string, value: AbelionSchema[K]['value']): Promise<any>;
    getAll<K extends keyof AbelionSchema>(store: K): Promise<AbelionSchema[K]['value'][]>;
    delete(store: keyof AbelionSchema, key: string): Promise<void>;
    count(store: keyof AbelionSchema): Promise<number>;
    clear(store: keyof AbelionSchema): Promise<void>;
}
