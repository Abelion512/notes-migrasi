# Rencana Implementasi: Desain Ulang Abelion Notes (Tingkat Enterprise)

**Tujuan**: Membangun ulang Abelion Notes dari nol (scratch) agar menjadi aplikasi yang dinamis, skalabel, aman, dan siap produksi.
**Filosofi**: *Local-First* (Utamakan Lokal), Enkripsi *End-to-End*, Estetika ala Apple, "Tanpa Hardcoding".

## Peninjauan Pengguna Diperlukan

> [!IMPORTANT]
> **Penghapusan Data**: Rencana ini melibatkan penghapusan direktori `src` untuk memulai dari awal yang bersih. Pastikan semua referensi kode lama tersimpan aman di `arsip_legacy`.

> [!WARNING]
> **Arsitektur Ketat**: Kita akan menggunakan struktur yang terinspirasi dari *Feature-Sliced Design* (FSD) untuk menjamin skalabilitas jangka panjang.

## 1. Arsitektur & Teknologi Stack

- **Framework**: Next.js 15 (App Router) - Routing Dinamis & optimasi SSR/CSR.
- **Styling**: Tailwind CSS v4 + Framer Motion (Tanpa file CSS blok terpisah).
  - *Sistem Desain*: Didefinisikan dalam `tailwind.config.ts` dan Variabel CSS (Dapat diganti tema).
- **Manajemen State**:
  - **Lokal**: `zustand` (State UI, Sesi Pengguna).
  - **Asinkron/Server**: `tanstack/react-query` (Pengambilan data, caching).
- **Penyimpanan ("Brankas")**:
  - **Utama**: IndexedDB (via pustaka `idb`) - Dinamis, Kapasitas besar.
  - **Sinkronisasi**: Supabase (Realtime + Postgres) - Opsional, pluggable.
  - **Enkripsi**: Web Crypto API (AES-GCM 256-bit) - Sisi Klien saja (Client-side).
- **Infrastruktur**:
  - **Docker**: `Dockerfile` standar dan `compose.yaml`.
  - **CLI**: Skrip `bin/abelion` untuk manajemen tanpa antarmuka (headless).

## 2. Struktur Direktori

```
src/
├── app/                  # Next.js App Router (Halaman)
├── components/
│   ├── ui/               # Desain Atomik (Tombol, Input, Kartu) - Dapat digunakan kembali
│   ├── shared/           # Fungsionalitas Berbagi (Modal, Navigasi Bawah)
│   └── features/         # UI Khusus Fitur (Editor, Profil)
├── lib/
│   ├── storage/          # Mesin Inti "Brankas" (IndexedDB + Enkripsi)
│   ├── sync/             # Mesin Sinkronisasi (Supabase)
│   ├── hooks/            # Hooks Kustom (Logika React)
│   └── utils/            # Fungsi Pembantu (Helpers)
├── types/                # Antarmuka TypeScript (Definisi Tipe)
└── styles/               # Gaya Global (Layer Tailwind)
```

## 3. Tahapan Implementasi

### Fase 1: Fondasi (Tanpa UI)
- [ ] **Infrastruktur**: Inisialisasi Next.js, Setup Docker, Konfigurasi Eslint/Prettier.
- [x] **Mesin Inti (`lib/storage`)**:
  - [x] Implementasi wrapper `IndexedDB` (Catatan, Folder, Pengaturan).
  - [x] Implementasi logika `CryptoEngine` (AES-GCM, PBKDF2) yang diadopsi dari `brankas.js` legacy.
  - Implementasi antarmuka `SyncEngine` (Supabase).
- [ ] **Setup State**: Konfigurasi store `Zustand` dan provider `React Query`.

### Fase 2: Sistem Desain & Kerangka (Shell)
- [x] **Konfigurasi Tailwind**: Definisikan warna "Glass OS", bayangan, dan blur sebagai kelas utilitas.
- [x] **Tipografi**: Konfigurasi font `Geist` dan `Inter` secara dinamis.
- [x] **Tata Letak**: Bangun `MobileLayout` dan `DesktopLayout` (Fokus Navigasi Bawah).
  - *Syarat*: Hapus Sidebar, gunakan Navigasi Pill Bawah untuk semua tampilan.

### Fase 3: Fitur Inti (Dinamis)
- [x] **CRUD Catatan**:
  - Rendering Daftar Dinamis (Virtualisasi untuk performa tinggi).
  - Logika Penyaringan/Pengurutan yang canggih.
- [x] **Editor**:
  - Bangun editor berbasis blok atau teks bersih (TipTap atau ContentEditable kustom).
  - Implementasi Perintah Slash (/) secara dinamis.
- [ ] **Folder**: Logika folder bertingkat (nested) menggunakan komponen rekursif.

### Fase 4: Keamanan & Poles Akhir
- [x] **UI Vault**: Layar kunci, input PIN, hook Biometrik.
  - [x] **Logika Kunci**: Setup Password & Unlock dengan Validator terenkripsi.
- [x] **Profil & Statistik**: Grafik Dinamis (Recharts/Visx) untuk "Aktivitas Mingguan".
  - [x] **Realtime Data**: Integrasi `count()` dari IndexedDB.
- [ ] **CLI**: Buat skrip untuk ekspor data via terminal (`npm run cli -- export`).

## 4. Rencana Verifikasi

### Pengujian Otomatis
- `bun test` untuk logika Kriptografi/Penyimpanan.
- Playwright untuk alur E2E (Buat Catatan -> Enkripsi -> Sinkronisasi).

### Verifikasi Manual
- **Cek Skalabilitas**: Generate 1.000 catatan dummy dan lakukan scroll cepat (tes performa).
- **Cek Keamanan**: Verifikasi bahwa data di IndexedDB benar-benar berupa string terenkripsi.
- **Docker**: Jalankan `docker compose up` dan pastikan akses berjalan lancar.
