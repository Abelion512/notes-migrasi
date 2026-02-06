# 📝 Perencanaan: Editor & Ekspor

## 1. Rich Text & Markdown Real-time
**Tujuan:** Memberikan pengalaman menulis yang modern namun tetap ringan.
- **Fitur Utama:**
  - Preview Markdown otomatis (bold, italic, list, checkbox).
  - Shortcut keyboard (Ctrl+B, Ctrl+I, dll).
  - Dukungan Wiki-links (`[[Nama Catatan]]`) untuk menghubungkan antar catatan.
- **Teknologi:** Custom light-weight parser untuk meminimalkan beban CPU pada perangkat low-tier.

## 2. Smart Export (Minimalis)
**Tujuan:** Memungkinkan pengguna memindahkan data ke format profesional.
- **Format yang Didukung:**
  - **PDF:** Desain bersih, font SF Pro/Inter, margin proporsional.
  - **DOCX:** Struktur dokumen standar untuk pengeditan lebih lanjut.
  - **Markdown/TXT:** Untuk portabilitas data mentah.
- **Opsi Ekspor:**
  - Ekspor per catatan.
  - Ekspor massal (ZIP).
  - Gabungkan catatan terpilih menjadi satu file.

## 3. Manajemen Media (Coming Soon)
- Penyimpanan gambar secara lokal (Base64/Blob) dengan opsi kompresi tinggi untuk menghemat ruang.
