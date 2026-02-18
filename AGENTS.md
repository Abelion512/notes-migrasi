# Lembaran - Agent Guidelines

## 🏛️ Struktur Monorepo (Packages)
Proyek ini mengikuti konvensi penamaan 'Indonesia Puitis' dalam struktur monorepo:
- `packages/core/src`: Logika inti, penyimpanan, dan utilitas (Jiwa).
- `packages/cli/src`: Antarmuka terminal (TUI).
- `packages/web/app`: Aplikasi Next.js (GUI & Landing Page).

## 🤖 Aturan Agen (Jules)
1. **Prioritas Konteks**: Jules harus membaca `AGENTS.md`, `llms.txt`, dan `.Jules/SPEC.md` sebelum memulai tugas apa pun.
2. **Eksplorasi Luas**: Selalu pindai folder `packages/core/src` untuk memahami logika enkripsi dan storage sebelum memodifikasi data.
3. **Penyelarasan Nama**: Gunakan terminologi Indonesia untuk logika internal (aksara, brankas, gudang, integritas).

## 🔒 Keamanan & Integritas Data (Sentinel Standard)
1. **Enkripsi Sisi Klien**: AES-GCM 256-bit di `Brankas.ts`.
2. **Key Derivation**: Argon2id dengan salt unik.
3. **Integritas**: SHA-256 untuk deteksi manipulasi data.

## ⚡ Optimasi Performa (Bolt Standard)
1. **Virtualisasi**: Gunakan virtualization (`react-window`) untuk daftar besar.
2. **Session Cache**: Cache hasil dekripsi sementara untuk pencarian cepat.

## 🚀 Perintah Eksekusi
- `bun run dev`: Jalankan Web (port 1400).
- `bun run cli`: Jalankan CLI TUI.
- `bun run test:perf`: Stress-test 1000 catatan.

*Detail teknis kapabilitas Jules tersedia di `.Jules/MCP_CAPABILITIES.md`.*
