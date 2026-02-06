# 📝 Abelion Notes

**Abelion Notes** adalah aplikasi catatan modern yang mengutamakan privasi, gamifikasi, dan pengalaman pengguna yang premium. Terinspirasi oleh desain iOS dan Notion, aplikasi ini menawarkan antarmuka yang bersih dengan fitur canggih yang berjalan sepenuhnya di perangkat Anda (Local-first).

🚀 **Akses Aplikasi:** [https://abelion512.github.io/Notes](https://abelion512.github.io/Notes)

---

## ✨ Fitur Utama

- **Apple-Inspired UI**: Desain *Glassmorphism*, *Grouped List*, dan navigasi melayang yang halus.
- **Privacy First (E2EE)**: Data Anda adalah milik Anda. Mendukung enkripsi AES-GCM 256 langsung di browser.
- **Gamifikasi Terintegrasi**: Kumpulkan XP, naikkan level, dan buka badge pencapaian saat Anda mencatat.
- **Local-first with Cloud Sync**: Menggunakan IndexedDB untuk kecepatan maksimal secara offline, dengan sinkronisasi opsional ke Supabase.
- **Multi-format Export**: Ekspor catatan Anda ke PDF, DOCX, Markdown, JSON, atau Teks Polos.
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
*Didesain dengan ❤️ oleh Abelion Lavv.*
