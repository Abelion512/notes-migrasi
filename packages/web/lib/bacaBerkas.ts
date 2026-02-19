import fs from 'fs';
import path from 'path';

export function bacaBerkas(namaBerkas: string): string | null {
    const cwd = process.cwd();

    // Daftar lokasi potensial
    const lokasi = [
        path.join(cwd, namaBerkas),
        path.join(cwd, '..', '..', namaBerkas),
        path.join(cwd, 'packages', 'web', namaBerkas),
        // Tambahan untuk Vercel standalone
        path.join(cwd, '.next', 'standalone', namaBerkas),
        path.join(cwd, '..', '..', '..', namaBerkas),
    ];

    for (const p of lokasi) {
        if (fs.existsSync(p)) {
            try {
                return fs.readFileSync(p, 'utf8');
            } catch (e) {
                console.error(`Gagal membaca ${p}:`, e);
            }
        }
    }

    return null;
}
