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

        // Ensure ID and timestamps are present before hashing for consistency
        const noteWithId = {
            ...note,
            id: note.id || uuidv4(),
            createdAt: note.createdAt || new Date().toISOString(),
        } as Note;

        const checkHash = await Integritas.hitungHash(noteWithId);

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

        // Encrypt everything
        const [secureTitle, secureContent, securePreview] = await Promise.all([
            Brankas.encryptPacked(note.title || 'Tanpa Judul'),
            Brankas.encryptPacked(note.content),
            Brankas.encryptPacked(preview)
        ]);

        // Encrypt credential fields if they exist
        let secureKredensial = note.kredensial;
        if (note.kredensial) {
            secureKredensial = await Brankas.encryptPacked(JSON.stringify(note.kredensial)) as any;
        }

        const finalNote: Note = {
            ...noteWithId,
            title: secureTitle,
            content: secureContent,
            preview: securePreview,
            kredensial: secureKredensial,
            updatedAt: new Date().toISOString(),
            _hash: checkHash,
        };

        await Gudang.set('notes', finalNote.id, finalNote);
        return finalNote;
    },

    /**
     * Retrieve all notes (Metadata is decrypted for UI)
     */
    async getAllNotes(): Promise<Note[]> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');
        const rawNotes = await Gudang.getAll('notes') as Note[];
        const decrypted = await Promise.all(rawNotes.map(async n => {
            try {
                return {
                    ...n,
                    title: await Brankas.decryptPacked(n.title),
                    preview: await Brankas.decryptPacked(n.preview || '')
                };
            } catch (e) {
                return { ...n, title: '🔒 Terkunci', preview: '🔒 Terkunci' };
            }
        }));
        return decrypted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    /**
     * Decrypt specific note parts on-demand & verify integrity
     */
    async decryptNote(note: Note): Promise<Note> {
        try {
            const [title, content, credsRaw] = await Promise.all([
                Brankas.decryptPacked(note.title),
                Brankas.decryptPacked(note.content),
                typeof note.kredensial === 'string' ? Brankas.decryptPacked(note.kredensial) : null
            ]);

            const decryptedNote = {
                ...note,
                title,
                content,
                kredensial: credsRaw ? JSON.parse(credsRaw) : note.kredensial
            };

            // VERIFIKASI INTEGRITAS (SEGEL DIGITAL)
            if (note._hash) {
                const actualHash = await Integritas.hitungHash(decryptedNote);
                if (actualHash !== note._hash) {
                    console.warn('Integritas data rusak pada catatan:', note.id);
                    decryptedNote.content = `⚠️ PERINGATAN: Segel digital rusak! Data ini mungkin telah dimanipulasi secara tidak sah.\n\n` + decryptedNote.content;
                }
            }

            return decryptedNote;
        } catch (err) {
            console.error('Decryption failed', err);
            return { ...note, content: '⚠️ Gagal Dekripsi Data' };
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
