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

# 📔 Log Pengembangan - 7 Februari 2026

## 🛠️ Perubahan Hari Ini

### 1. Migrasi dan Perbaikan Lint (Standardisasi Kode)
- Membersihkan seluruh peringatan dan kesalahan lint di direktori `src` dan `arsip_legacy`.
- Menerapkan pola `_unused` untuk variabel yang tidak digunakan agar tetap sesuai dengan aturan ESLint.
- Memperbarui `eslint.config.mjs` untuk mendukung pengecekan variabel dengan awalan garis bawah.

### 2. Optimasi Komponen React (Next.js 15+)
- Refaktorisasi `DialogEditor.tsx`: Menghapus pemanggilan `setState` di dalam `useEffect` yang menyebabkan render berjenjang. Menggunakan pola `key` prop pada komponen induk untuk reset state secara otomatis.
- Migrasi tag `<img>` ke komponen `next/image` pada halaman Biodata untuk optimasi pemuatan gambar (LCP).

### 3. Pembaruan Dokumentasi (Bilingual)
- Menulis ulang `README.md` dengan format dua bahasa (Bahasa Indonesia Baku & Bahasa Inggris).
- Menambahkan file `SARAN.md` yang berisi peta jalan (roadmap) teknis untuk peningkatan UI/UX (Glassmorphism lanjutan) dan Keamanan (Enkripsi Zero-Knowledge).

### 4. Pengarsipan Memori Agent
- Membuat `PEDOMAN_AGENT_JULES.md` sebagai repositori pengetahuan mengenai arsitektur, pola desain, dan aturan pengembangan proyek Abelion Notes.

---
*Status: Sistem dasar telah stabil dan siap untuk pengembangan fitur keamanan tingkat lanjut.*
