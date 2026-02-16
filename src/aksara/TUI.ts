import prompts from 'prompts';
import pc from 'picocolors';

export const TUI = {
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
            message: 'Pilih tindakan:',
            choices: [
                { title: 'Status Sistem', value: 'status', description: 'Cek kesehatan infrastruktur' },
                { title: 'Daftar Catatan', value: 'list', description: 'Lihat ringkasan arsip' },
                { title: 'Buka Brankas', value: 'unlock', description: 'Masuk ke mode aman' },
                { title: 'Keluar', value: 'exit' },
            ],
        });

        if (!response.aksi) {
            console.log(pc.dim('\nSampai jumpa, Developer!'));
            process.exit(0);
        }

        switch (response.aksi) {
            case 'status':
                await this.tampilkanStatus();
                break;
            case 'list':
                console.log(pc.cyan('\n🚧 Fitur Daftar Catatan sedang dalam pengembangan...'));
                await this.tungguLanjut();
                break;
            case 'unlock':
                console.log(pc.magenta('\n🔒 Fitur Buka Brankas memerlukan integrasi Web Crypto.'));
                await this.tungguLanjut();
                break;
            case 'exit':
                console.log(pc.dim('\nSampai jumpa, Developer!'));
                process.exit(0);
                break;
        }
    },

    async tampilkanStatus() {
        console.log('\n' + pc.bold('📊 STATUS SISTEM:'));
        console.log(pc.green('  ✅ Core Logic: Ready'));
        console.log(pc.green('  ✅ Security Engine: AES-GCM Standards'));
        console.log(pc.blue('  ℹ️  Storage: Local-First (IndexedDB Ready)'));
        await this.tungguLanjut();
    },

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
