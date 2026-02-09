
import { gudang, GudangZustand } from './Gudang';

/**
 * Memindahkan data dari localStorage (abelion-storage) ke IndexedDB (GudangAbelion).
 * Setelah berhasil, data di localStorage akan dihapus.
 * @returns {Promise<boolean>} true jika migrasi dilakukan, false jika tidak.
 */
export async function migrasiLocalStorageKeIndexedDB(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;

  const localData = localStorage.getItem('abelion-storage');
  if (!localData) return false;

  try {
    // Verifikasi apakah IndexedDB kosong
    const [catatanCount, folderCount] = await Promise.all([
      gudang.catatan.count(),
      gudang.folder.count()
    ]);

    // Hanya migrasi jika IndexedDB benar-benar kosong untuk menghindari konflik
    if (catatanCount === 0 && folderCount === 0) {
      console.log('[Migrasi] Data ditemukan di localStorage dan IndexedDB kosong. Memulai migrasi...');

      // Simpan data ke IndexedDB menggunakan logika setItem yang ada (untuk hashing dsb)
      await GudangZustand.setItem('abelion-storage', localData);

      // Verifikasi kembali setelah simpan
      const newCatatanCount = await gudang.catatan.count();
      const newFolderCount = await gudang.folder.count();

      if (newCatatanCount > 0 || newFolderCount > 0) {
        console.log(`[Migrasi] Berhasil memigrasi ${newCatatanCount} catatan dan ${newFolderCount} folder.`);
        localStorage.removeItem('abelion-storage');
        return true;
      }
    } else {
      // Jika IndexedDB sudah berisi data, kita anggap migrasi sudah tidak diperlukan
      // Hapus localStorage untuk membersihkan residu
      console.log('[Migrasi] IndexedDB sudah memiliki data. Membersihkan localStorage...');
      localStorage.removeItem('abelion-storage');
    }
  } catch (error) {
    console.error('[Migrasi] Gagal menjalankan migrasi:', error);
  }

  return false;
}
