import { Gudang } from '@/aksara/Gudang';
import { Brankas } from '@/aksara/Brankas';
import { Note, EntityId } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
        // Generate random salt
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

        // Derive key with Argon2id
        const key = await Brankas.deriveKey(password, salt);

        // Create validator
        const validator = 'ABELION_SECURED_V2';
        const encryptedValidator = await Brankas.encrypt(validator, key);

        // Store validator and salt
        const ivHex = Array.from(encryptedValidator.iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(encryptedValidator.data)));

        await Gudang.set('meta', 'auth_salt', saltHex);
        await Gudang.set('meta', 'auth_validator', `${ivHex}|${base64Data}`);

        // Set as active session
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

            // Reconstruct salt
            const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

            // Reconstruct validator
            const [ivHex, base64Data] = packedValidator.split('|');
            const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Derive key from input
            const key = await Brankas.deriveKey(password, salt);

            // Try to decrypt
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

        const encrypted = await Brankas.encrypt(note.content);
        const ivHex = Array.from(encrypted.iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(encrypted.data)));
        const secureContent = `${ivHex}|${base64Data}`;

        const finalNote: Note = {
            ...note,
            content: secureContent,
            updatedAt: new Date().toISOString(),
        };

        if (!finalNote.id) {
            finalNote.id = uuidv4();
            finalNote.createdAt = new Date().toISOString();
        }

        await Gudang.set('notes', finalNote.id, finalNote);
        return finalNote;
    },

    /**
     * Retrieve all notes and decrypt them
     */
    async getAllNotes(): Promise<Note[]> {
        if (Brankas.isLocked()) {
            throw new Error('Vault is locked. Cannot retrieve data.');
        }

        const rawNotes = await Gudang.getAll('notes') as Note[];

        const decryptedNotes = await Promise.all(rawNotes.map(async (note) => {
            try {
                if (!note.content.includes('|')) return note;

                const [ivHex, base64Data] = note.content.split('|');
                const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const decryptedContent = await Brankas.decrypt(bytes.buffer, iv);

                return {
                    ...note,
                    content: decryptedContent
                };
            } catch (err) {
                console.error(`Failed to decrypt note ${note.id}:`, err);
                return {
                    ...note,
                    content: '⚠️ Decryption Failed (Incorrect Key or Corrupted Data)',
                };
            }
        }));

        return decryptedNotes.sort((a: Note, b: Note) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    },

    async deleteNote(id: EntityId) {
        // Secure Deletion logic: Overwrite then delete
        const note = await Gudang.get('notes', id) as Note;
        if (note) {
            const junk = crypto.getRandomValues(new Uint8Array(note.content.length));
            const junkString = btoa(String.fromCharCode(...junk));
            await Gudang.set('notes', id, { ...note, content: junkString, title: 'DELETED' });
        }
        await Gudang.delete('notes', id);
    },

    async getNoteById(id: EntityId): Promise<Note | undefined> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');

        const note = await Gudang.get('notes', id) as Note;
        if (!note) return undefined;

        try {
            if (!note.content.includes('|')) return note;

            const [ivHex, base64Data] = note.content.split('|');
            const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const decryptedContent = await Brankas.decrypt(bytes.buffer, iv);
            return { ...note, content: decryptedContent };
        } catch (e) {
            console.error(e);
            return { ...note, content: 'Error Decrypting' };
        }
    },

    async getStats() {
        if (Brankas.isLocked()) return { notes: 0, folders: 0 };
        const notesCount = await Gudang.count('notes');
        const foldersCount = await Gudang.count('folders');
        return {
            notes: notesCount,
            folders: foldersCount
        };
    }
};
