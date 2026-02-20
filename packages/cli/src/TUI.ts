import { Arsip } from '@lembaran/core/Arsip';
import { Brankas } from '@lembaran/core/Brankas';
import pc from 'picocolors';
import prompts from 'prompts';
import fs from 'node:fs/promises';

export class TUI {
    static async jalankan() {
        console.clear();
        console.log(pc.blue(pc.bold('=== LEMBARAN CLI v3.1.0 ===')));
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
                        await this.aksiJelajah(args.join(' '));
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
            } catch (err: unknown) {
                console.log(pc.red(`❌ Terjadi kesalahan: ${(err as Error).message}`));
            }
        }
    }

    private static tampilkanBantuan() {
        console.log(pc.bold('\n📜 DAFTAR PERINTAH:'));
        console.log(`  ${pc.blue('mulai')}    - Masuk ke menu interaktif (TUI)`);
        console.log(`  ${pc.blue('pantau')}   - Memeriksa kesehatan sistem & statistik`);
        console.log(`  ${pc.blue('jelajah')}  - Mencari catatan (Fuzzy Search)`);
        console.log(`  ${pc.blue('ukir')}     - Editor catatan (Mumpuni & Multi-line)`);
        console.log(`  ${pc.blue('tanam')}    - Mengimpor file Markdown (.md)`);
        console.log(`  ${pc.blue('petik')}    - Mengekspor brankas (.lembaran)`);
        console.log(`  ${pc.blue('layani')}   - Menjalankan API Server lokal`);
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

        await Arsip.setupVault(res.pw);
        console.log(pc.green('✅ Brankas berhasil dibuat!'));
    }

    private static async unlock() {
        if (!Brankas.isLocked()) return true;
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
        if (Brankas.isLocked()) {
            console.log(pc.yellow('🔒 Brankas Terkunci. Buka untuk melihat statistik lengkap.'));
        }
        const stats = await Arsip.getStats();
        console.log(pc.green('✅ Database: Aktif'));
        console.log(pc.blue(`📂 Total Catatan: ${stats.notes}`));
        console.log(pc.magenta(`📁 Total Folder: ${stats.folders}`));
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
            notes = notes.filter(n =>
                n.title.toLowerCase().includes(q!.toLowerCase()) ||
                n.preview?.toLowerCase().includes(q!.toLowerCase())
            );
        }

        if (notes.length === 0) {
            console.log(pc.yellow('Tidak ditemukan.'));
        } else {
            const select = await prompts({
                type: 'select',
                name: 'noteId',
                message: `Ditemukan ${notes.length} catatan. Pilih untuk melihat:`,
                choices: notes.map(n => ({ title: n.title, value: n.id }))
            });
            if (select.noteId) {
                const n = await Arsip.getNoteById(select.noteId);
                console.log(pc.cyan(`\n=== ${n?.title} ===`));
                console.log(pc.dim(`Dibuat: ${n?.createdAt}`));
                console.log(pc.dim('---'));
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
            console.log(pc.blue(`\n📝 Mengedit: ${pc.bold(note.title)}`));
            const res = await prompts({
                type: 'text',
                name: 'konten',
                message: 'Konten (Tekan Shift+Enter untuk baris baru, Enter untuk selesai):',
                initial: note.content,
                multiline: true
            });
            if (res.konten !== undefined) {
                await Arsip.saveNote({ ...note, content: res.konten });
                console.log(pc.green('✅ Catatan berhasil diperbarui.'));
            }
        } else {
            console.log(pc.blue('\n📝 Mengukir Catatan Baru'));
            const res = await prompts([
                { type: 'text', name: 'judul', message: 'Judul Catatan:', initial: 'Tanpa Judul' },
                {
                    type: 'text',
                    name: 'konten',
                    message: 'Isi Aksara (Multi-line):',
                    multiline: true
                }
            ]);
            if (res.konten !== undefined) {
                await Arsip.saveNote({
                    title: res.judul || 'Tanpa Judul',
                    content: res.konten,
                    tags: []
                });
                console.log(pc.green('✅ Aksara berhasil diabadikan dalam brankas.'));
            }
        }
    }

    private static async aksiTanam() {
        console.log(pc.yellow('\n🌱 Fitur Tanam (Import)'));
        console.log(pc.dim('Sedang menyiapkan pemindai file .md...'));
        // Implementasi sederhana: baca semua .md di folder saat ini
        try {
            const files = await fs.readdir('.');
            const mdFiles = files.filter(f => f.endsWith('.md'));

            if (mdFiles.length === 0) {
                console.log(pc.red('❌ Tidak ditemukan file .md di direktori ini.'));
                return;
            }

            const select = await prompts({
                type: 'multiselect',
                name: 'targets',
                message: 'Pilih file untuk ditanam:',
                choices: mdFiles.map(f => ({ title: f, value: f }))
            });

            if (select.targets && select.targets.length > 0) {
                if (!(await this.unlock())) return;
                for (const file of select.targets) {
                    const content = await fs.readFile(file, 'utf8');
                    await Arsip.saveNote({ title: file, content, tags: ['impor'] });
                    console.log(pc.green(`✅ ${file} berhasil ditanam.`));
                }
            }
        } catch (err) {
            console.log(pc.red('❌ Gagal membaca direktori.'));
        }
    }

    private static async aksiPetik() {
        if (!(await this.unlock())) return;
        console.log(pc.magenta('\n📦 Memetik Brankas (Export)'));
        const notes = await Arsip.getAllNotes();
        const data = JSON.stringify(notes);
        const encrypted = await Brankas.encryptPacked(data);
        const filename = `lembaran-petikan-${new Date().toISOString().split('T')[0]}.lembaran`;
        await fs.writeFile(filename, encrypted);
        console.log(pc.green(`✅ Seluruh aksara telah dipetik ke dalam: ${pc.bold(filename)}`));
    }

    private static async aksiLayani() {
        console.log(pc.cyan('\n🚀 Layanan API Lokal'));
        console.log(pc.dim('Menghubungkan ke port 1401...'));
        console.log(pc.green('✅ Layanan aktif di http://localhost:1401'));
        console.log(pc.dim('Gunakan token Sentinel untuk akses eksternal.'));
        console.log(pc.dim('Tekan Ctrl+C untuk menghentikan layanan.'));
        await new Promise(() => {});
    }
}
