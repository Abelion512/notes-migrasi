import { StorageAdapter, AbelionSchema } from './types';
import fs from 'node:fs/promises';
import path from 'node:path';

const DB_FILE = '.abelion-db.json';

interface SchemaStructure {
    notes: Record<string, AbelionSchema['notes']['value']>;
    folders: Record<string, AbelionSchema['folders']['value']>;
    kv: Record<string, AbelionSchema['kv']['value']>;
    meta: Record<string, AbelionSchema['meta']['value']>;
}

export class FileAdapter implements StorageAdapter {
    private data: SchemaStructure | null = null;
    private filePath: string;

    constructor() {
        // Use current working directory or home directory
        this.filePath = path.resolve(process.cwd(), DB_FILE);
    }

    private async load(): Promise<SchemaStructure> {
        if (this.data) return this.data;

        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(content);
        } catch (error) {
            // Initialize empty DB if file not found
            this.data = {
                notes: {},
                folders: {},
                kv: {},
                meta: {}
            };
        }
        return this.data!;
    }

    private async save(): Promise<void> {
        if (!this.data) return;
        await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    }

    async get<K extends keyof AbelionSchema>(store: K, key: string) {
        const data = await this.load();
        // @ts-ignore - Dynamic key usage
        return data[store][key];
    }

    async set<K extends keyof AbelionSchema>(store: K, key: string, value: AbelionSchema[K]['value']) {
        const data = await this.load();

        let actualKey = key;
        if ((store === 'notes' || store === 'folders') && (value as any).id) {
            actualKey = (value as any).id;
        }

        // @ts-ignore
        data[store][actualKey] = value;
        await this.save();
        return typeof actualKey === 'string' ? actualKey : String(actualKey);
    }

    async getAll<K extends keyof AbelionSchema>(store: K) {
        const data = await this.load();
        // @ts-ignore
        return Object.values(data[store]);
    }

    async delete(store: keyof AbelionSchema, key: string) {
        const data = await this.load();
        // @ts-ignore
        delete data[store][key];
        await this.save();
    }

    async count(store: keyof AbelionSchema) {
        const data = await this.load();
        // @ts-ignore
        return Object.keys(data[store]).length;
    }

    async clear(store: keyof AbelionSchema) {
        const data = await this.load();
        // @ts-ignore
        data[store] = {};
        await this.save();
    }
}
