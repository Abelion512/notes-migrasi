# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

## [2.5.0] - 2026-02-18
### Added
- **Landing Page Premium**: Halaman depan baru di `/` dengan widget instalasi CLI (curl, npm, bun, brew, paru).
- **Struktur Monorepo**: Migrasi ke Bun Workspaces (`packages/core`, `packages/cli`, `packages/web`).
- **Tabel Perbandingan**: Informasi detail perbedaan fitur antara versi CLI, WEB, dan APP (Native).
- **Showcase Native**: Placeholder untuk ekosistem aplikasi native (iOS, Android, Desktop).
- **Penyaring Rute**: Komponen `PenyaringRute` untuk mengelola visibilitas layout publik vs privat.
### Changed
- **Rebranding Total**: Menghapus semua referensi "Abelion" dan menggantinya dengan "Lembaran".
- **Dashboard Path**: Memindahkan dashboard utama ke `/arsip`.
- **Core Refactor**: Memisahkan logika inti ke `@lembaran/core` untuk mendukung multi-package.
- **Vercel Config**: Optimasi build monorepo dengan `standalone` output.

## [2.4.0] - 2026-02-17
### Added
- **CLI Puitis (`lembaran`)**: Perintah baru `pantau`, `jelajah`, `kuncung` (login), `tanam` (import), `hangus`, `petik`, dan `mulai` (TUI default).
- **Agent Skills**: Integrasi 5 skill inti Vercel di `.agent/skills/`.
- **Instruksi UX**: Penambahan panduan navigasi eksplisit pada TUI (Panah & Enter).
### Changed
- Refactor tipe `Note` untuk mendukung enkripsi kredensial yang lebih fleksibel.
- Migrasi penyimpanan dari `dexie` ke `idb` murni.
### Removed
- Direktori `arsip_legacy/` dan file log/dokumentasi redundant.

... (sisanya tetap sama)
