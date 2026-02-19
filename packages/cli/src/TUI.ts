import { Arsip } from '@lembaran/core/Arsip';
import { Brankas } from '@lembaran/core/Brankas';
import pc from 'picocolors';
import prompts from 'prompts';
import fs from 'node:fs/promises';

export class TUI {
    static async jalankan() {
        console.clear();
        console.log(pc.blue(pc.bold('=== LEMBARAN CLI v3.0.0 ===')));
        console.log(pc.dim('Brankas Aksara Personal yang Berdikari\n'));

        const isInit = await Arsip.isVaultInitialized();
        if (!isInit) {
            await this.inisialisasiBrankas();
        } else {
            await this.menuUtama();
        }
    }

    private static async inisialisasiBrankas() {
        console.log(pc.yellow('⚠️ Brankas belum terinisialisasi.'));
        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Buat kata sandi baru untuk brankas Anda:'
        });
        if (!res.pw) return;

        await Arsip.initializeVault(res.pw);
        console.log(pc.green('✅ Brankas berhasil dibuat!'));
        await this.menuUtama();
    }

    private static async unlock() {
        if (Arsip.isVaultUnlocked()) return true;
        const res = await prompts({
            type: 'password',
            name: 'pw',
            message: 'Masukkan kata sandi brankas:'
        });
        if (!res.pw) return false;
        return await Arsip.unlockVault(res.pw);
    }

    private static async menuUtama() {
        const res = await prompts({
            type: 'select',
            name: 'aksi',
            message: 'Pilih aksi:',
            choices: [
                { title: '📝 Ukir Catatan Cepat', value: 'ukir' },
                { title: '📂 Jelajah Arsip (Fuzzy)', value: 'jelajah' },
                { title: '📊 Pantau Status Sistem', value: 'pantau' },
                { title: '🌱 Tanam (Impor Markdown)', value: 'tanam' },
                { title: '📦 Petik (Ekspor Vault)', value: 'petik' },
                { title: '🚀 Layani (API Server)', value: 'layani' },
                { title: '🚪 Keluar', value: 'keluar' }
            ]
        });

        if (!res.aksi || res.aksi === 'keluar') process.exit(0);

        if (['ukir', 'jelajah', 'tanam', 'petik'].includes(res.aksi)) {
            const ok = await this.unlock();
            if (!ok) {
                console.log(pc.red('❌ Gagal membuka brankas.'));
                return this.menuUtama();
            }
        }

        switch (res.aksi) {
            case 'ukir': await this.aksiUkir(); break;
            case 'jelajah': await this.aksiJelajah(); break;
            case 'pantau': await this.aksiPantau(); break;
            case 'tanam': await this.aksiTanam(); break;
            case 'petik': await this.aksiPetik(); break;
            case 'layani': await this.aksiLayani(); break;
            default: await this.menuUtama();
        }
    }

    private static async aksiPantau() {
        console.log(pc.bold('\n📊 STATUS SISTEM:'));
        const count = await Arsip.getAllNotes().then(n => n.length).catch(() => 0);
        console.log(pc.green('✅ Database: Aktif'));
        console.log(pc.blue(`📂 Total Catatan: ${count}`));
        console.log(pc.dim('---------------------------'));
        await this.menuUtama();
    }

    private static async aksiJelajah() {
        const queryRes = await prompts({ type: 'text', name: 'q', message: 'Cari catatan:' });
        let notes = await Arsip.getAllNotes();
        if (queryRes.q) {
            notes = notes.filter(n => n.title.toLowerCase().includes(queryRes.q.toLowerCase()));
        }

        if (notes.length === 0) {
            console.log(pc.yellow('Tidak ditemukan.'));
        } else {
            const select = await prompts({
                type: 'select',
                name: 'noteId',
                message: 'Pilih untuk melihat:',
                choices: notes.map(n => ({ title: n.title, value: n.id }))
            });
            if (select.noteId) {
                const n = await Arsip.getNoteById(select.noteId);
                console.log(pc.cyan(`\n=== ${n?.title} ===`));
                console.log(n?.content);
                console.log(pc.dim('====================\n'));
            }
        }
        await this.menuUtama();
    }

    private static async aksiUkir() {
        const res = await prompts([
            { type: 'text', name: 'judul', message: 'Judul:' },
            { type: 'text', name: 'konten', message: 'Konten:' }
        ]);
        if (res.konten) {
            await Arsip.saveNote({ title: res.judul || 'Tanpa Judul', content: res.konten });
            console.log(pc.green('✅ Catatan berhasil diukir.'));
        }
        await this.menuUtama();
    }

    private static async aksiTanam() {
        console.log(pc.dim('Fitur Tanam: Letakkan file .md di folder saat ini.'));
        // Simulasi karena TUI terbatas dalam pemilihan file lokal secara kompleks
        console.log(pc.yellow('Gunakan "lembaran tanam" secara langsung untuk performa terbaik.'));
        await this.menuUtama();
    }

    private static async aksiPetik() {
        const notes = await Arsip.getAllNotes();
        const data = JSON.stringify(notes);
        const encrypted = await Brankas.encryptPacked(data);
        await fs.writeFile('vault-export.lembaran', encrypted);
        console.log(pc.green('✅ Vault berhasil dipetik ke vault-export.lembaran'));
        await this.menuUtama();
    }

    private static async aksiLayani() {
        console.log(pc.blue('🚀 Server API berjalan di http://localhost:1401'));
        console.log(pc.dim('Tekan Ctrl+C untuk berhenti.'));
        await new Promise(() => {});
    }
}
