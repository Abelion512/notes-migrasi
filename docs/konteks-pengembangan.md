# Konteks Pengembangan & Log Perubahan (Lembaran v2.0.7)

Dokumen ini mendetailkan perubahan besar yang dilakukan selama fase migrasi dan optimasi untuk mencapai harmoni antara fitur modern dan estetika *Glass OS* asli.

## 1. Restorasi Estetika Legacy (Pixel-Perfect)

**Masalah**: Versi migrasi awal kehilangan "jiwa" desain asli; blur terlalu kuat, radius terlalu bulat, dan layout terasa terlalu "Tailwind standar".

**Solusi**:
- **Sinkronisasi CSS**: Variabel di `src/app/globals.css` diselaraskan 100% dengan `arsip_legacy/pustaka/gaya/gayanya.css`. 
- **Typography**: Mengunci penggunaan font `SF Pro` dengan fallback yang tepat untuk menjaga nuansa iOS.
- **Efek Glassmorphism**: Mengembalikan nilai `--glass-blur: 25px` danopacity frosted glass agar konten di belakang tetap terbaca namun artistik.

## 2. Perubahan Arsitektur State Management

**Masalah**: Struktur lama menggunakan `toko.ts` yang mulai membengkak dan kurang terstruktur untuk fitur-fitur baru seperti mood tracking dan enkripsi tingkat tinggi.

**Solusi**:
- **Migrasi ke Pundi.ts**: Memperkenalkan `@/aksara/Pundi` sebagai sumber kebenaran (Source of Truth) baru berbasis Zustand.
- **Pemisahan Logic & View**: Memindahkan rendering utama dari `src/app/page.tsx` ke `src/app/LembaranUtama.tsx` untuk mendukung `Suspense` dan pemuatan asinkron yang lebih baik.
- **Cleanup**: Menghapus file `toko.ts` dan referensi lama untuk menghindari konflik sirkular.

## 3. Peningkatan Keamanan & Integritas Data

**Masalah**: Data disimpan secara lokal tanpa validasi integritas, rentan terhadap manipulasi eksternal atau kerusakan file.

**Solusi**:
- **Segel Digital (HMAC-like Hashing)**: Setiap catatan sekarang disimpan dengan properti `_hash` yang dihitung menggunakan SHA-256. Aplikasi akan memberikan peringatan jika data diubah di luar aplikasi.
- **Argon2id Integration**: Mengganti KDF standar dengan Argon2id untuk derivasi kunci enkripsi, memberikan perlindungan maksimal terhadap serangan *brute-force* pada level sistem (WebAssembly).

## 4. Redesign Navigasi & UX (Apple Style)

**Masalah**: Tombol "Tambah" di navigasi bawah terasa datar dan kurang intuitif.

**Solusi**:
- **Floating Action Button (FAB)**: Mendesain ulang tombol "+" dengan posisi terangkat (`-top-6`) dan bayangan yang lebih dalam.
- **Semantic Routing**: Mengubah rute teknis menjadi lebih puitis:
  - `/setelan` → `/laras`
  - `/biodata` → `/jatidiri`
  - `/changelog` → `/versi`

## 5. Pembersihan & Optimasi Build

**Masalah**: Terdapat banyak file redundan (`NavigasiBawah.tsx` vs `KemudiBawah.tsx`) dan struktur folder ganda yang membingungkan *Turbopack*.

**Solusi**:
- **Hard Cleanup**: Menghapus total komponen dan direktori lama yang sudah tidak digunakan.
- **Scroll Optimization**: Memperbaiki bug scroll yang macet di beberapa device dengan memaksa `overflow-y: auto` pada level root.
- **Linting Rigorous**: Menghilangkan semua `any` yang tidak perlu dan memastikan semua `<img>` menggunakan `next/image` untuk optimasi LCP.

---

> [!IMPORTANT]
> Seluruh perubahan ini telah diverifikasi melalui `bun run build` dengan status **Sukses (Exit Code 0)**.

## 6. Ekspansi Antarmuka & Dokumentasi (v2.3.0)

**Masalah**: Pengguna developer membutuhkan akses yang lebih cepat daripada sekadar antarmuka web, serta panduan teknis yang mudah diakses dan digunakan.

