# 📔 Log Pengembangan - 6 Februari 2026

## 🛠️ Perubahan Hari Ini

### 1. Sistem Folder Bertingkat (Nested Folders)
- Mengaktifkan dukungan `parentId` pada folder.
- Memperbarui UI `utama.js` untuk merender folder secara hierarkis dengan indentasi.
- Menambahkan tombol "+" di bagian folder untuk memudahkan pembuatan folder baru.

### 2. Editor Rich Text (Markdown)
- Integrasi `marked.js` untuk rendering Markdown yang lebih akurat.
- Menambahkan fitur **Live Preview** (Tab Pratinjau) pada editor modal.
- Tetap mempertahankan dukungan WikiLinks `[[Link]]`.

### 3. Gamifikasi: CRUD Hari Spesial
- Menambahkan kemampuan pengguna untuk menambahkan "Hari Spesial" kustom (misal: Ulang Tahun, Hari Jadi).
- Memberikan bonus XP otomatis jika pengguna menulis pada hari tersebut.
- UI manajemen hari spesial ditambahkan di halaman Edit Profil.

### 4. Pencarian Global & Stabilitas
- Memperbaiki bug di mana catatan yang baru dibuat tidak langsung muncul di pencarian sebelum halaman dimuat ulang.
- Menambahkan logika pembersihan otomatis (auto-purge) untuk Sampah (Trash) yang berusia lebih dari 30 hari.

### 5. Dokumentasi
- Membuat `rencana/dokumen/ALUR_KERJA_CRUD.md` untuk menjelaskan arsitektur penyimpanan data.

---
*Status: Fase 2 Roadmap Abelion hampir selesai.*
