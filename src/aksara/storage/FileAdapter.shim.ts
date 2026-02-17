import { StorageAdapter, AbelionSchema } from './types';

export class FileAdapter implements StorageAdapter {
    async get<K extends keyof AbelionSchema>(store: K, key: string) { return undefined; }
    async set<K extends keyof AbelionSchema>(store: K, key: string, value: AbelionSchema[K]['value']) { return undefined; }
    async getAll<K extends keyof AbelionSchema>(store: K) { return []; }
    async delete(store: keyof AbelionSchema, key: string) { }
    async count(store: keyof AbelionSchema) { return 0; }
    async clear(store: keyof AbelionSchema) { }
}
