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

## ✨ Landing Page & UI
1. **Landing Page (`/`)**: Berisi instruksi instalasi CLI dan perbandingan user role.
2. **Dashboard (`/arsip`)**: Area utama manajemen catatan setelah brankas dibuka.
3. **Penyamaran Gmail**: Fitur privasi yang mengubah identitas tab menjadi Gmail.

## 🛠️ Konvensi Coding
1. **Workspace Imports**: Gunakan `@lembaran/core` untuk mengimpor logika bersama di CLI atau Web.
2. **Type Safety**: Hindari `any`, gunakan interface yang didefinisikan di `core`.
3. **Responsive**: Root layout menggunakan `PenyaringRute` untuk mengatur komponen UI global.

## 🚀 Perintah Eksekusi
- `bun install`: Setup seluruh workspace.
- `bun run dev`: Jalankan Web (port 1400).
- `bun run cli`: Jalankan CLI TUI.
- `bun run build`: Build seluruh proyek.

*Dokumentasi ini adalah sumber kebenaran tunggal untuk pengembangan Lembaran.*