**Solusi**:
- **Manajemen Terminal (CLI/TUI)**: Membangun binary `lembaran` berbasis Bun yang mendukung perintah langsung (`list`, `status`, `hapus`) dan antarmuka visual terminal (TUI) interaktif.
- **Integrated Help System**: Menambahkan halaman `/bantuan` (Dokumentasi) yang dirancang khusus untuk developer dengan fitur salin kode satu-klik.
- **Roadmap Skalabilitas**: Menyusun rencana masa depan di `docs/FUTURE_IMPROVEMENTS.md` untuk mengarahkan proyek menuju standar *Enterprise*.

---
> [!NOTE]
> Proyek ini sekarang diposisikan sebagai alat bantu utama developer untuk pengelolaan kredensial secara aman dan efisien.

## 7. Optimasi Performa & UX (v2.6.0 - Misi Bolt ⚡)

**Masalah**: Rendering daftar catatan yang besar (>1000) mulai memperlambat browser, dan pencarian di dalam isi catatan (enkripsi) terlalu lambat karena harus didekripsi satu per satu.

**Solusi**:
- **Virtualisasi Daftar (List Virtualization)**: Menggunakan `react-window` untuk merender ribuan catatan dengan lancar tanpa membebani memori DOM.
- **Smart Find (Background Indexing)**: Memperkenalkan mekanisme pengindeksan latar belakang yang mendekripsi konten catatan ke dalam *session cache* memori. Hal ini memungkinkan pencarian instan di seluruh isi catatan tanpa mengorbankan keamanan jangka panjang.
- **Akses Dokumentasi Publik**: Memisahkan dokumentasi teknis ke rute `/bantuan/publik` agar calon pengguna dapat mempelajari sistem sebelum melakukan inisialisasi brankas.
- **Koreksi Tautan Kritis**: Memperbaiki tautan GitHub yang rusak (404) di seluruh aplikasi.

---
> [!NOTE]
> Fokus versi ini adalah "Speed is a Feature". Aplikasi kini siap menangani ribuan catatan dengan performa instan.

## 8. Standarisasi Instalasi & Polish UI (v2.7.0)

**Masalah**: Alur instalasi CLI tidak ramah bagi pengguna WSL/Linux yang belum memiliki `bun`, dan landing page memiliki masalah keterbacaan pada headline serta ukuran tombol yang kurang proporsional.

**Solusi**:
- **Universal Installer (`install.sh`)**: Menciptakan skrip instalasi satu baris yang cerdas; mampu mendeteksi dan menginstal `bun` secara otomatis sebelum menarik repositori Lembaran dan mendaftarkan perintah `lembaran` secara global.
- **Refinement Tipografi**: Menurunkan skala headline dari `8xl` ke `6xl` dan melonggarkan *letter-spacing* untuk meningkatkan kenyamanan baca sesuai feedback pengguna.
- **Proporsionalitas Tombol**: Mengecilkan ukuran tombol aksi utama agar lebih elegan dan tidak mendominasi layar secara berlebihan.
- **Transparansi Fitur**: Memberikan label "Coming Soon" yang jelas pada widget instalasi untuk metode yang sedang dalam pengembangan (NPM, Brew, dll).

---
> [!NOTE]
> Versi ini menandai kesiapan Lembaran untuk digunakan secara luas oleh komunitas developer melalui alur instalasi yang jauh lebih reliabel.

## 9. Hero Redesign & Customization Preview (v2.8.0)

**Masalah**: Visual landing page masih terasa kaku, deskripsi terlalu mendominasi, dan potensi kustomisasi aplikasi tidak terlihat oleh pengunjung pertama.

**Solusi**:
- **Dynamic Hero Title**: Mengimplementasikan efek *cycling words* pada judul utama untuk memberikan kesan modern dan dinamis ("Aksara yang > Berdikari/Aman/Cerdas").
- **Description Scaling**: Mengecilkan skala font deskripsi hero dan membatasi lebar maksimalnya untuk meningkatkan hierarki visual.
- **Interactive Customization**: Menambahkan modul preview kustomisasi yang memungkinkan user bereksperimen dengan aksen warna utama (Blue, Emerald, Amber, Rose, Purple) langsung di landing page.
- **GitHub CLI Install**: Mengaktifkan perintah `npm` dan `bun` menggunakan *shorthand* GitHub agar user dapat menginstal CLI secara instan meskipun belum terbit di registri resmi.

---
> [!NOTE]
> Versi 2.8.0 mengalihkan fokus dari sekadar fungsionalitas menuju pengalaman visual yang premium dan personal.
