import { Gudang } from '@/aksara/Gudang';
import { Brankas } from '@/aksara/Brankas';
import { Note, EntityId } from '@/aksara/Rumus';
import { v4 as uuidv4 } from 'uuid';
import { Integritas } from '@/aksara/Integritas';

export const Arsip = {
    /**
     * Check if the vault has been set up with a password
     */
    async isVaultInitialized(): Promise<boolean> {
        const validator = await Gudang.get('meta', 'auth_validator');
        return !!validator;
    },

    /**
     * Set up the vault with a master password
     */
    async setupVault(password: string): Promise<void> {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

        const key = await Brankas.deriveKey(password, salt);
        const validator = 'ABELION_SECURED_V2';
        const encryptedValidator = await Brankas.encrypt(validator, key);

        const ivHex = Array.from(encryptedValidator.iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(encryptedValidator.data)));

        await Gudang.set('meta', 'auth_salt', saltHex);
        await Gudang.set('meta', 'auth_validator', `${ivHex}|${base64Data}`);

        Brankas.setActiveKey(key);
    },

    /**
     * Unlock the vault
     */
    async unlockVault(password: string): Promise<boolean> {
        try {
            const saltHex = await Gudang.get('meta', 'auth_salt') as string;
            const packedValidator = await Gudang.get('meta', 'auth_validator') as string;

            if (!saltHex || !packedValidator) return false;

            const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const [ivHex, base64Data] = packedValidator.split('|');
            const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const key = await Brankas.deriveKey(password, salt);
            const decrypted = await Brankas.decrypt(bytes.buffer, iv, key);

            if (decrypted === 'ABELION_SECURED_V2') {
                Brankas.setActiveKey(key);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Unlock failed', e);
            return false;
        }
    },

    /**
     * Create or Update a note with automatic encryption
     */
    async saveNote(note: Omit<Note, 'updatedAt'>): Promise<Note> {
        if (Brankas.isLocked()) {
            throw new Error('Vault is locked. Cannot save data.');
        }

        const checkHash = await Integritas.hitungHash(note);

        // Check if we actually need to save (Compare decrypted content hash)
        const existing = await Gudang.get("notes", note.id || "");
        if (existing && existing._hash === checkHash) {
            return existing;
        }

        // Generate plain-text preview before encryption for performance in list views
        // Strips HTML tags and replaces common entities
        const plainText = note.content
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
        const preview = plainText.substring(0, 100);

        // Encrypt main content
        const encrypted = await Brankas.encrypt(note.content);
        const ivHex = Array.from(encrypted.iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(encrypted.data)));
        const secureContent = `${ivHex}|${base64Data}`;

        // Encrypt credential fields if they exist
        let secureKredensial = note.kredensial;
        if (note.kredensial) {
            const credString = JSON.stringify(note.kredensial);
            const encCred = await Brankas.encrypt(credString);
            const credIvHex = Array.from(encCred.iv).map(b => b.toString(16).padStart(2, '0')).join('');
            const credBase64 = btoa(String.fromCharCode(...new Uint8Array(encCred.data)));
            (secureKredensial as any) = `${credIvHex}|${credBase64}`;
        }

        const finalNote: Note = {
            ...note,
            content: secureContent,
            preview: preview,
            kredensial: secureKredensial,
            updatedAt: new Date().toISOString(),
            _hash: checkHash,
        };

        if (!finalNote.id) {
            finalNote.id = uuidv4();
            finalNote.createdAt = new Date().toISOString();
        }

        await Gudang.set('notes', finalNote.id, finalNote);
        return finalNote;
    },

    /**
     * Retrieve all notes (Content remains encrypted for performance)
     */
    async getAllNotes(): Promise<Note[]> {
        if (Brankas.isLocked()) {
            throw new Error('Vault is locked.');
        }
        const rawNotes = await Gudang.getAll('notes') as Note[];
        // Optimization: Use a more direct sort if possible, but updatedAt is ISO string so this is fine.
        return rawNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    /**
     * Decrypt specific note parts on-demand
     */
    async decryptNote(note: Note): Promise<Note> {
        try {
            let decryptedContent = note.content;
            if (note.content.includes('|')) {
                const parts = note.content.split('|');
                if (parts.length === 2) {
                    const [ivHex, base64Data] = parts;
                    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    decryptedContent = await Brankas.decrypt(bytes.buffer, iv);
                }
            }

            let decryptedCreds = note.kredensial;
            if (typeof note.kredensial === 'string' && (note.kredensial as any as string).includes('|')) {
                const parts = (note.kredensial as string).split('|');
                if (parts.length === 2) {
                    const [ivHex, base64Data] = parts;
                    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const credString = await Brankas.decrypt(bytes.buffer, iv);
                    decryptedCreds = JSON.parse(credString);
                }
            }

            return {
                ...note,
                content: decryptedContent,
                kredensial: decryptedCreds as any
            };
        } catch (err) {
            console.error('Decryption failed', err);
            return {
                ...note,
                content: '⚠️ Gagal Dekripsi Data'
            };
        }
    },

    async deleteNote(id: EntityId) {
        await Gudang.delete('notes', id);
    },

    async getNoteById(id: EntityId): Promise<Note | undefined> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');
        const note = await Gudang.get('notes', id) as Note;
        if (!note) return undefined;
        return this.decryptNote(note);
    },

    async getStats() {
        if (Brankas.isLocked()) return { notes: 0, folders: 0 };
        const notesCount = await Gudang.count('notes');
        const foldersCount = await Gudang.count('folders');
        return { notes: notesCount, folders: foldersCount };
    }
};
