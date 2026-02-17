# Lembaran - Agent Guidelines

## Overview
**Lembaran** adalah platform arsip digital personal yang aman, berbasis *local-first*, dengan fokus pada kedaulatan data dan pengalaman pengguna premium terinspirasi dari iOS 18.

## 🏛️ Arsitektur & Penamaan (Poetic Indonesian)
Proyek ini mengikuti konvensi penamaan 'Indonesia Puitis' untuk logika inti:
- `src/aksara`: Logika inti, penyimpanan, dan utilitas (Jiwa aplikasi).
- `src/komponen`: Komponen UI dan fitur (Tubuh aplikasi).
- `Arsip.ts`: Manajer enkripsi dan operasi basis data tingkat tinggi.
- `Brankas.ts`: Mesin kriptografi (AES-GCM & Argon2id).
- `Gudang.ts`: Abstraksi IndexedDB.
- `Pundi.ts`: State management global (Zustand).

## 🔒 Keamanan & Integritas Data (Sentinel Standard)
1. **Enkripsi Sisi Klien**: Menggunakan AES-GCM 256-bit. `Brankas.ts` menyediakan metode `encryptPacked` dan `decryptPacked` untuk menangani IV dan ciphertext (format: `ivHex|base64`).
2. **Key Derivation**: Menggunakan Argon2id dengan salt unik.
3. **Segel Digital**: Dikelola oleh `Integritas.ts`. Hash SHA-256 dihitung untuk setiap catatan (mengecualikan metadata) untuk mendeteksi manipulasi data ilegal.
4. **Mnemonic Recovery**: Pembuatan kunci pemulihan (12 kata) wajib menggunakan `generateMnemonic()` yang ditenagai oleh `window.crypto.getRandomValues()`.
5. **Validasi Sandi**: Kata sandi utama wajib minimal 8 karakter.
6. **Auto-Lock**: Dikelola oleh `Penjaga.ts`, mengunci brankas secara otomatis saat tab tidak aktif (visibility hidden) dengan delay tertentu.

## ✨ Fitur Cerdas & UI Premium
1. **Penyamaran Gmail**: Mode rahasia yang mengubah judul tab menjadi 'Gmail - Inbox (1)', memperbarui favicon Google, dan menampilkan layar kunci mock login Gmail.
2. **Penyusun Catatan (AI)**: Integrasi on-device LLM via `Pujangga.ts` untuk ringkasan catatan instan.
3. **Saran Layanan**: `SaranLayanan.tsx` memberikan saran ikon dan domain secara real-time dari 70+ kunci dalam `MAP_LAYANAN`.
4. **Tempel Pintar**: `PenyusunKredensial.tsx` dapat mengurai data berlabel (User: Pass:), URL, dan kredensial multiline dari clipboard.
5. **Navigasi Terpadu**: Menggunakan Bottom Navigation berbentuk pill (`KemudiBawah.tsx`) yang konsisten di seluruh perangkat. FAB (Floating Action Button) menggunakan rotasi 45 derajat saat menu terbuka.
6. **Perayaan XP**: Efek konfeti berbasis Framer Motion (`PerayaanXP.tsx`) saat pengguna mencapai milestone tertentu.
7. **NLP Tanggal**: Ekstensi Tiptap (`EkstensiTanggalCerdas.ts`) untuk parsing tanggal berbasis bahasa alami (contoh: @besok, @lusa).

## 🛠️ Konvensi Coding
1. **Type Safety**: Gunakan `unknown` daripada `any` untuk keamanan tipe data yang lebih ketat.
2. **Autosave**: Mekanisme autosave 2 detik (debounced) dengan deteksi perubahan berbasis hash.
3. **Responsive Layout**: Gunakan `min-h-0` pada halaman anak dan `pb-32` pada root layout untuk mencegah tumpang tindih dengan navigasi bawah.
4. **Tailwind CSS v4**: Kelas utilitas kustom (seperti `glass-card`) harus didefinisikan secara standar di `src/gaya/Utama.css`.
5. **Aksesibilitas**: Gunakan kelas `.sr-only` untuk label tersembunyi dan pastikan atribut ARIA lengkap.

## 🚀 Perintah Eksekusi
- `bun install`: Setup dependensi.
- `bun run dev`: Menjalankan server pengembangan (port 1400).
- `bun run lint`: Verifikasi ESLint dan aturan tipe.
- `bun run build`: Membuat build produksi.

*Dokumentasi ini adalah sumber kebenaran tunggal untuk pengembangan Lembaran.*
