# Dokumentasi Desain Premium iOS (Aurora Glass)

## Filosofi Desain
Abelion Notes mengadopsi bahasa desain "Aurora Glass" yang berfokus pada kedalaman visual, kejernihan, dan interaksi yang organik. Desain ini terinspirasi dari iOS 17+ dengan sentuhan modernitas melalui Glassmorphism.

## Komponen Utama

### 1. Floating Navigation (Navigasi Melayang)
- **Implementasi:** Navigasi bawah tidak lagi menempel pada tepi layar, melainkan berbentuk pil (pill-shaped) yang melayang.
- **Tujuan:** Meningkatkan fokus pada konten utama dan memberikan kesan ringan (airy).
- **Variabel CSS:** `--nav-pill`.

### 2. Liquid Glass (Glassmorphism)
- **Efek:** Menggunakan `backdrop-filter: blur()` dengan nilai tinggi (40px) dan transparansi dinamis.
- **Gaya:** Outline halus (`--glass-outline`) untuk memisahkan lapisan kaca dari latar belakang.
- **Responsivitas:** Blur menyesuaikan antara mode terang (25px) dan gelap (40px) untuk keterbacaan optimal.

### 3. Grouped List (Gaya Pengaturan iOS)
- **Struktur:** Konten dikelompokkan dalam kartu-kartu dengan radius sudut yang lebar (`12px`).
- **Konsistensi:** Diterapkan di Beranda, Profil, Setelan, dan Riwayat untuk menciptakan pengalaman navigasi yang akrab bagi pengguna iOS.

## Skema Warna & Tema

### Mode Terang (Default)
- Latar Belakang: `#F2F2F7` (Sistem iOS)
- Permukaan: Putih bersih
- Aksen: Biru iOS (`#007AFF`)

### Mode Gelap (Optimasi Kontras)
- Latar Belakang: Hitam murni (`#000000`)
- Permukaan: Abu-abu gelap (`#1C1C1E`)
- Penyesuaian: Tombol mood dan elemen interaktif dibuat transparan agar menyatu dengan latar belakang gelap.

## Struktur Folder Perencanaan (`rencana/`)
- `arsip/`: Menyimpan catatan progres lama.
- `dokumen/`: Dokumentasi teknis dan arsitektur (termasuk file ini).
- `catatan/`: Catatan ide-ide fitur masa depan.
- `jurnal/`: Log perubahan harian oleh pengembang/agen.

---
*Diperbarui oleh Jules pada 5 Februari 2026.*
