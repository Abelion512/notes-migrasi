# Lembaga Arsip Digital Abelion (Abelion)

**Lembaga Arsip Digital Abelion** adalah sistem manajemen informasi dan dokumentasi modern yang mengedepankan kedaulatan data, keamanan tingkat tinggi, dan pengalaman pengguna premium. Mengadopsi prinsip *Local-first* dan estetika iOS, platform ini dirancang untuk pelestarian ide dan catatan secara sistematis.

🚀 **Akses Platform:** [https://abelion512.github.io/Notes](https://abelion512.github.io/Notes)

---

## Fitur Utama

- **Antarmuka Khas Apple**: Implementasi desain *Glassmorphism*, *Grouped List*, dan navigasi pill-style yang responsif.
- **Kedaulatan Data (E2EE)**: Enkripsi End-to-End menggunakan algoritma AES-GCM 256-bit langsung pada perangkat pengguna.
- **Sistem Dokumentasi Nasional**: Gamifikasi berbasis tingkatan (Tier) dari Penyusun hingga Konservator, mendorong konsistensi penulisan.
- **Local-first & Cloud Sync**: Prioritas penyimpanan pada IndexedDB lokal dengan opsi sinkronisasi awan melalui Supabase.
- **Ekspor Multi-Format**: Kemampuan menghasilkan dokumen resmi dalam format PDF, DOCX, Markdown, atau JSON.
- **Smart Search & Folders**: Kelola ide-ide Anda dengan sistem folder bertingkat dan pencarian instan.

## 🛠️ Stack Teknologi

- **Bahasa**: Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Penyimpanan**: IndexedDB (Primary), LocalStorage (UI Prefs).
- **Library**:
  - [SortableJS](https://github.com/SortableJS/Sortable) (Reordering)
  - [Chart.js](https://www.chartjs.org/) (Statistik XP)
  - [Marked](https://marked.js.org/) (Markdown Parser)
  - [jsPDF](https://github.com/parallax/jsPDF) & [docx](https://github.com/dolanmiu/docx) (Generator Dokumen)

## 📦 Instalasi Lokal

1. Clone repositori ini:
   ```bash
   git clone https://github.com/Abelion512/Notes.git
   ```
2. Masuk ke direktori:
   ```bash
   cd Notes
   ```
3. Jalankan server lokal (misalnya menggunakan `http-server`):
   ```bash
   npx http-server . -p 3000
   ```
4. Buka `http://localhost:3000` di browser Anda.

## 🤝 Kontribusi

Kami sangat menghargai kontribusi dari komunitas! Silakan baca [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan lebih lanjut.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE).

---
*Dikelola oleh Lembaga Arsip Digital Abelion.*
