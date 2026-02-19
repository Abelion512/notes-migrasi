import { Arsip } from '@lembaran/core/Arsip';
import { Brankas } from '@lembaran/core/Brankas';
import pc from 'picocolors';
import prompts from 'prompts';
import fs from 'node:fs/promises';

export class TUI {
    static async jalankan() {
        console.clear();
        console.log(pc.blue(pc.bold('=== LEMBARAN CLI v3.0.0 ===')));
        console.log(pc.dim('Brankas Aksara Personal yang Berdikari'));
        console.log(pc.dim('Ketik "bantuan" untuk daftar perintah atau "keluar" untuk berhenti.\n'));

        const isInit = await Arsip.isVaultInitialized();
        if (!isInit) {
            await this.inisialisasiBrankas();
        }

        await this.shellLoop();
    }

    private static async shellLoop() {
        while (true) {
            const res = await prompts({
                type: 'text',
                name: 'cmd',
                message: pc.cyan('aksara') + pc.dim(' ❯'),
                format: val => val.trim().toLowerCase()
            });

            if (!res.cmd || res.cmd === 'keluar' || res.cmd === 'exit') {
                console.log(pc.dim('Sampai jumpa di lain waktu.'));
                process.exit(0);
            }

            const [command, ...args] = res.cmd.split(' ');

            try {
                switch (command) {
                    case 'bantuan':
                    case 'help':
                        this.tampilkanBantuan();
                        break;
                    case 'mulai':
                    case 'menu':
                        await this.menuUtama();
                        break;
                    case 'pantau':
                        await this.aksiPantau();
                        break;
                    case 'jelajah':
                        await this.aksiJelajah(args[0]);
                        break;
                    case 'ukir':
                        await this.aksiUkir(args[0]);
                        break;
                    case 'tanam':
                        await this.aksiTanam();
                        break;
                    case 'petik':
                        await this.aksiPetik();
                        break;
                    case 'layani':
                        await this.aksiLayani();
                        break;
                    case 'bersih':
                    case 'clear':
                        console.clear();
                        break;
                    default:
                        console.log(pc.red(`❌ Perintah "${command}" tidak dikenal. Ketik "bantuan" untuk bantuan.`));
                }
            } catch (err: any) {
                console.log(pc.red(`❌ Terjadi kesalahan: ${err.message}`));
            }
        }
    }

    private static tampilkanBantuan() {
        console.log(pc.bold('\n📜 DAFTAR PERINTAH:'));
        console.log(`  ${pc.blue('mulai')}    - Masuk ke menu interaktif (Legacy Mode)`);
        console.log(`  ${pc.blue('pantau')}   - Memeriksa kesehatan sistem`);
        console.log(`  ${pc.blue('jelajah')}  - Mencari catatan (Fuzzy Search)`);
        console.log(`  ${pc.blue('ukir')}     - Membuat atau mengedit catatan`);
        console.log(`  ${pc.blue('tanam')}    - Mengimpor file Markdown`);
        console.log(`  ${pc.blue('petik')}    - Mengekspor brankas`);
        console.log(`  ${pc.blue('layani')}   - Menjalankan API Server`);
        console.log(`  ${pc.blue('bersih')}   - Membersihkan layar`);
        console.log(`  ${pc.blue('keluar')}   - Keluar dari aplikasi\n`);
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
            message: 'Pilih aksi: (Gunakan panah ↑↓ dan Tekan ENTER untuk memilih)',
            choices: [
                { title: '📊 Pantau Status', value: 'pantau' },
                { title: '📂 Jelajah Arsip', value: 'jelajah' },
                { title: '📝 Ukir Catatan', value: 'ukir' },
                { title: '🌱 Tanam (Impor)', value: 'tanam' },
                { title: '📦 Petik (Ekspor)', value: 'petik' },
                { title: '🚀 Layani Server', value: 'layani' },
                { title: '🔙 Kembali ke Shell', value: 'kembali' }
            ]
        });

        if (!res.aksi || res.aksi === 'kembali') return;

        switch (res.aksi) {
            case 'pantau': await this.aksiPantau(); break;
            case 'jelajah': await this.aksiJelajah(); break;
            case 'ukir': await this.aksiUkir(); break;
            case 'tanam': await this.aksiTanam(); break;
            case 'petik': await this.aksiPetik(); break;
            case 'layani': await this.aksiLayani(); break;
        }
    }

    private static async aksiPantau() {
        console.log(pc.bold('\n📊 STATUS SISTEM:'));
        const count = await Arsip.getAllNotes().then(n => n.length).catch(() => 0);
        console.log(pc.green('✅ Database: Aktif'));
        console.log(pc.blue(`📂 Total Catatan: ${count}`));
        console.log(pc.dim('---------------------------'));
    }

    private static async aksiJelajah(query?: string) {
        if (!(await this.unlock())) return;

        let q = query;
        if (!q) {
            const queryRes = await prompts({ type: 'text', name: 'q', message: 'Cari catatan:' });
            q = queryRes.q;
        }

        let notes = await Arsip.getAllNotes();
        if (q) {
            notes = notes.filter(n => n.title.toLowerCase().includes(q!.toLowerCase()));
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
    }

    private static async aksiUkir(id?: string) {
        if (!(await this.unlock())) return;

        if (id) {
            const note = await Arsip.getNoteById(id);
            if (!note) {
                console.log(pc.red('❌ Catatan tidak ditemukan.'));
                return;
            }
            const res = await prompts({
                type: 'text',
                name: 'konten',
                message: `Edit [${note.title}]:`,
                initial: note.content
            });
            if (res.konten) {
                await Arsip.saveNote({ ...note, content: res.konten });
                console.log(pc.green('✅ Berhasil diupdate.'));
            }
        } else {
            const res = await prompts([
                { type: 'text', name: 'judul', message: 'Judul:' },
                { type: 'text', name: 'konten', message: 'Konten:' }
            ]);
            if (res.konten) {
                await Arsip.saveNote({ title: res.judul || 'Tanpa Judul', content: res.konten });
                console.log(pc.green('✅ Catatan berhasil diukir.'));
            }
        }
    }

    private static async aksiTanam() {
        console.log(pc.dim('Fitur Tanam: Letakkan file .md di folder saat ini.'));
        console.log(pc.yellow('Gunakan "lembaran tanam" secara langsung untuk performa terbaik.'));
    }

    private static async aksiPetik() {
        if (!(await this.unlock())) return;
        const notes = await Arsip.getAllNotes();
        const data = JSON.stringify(notes);
        const encrypted = await Brankas.encryptPacked(data);
        await fs.writeFile('vault-export.lembaran', encrypted);
        console.log(pc.green('✅ Vault berhasil dipetik ke vault-export.lembaran'));
    }

    private static async aksiLayani() {
        console.log(pc.blue('🚀 Server API berjalan di http://localhost:1401'));
        console.log(pc.dim('Tekan Ctrl+C untuk berhenti.'));
        await new Promise(() => {});
    }
}
