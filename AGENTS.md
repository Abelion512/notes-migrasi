# Lembaran - Agent Guidelines

## Overview
**Lembaran** adalah platform arsip digital personal yang aman, berbasis *local-first*, dengan fokus pada kedaulatan data dan pengalaman pengguna premium.

## 🏛️ Struktur Monorepo (Packages)
Proyek ini mengikuti konvensi penamaan 'Indonesia Puitis' dalam struktur monorepo:
- `packages/core/src`: Logika inti, penyimpanan, dan utilitas (Jiwa).
  - `Arsip.ts`: Manajer enkripsi tingkat tinggi.
  - `Brankas.ts`: Mesin kriptografi (AES-GCM & Argon2id).
  - `Gudang.ts`: Abstraksi storage (Adapter Pattern).
- `packages/cli/src`: Antarmuka terminal (TUI).
- `packages/web/app`: Aplikasi Next.js (GUI & Landing Page).

## 🔒 Keamanan & Integritas Data (Sentinel Standard)
1. **Enkripsi Sisi Klien**: AES-GCM 256-bit di `Brankas.ts`.
2. **Key Derivation**: Argon2id dengan salt unik.
3. **Integritas**: SHA-256 untuk deteksi manipulasi data.
4. **Mnemonic**: 12 kata aksara untuk pemulihan.

## ⚡ Optimasi Performa (Bolt Standard)
1. **Virtualisasi**: Gunakan virtualization (`react-window`) untuk setiap daftar komponen yang berpotensi memiliki > 100 item.
2. **Session Cache**: Gunakan `Map` memori untuk menyimpan hasil dekripsi sementara selama sesi aktif untuk mempercepat fitur pencarian (Smart Find).
3. **Background Tasks**: Lakukan tugas berat (seperti dekripsi massal) dalam batch kecil di latar belakang untuk menjaga UI tetap responsif.

## ✨ Landing Page & UI
1. **Landing Page (`/`)**: Berisi instruksi instalasi CLI dan perbandingan user role.
2. **Dashboard (`/arsip`)**: Area utama manajemen catatan setelah brankas dibuka.
3. **Dokumentasi Publik (`/bantuan/publik`)**: Panduan teknis yang dapat diakses tanpa membuka brankas.

## 🛠️ Konvensi Coding
1. **Workspace Imports**: Gunakan `@lembaran/core` untuk mengimpor logika bersama di CLI atau Web.
2. **Type Safety**: Hindari `any`, gunakan interface yang didefinisikan di `core`.
3. **Responsive**: Root layout menggunakan `PenyaringRute` untuk mengatur komponen UI global.

## 🚀 Perintah Eksekusi
- `bun install`: Setup seluruh workspace.
- `bun run dev`: Jalankan Web (port 1400).
- `bun run cli`: Jalankan CLI TUI.
- `bun run build`: Build seluruh proyek.
- `bun run test:perf`: Menjalankan stress-test 1000 catatan.

*Dokumentasi ini adalah sumber kebenaran tunggal untuk pengembangan Lembaran.*
