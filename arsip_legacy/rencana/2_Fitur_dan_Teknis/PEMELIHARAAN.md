# 🚀 Perencanaan: DevOps & Pemeliharaan

## 1. Sistem Pembaruan (Update Automation)
**Tujuan:** Memastikan pengguna selalu mendapatkan fitur terbaru tanpa kehilangan data.
- **Deteksi Versi:** Membandingkan versi lokal dengan versi terbaru di server (melalui file `versi.json`).
- **Update Notification:** Popup rincian perubahan yang menarik (Changelog).
- **Hard Reload:** Tombol untuk membersihkan cache lama dan memuat versi baru secara paksa.

## 2. Manajemen Penyimpanan
**Tujuan:** Transparansi penggunaan memori dan performa aplikasi.
- **Analisis Kapasitas:** Menampilkan rincian apa saja yang memakan ruang (Catatan, Media, Cache, Service Worker).
- **Clear Cache:** Tombol untuk membersihkan data sementara tanpa menghapus catatan penting (IndexedDB).

## 3. Automasi Merge & Deploy
**Tujuan:** Alur pengembangan yang efisien.
- Menyiapkan script untuk mengotomatiskan update versi setiap kali ada perubahan besar yang digabungkan (merge).
