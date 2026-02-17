# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [2.4.0] - 2026-02-17
### Added
- **CLI Puitis (`lembaran`)**: Perintah baru `pantau`, `jelajah`, `kuncung` (login), `tanam` (import), `hangus`, `petik`, dan `mulai` (TUI default).
- **Agent Skills**: Integrasi 5 skill inti Vercel di `.agent/skills/`.
- **Instruksi UX**: Penambahan panduan navigasi eksplisit pada TUI (Panah & Enter).
### Changed
- Refactor tipe `Note` untuk mendukung enkripsi kredensial yang lebih fleksibel (string/object).
- Migrasi penyimpanan dari `dexie` ke `idb` murni.
- Pembersihan library `argon2-browser` (diganti `@noble/hashes`).
### Removed
- Direktori `arsip_legacy/` dan file log/dokumentasi redundant.

## [2.3.0] - 2026-02-16
### Added
- Modul TUI interaktif (`src/aksara/TUI.ts`) untuk manajemen sistem.
- Perintah CLI `list`, `status`, dan `hapus` pada binary `bin/abelion`.
- Halaman Dokumentasi interaktif (`/bantuan`) dengan fitur salin kode.
- Dokumen roadmap masa depan di `docs/FUTURE_IMPROVEMENTS.md`.
### Fixed
- Bug tumpukan listener pada input terminal TUI.
- Perbaikan parsing JSX pada blok kode dokumentasi.

## [2.1.0] - 2026-02-12
### Added
- Integrasi editor Rich Text berbasis Tiptap.
- Fitur Slash Commands (/) dan Bubble Menu pada editor.
- Halaman profil `/jatidiri` dengan statistik nyata dari IndexedDB.
- Mekanisme autosave berbasis hash.

## [2.0.7] - 2026-02-06
### Added
- Migrasi arsitektur ke Feature-Sliced Design (FSD).
- Implementasi sistem keamanan Sentinel (AES-GCM + Argon2id).
- Redesign navigasi bawah (Pill-style) ala iOS 18.
- Fitur Penyamaran Gmail untuk privasi tingkat tinggi.
