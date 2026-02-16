import { Gudang } from '@/aksara/Gudang';
import { Brankas } from '@/aksara/Brankas';
import { Note, EntityId } from '@/aksara/Rumus';
import { v4 as uuidv4 } from 'uuid';
import { Integritas } from '@/aksara/Integritas';

export const Arsip = {
    /**
     * Memeriksa apakah brankas sudah diinisialisasi dengan kata sandi.
     *
     * @returns Boolean yang menunjukkan status inisialisasi.
     */
    async isVaultInitialized(): Promise<boolean> {
        const validator = await Gudang.get('meta', 'auth_validator');
        return !!validator;
    },

    /**
     * Menyiapkan brankas dengan kata sandi utama.
     *
     * @param password - Kata sandi utama yang akan digunakan untuk enkripsi.
     * @returns Promise void.
     *
     * @example
     * await Arsip.setupVault('password_rahasia_123');
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
     * Membuka kunci brankas menggunakan kata sandi.
     *
     * @param password - Kata sandi utama.
     * @returns Boolean yang menunjukkan apakah pembukaan kunci berhasil.
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
     * Menyimpan atau memperbarui catatan dengan enkripsi otomatis.
     *
     * @param note - Objek catatan (tanpa updatedAt).
     * @returns Catatan yang telah disimpan dan dienkripsi.
     */
    async saveNote(note: Omit<Note, 'updatedAt'>): Promise<Note> {
        if (Brankas.isLocked()) {
            throw new Error('Vault is locked. Cannot save data.');
        }

        const noteWithId = {
            ...note,
            id: note.id || uuidv4(),
            createdAt: note.createdAt || new Date().toISOString(),
        } as Note;

        const checkHash = await Integritas.hitungHash(noteWithId);

        const existing = await Gudang.get("notes", note.id || "");
        if (existing && existing._hash === checkHash) {
            return existing;
        }

        const plainText = note.content
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
        const preview = plainText.substring(0, 100);

        const [secureTitle, secureContent, securePreview] = await Promise.all([
            Brankas.encryptPacked(note.title || 'Tanpa Judul'),
            Brankas.encryptPacked(note.content),
            Brankas.encryptPacked(preview)
        ]);

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
     * Mengambil semua catatan (Metadata didekripsi untuk UI).
     *
     * @returns Array berisi objek Note.
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
     * Mendekripsi bagian catatan tertentu sesuai permintaan & verifikasi integritas.
     *
     * @param note - Objek catatan terenkripsi.
     * @returns Catatan yang telah didekripsi.
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

    /**
     * Menghapus catatan secara permanen.
     *
     * @param id - ID unik catatan.
     */
    async deleteNote(id: EntityId) {
        await Gudang.delete('notes', id);
    },

    /**
     * Mendapatkan satu catatan berdasarkan ID.
     *
     * @param id - ID unik catatan.
     * @returns Objek Note atau undefined jika tidak ditemukan.
     */
    async getNoteById(id: EntityId): Promise<Note | undefined> {
        if (Brankas.isLocked()) throw new Error('Vault Locked');
        const note = await Gudang.get('notes', id) as Note;
        if (!note) return undefined;
        return this.decryptNote(note);
    },

    /**
     * Mendapatkan statistik jumlah catatan dan folder.
     *
     * @returns Objek statistik.
     */
    async getStats() {
        if (Brankas.isLocked()) return { notes: 0, folders: 0 };
        const notesCount = await Gudang.count('notes');
        const foldersCount = await Gudang.count('folders');
        return { notes: notesCount, folders: foldersCount };
    }
};
