# Walkthrough: Integrasi Skill & CLI Puitis 'Lembaran'

Implementasi penuh dari visi **Aksara/Brankas** kini telah selesai. Walkthrough ini mencakup integrasi skill Vercel, revitalisasi CLI dengan kosa kata puitis, dan pembersihan sistem secara menyeluruh.

## 1. Konsolidasi Agen & Instalasi Skill
Folder skill telah direstrukturisasi untuk menghilangkan kebingungan symlink.
- **Path Baru**: `.agent/skills/` (Tunggal & Terpusat)
- **Skill Terinstall**:
  - `find-skills`: Penemuan kapabilitas agen.
  - `nextjs-app-router-patterns`: Arsitektur V16 App Router.
  - `nextjs-best-practices`: Standar performa & SEO.
  - `security-review`: Audit kriptografi Sentinel.
  - `typescript-advanced-types`: Keamanan tipe ketat.

## 2. CLI Puitis: `lembaran`
Antarmuka baris perintah (CLI) telah diubah total untuk mencerminkan etos puitis aplikasi.

### Alias Global
- **Command**: `lembaran` (menggantikan `bun bin/abelion ui`)
- **Akses**: Dapat dijalankan dari mana saja di terminal setelah `bun link`.
- **Repository**: [Abelion512/lembaran](https://github.com/Abelion512/lembaran)

### Kosa Kata Baru
| Perintah | Deskripsi | Vibe |
|----------|-----------|------|
| `mulai` | Menjalankan TUI Interaktif | Gerbang Utama |
| `pantau` | Cek status sistem & enkripsi | Penjaga Menara |
| `jelajah` | Lihat daftar arsip terenkripsi | Penelusur Lorong |
| `kuncung` | Login / Buka Brankas | Pemegang Kunci |
| `tanam` | Import data eksternal | Penabur Benih |
| `hangus` | Hapus permanen | Api Pemusnah |
| `petik` | Export data | Pemanen Hasil |

### UX Terpadu
- **Navigasi**: Instruksi eksplisit `(Gunakan panah ↑↓ dan Tekan ENTER)` ditambahkan di setiap menu TUI untuk menghilangkan kebingungan.
- **Edukasi**: Saat registrasi via CLI, pengguna diarahkan ke Web dengan narasi tentang "Mantra Pemulihan" (12 Kata Aksara).

## 3. Optimasi & Pembersihan
- **Sampah Dibuang**: 18+ file log/diff/saran lama dihapus. `arsip_legacy/` (63 file) dimusnahkan.
- **Library Ramping**: `dexie` dan `argon2-browser` dihapus. Digantikan oleh `idb` dan `@noble/hashes` yang lebih efisien.
- **Tipe Ketat**: Perbaikan interface `Note` di `Rumus.ts` untuk mendukung properti `kredensial` sebagai string terenkripsi.

## 4. Arsitektur Decoupled (Web vs CLI)
- **Adapter Pattern**: `Gudang.ts` kini mendeteksi environment.
  - **Browser**: Menggunakan `BrowserAdapter` (IndexedDB).
  - **CLI**: Menggunakan `FileAdapter` (JSON `.abelion-db.json`).
- **Build Safety**: Menggunakan shim pada `package.json` "browser" field untuk mencegah modul `fs` Node.js ter-bundle ke Web App.

## 5. Dokumentasi & Konteks
- **Halaman Baru**: `/tentang`, `/changelog`, `/ketentuan`, `/privasi`.
- **Files**: `LICENSE`, `CONTRIBUTING.md` standar ditambahkan.
- **QA**: Laporan audit tersedia di `qa_report.md`.
