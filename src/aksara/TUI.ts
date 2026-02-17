import prompts from 'prompts';
import pc from 'picocolors';

export const TUI = {
    /**
     * Menjalankan antarmuka terminal interaktif (TUI).
     *
     * @returns Promise void.
     *
     * @example
     * await TUI.jalankan();
     */
    async jalankan() {
        console.clear();
        console.log(pc.blue(pc.bold('🏛️  ABELION NOTES - MANAGEMENT TUI')));
        console.log(pc.dim('------------------------------------'));
        console.log(pc.yellow('App ini berfungsi menyimpan credentials.'));
        console.log(pc.yellow('Saran: Gunakan aplikasi ini secara efektif sebagai developer.'));
        console.log('');

        const response = await prompts({
            type: 'select',
            name: 'aksi',
            message: 'Pilih tindakan (Gunakan panah ↑↓ dan Tekan ENTER):',
            choices: [
                { title: 'Status Sistem', value: 'pantau', description: 'Cek kesehatan infrastruktur' },
                { title: 'Daftar  Catatan', value: 'jelajah', description: 'Lihat ringkasan arsip' },
                { title: 'Buka Brankas', value: 'kuncung', description: 'Masuk ke mode aman' },
                { title: 'Keluar', value: 'exit' },
            ],
        });

        if (!response.aksi) {
            console.log(pc.dim('\nSampai jumpa, Developer!'));
            process.exit(0);
        }

        switch (response.aksi) {
            case 'pantau':
                await this.tampilkanStatus();
                break;
            case 'jelajah':
                console.log(pc.cyan('\n🚧 Fitur Daftar Catatan sedang dalam pengembangan...'));
                await this.tungguLanjut();
                break;
            case 'kuncung':
                console.log(pc.magenta('\n🔒 Fitur Buka Brankas memerlukan integrasi Web Crypto.'));
                await this.tungguLanjut();
                break;
            case 'exit':
                console.log(pc.dim('\nSampai jumpa, Developer!'));
                process.exit(0);
                break;
        }
    },

    /**
     * Menampilkan status kesehatan sistem di terminal.
     */
    async tampilkanStatus() {
        console.log('\n' + pc.bold('📊 STATUS SISTEM:'));
        console.log(pc.green('  ✅ Core Logic: Ready'));
        console.log(pc.green('  ✅ Security Engine: AES-GCM Standards'));
        console.log(pc.blue('  ℹ️  Storage: Local-First (IndexedDB Ready)'));
        await this.tungguLanjut();
    },

    /**
     * Menunggu input ENTER dari pengguna sebelum kembali ke menu utama.
     */
    async tungguLanjut() {
        console.log('');
        await prompts({
            type: 'text',
            name: 'lanjut',
            message: pc.dim('Tekan ENTER untuk kembali ke menu...'),
        });
        await this.jalankan();
    }
};
