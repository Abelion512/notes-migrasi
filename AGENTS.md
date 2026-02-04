# 🤖 AGENTS.md - Abelion Notes Instruction Manual

Selamat datang, Agent. File ini berisi panduan utama dan filosofi pengembangan Abelion Notes. Anda **WAJIB** mengikuti instruksi di sini dalam setiap perubahan kode.

## 🌟 Prinsip Utama (Philosophy)
1. **Privacy & Control**: User memegang kendali penuh. Data bersifat lokal-pertama (Local-first). Sinkronisasi cloud (Supabase) bersifat opsional dan menggunakan konfigurasi mandiri milik user (URL/Key).
2. **iOS/Notion-Style Aesthetics**: Visual harus bersih, modern, dan premium (Apple-inspired). Gunakan *Glassmorphism*, *Skeleton Loading*, dan *Micro-interactions* yang halus.
3. **Performance First**: Aplikasi harus tetap responsif di perangkat low-end. Hindari library yang terlalu berat atau efek yang membebani CPU/GPU secara berlebihan.
4. **Dynamic System**: Kurangi elemen hardcoded. Semua fitur (UI, fungsi, konten) harus bersifat dinamis dan fleksibel.

## 🛠️ Stack Teknologi & Penyimpanan
- **IndexedDB**: Digunakan sebagai penyimpanan utama untuk data besar (Catatan/Notes, Folder, Sampah).
- **LocalStorage**: Hanya digunakan untuk menyimpan preferensi UI, cache ringan, dan status interaksi (misal: tema, status login sesi, setting tampilan).
- **Vanilla JS**: Pertahankan arsitektur modular tanpa framework berat (React/Vue), namun pastikan kode tetap terorganisir.

## 📋 Fitur Utama & Aturan Implementasi
- **Manajemen Catatan**:
  - Implementasikan sistem Folder bertingkat (Nested Folders).
  - Tambahkan fitur Drag & Drop untuk menyusun ulang catatan/folder.
  - Tambahkan fitur Arsip dan Sampah (30 hari retensi).
  - Gunakan Rich Text Editor (Bold, Italic, Checkbox, Heading).
  - Dukungan Wiki-links `[[ ]]` antar catatan.
- **Interaksi UI**:
  - **Command Palette (⌘K)**: Untuk navigasi dan aksi cepat.
  - **Context Menus**: Klik kanan atau tekan lama pada item untuk aksi cepat.
  - **Theme**: Auto-Dark Mode & Custom Accents.
  - **Dashboard**: Productivity Hub dengan grafik (XP, statistik menulis).
- **Data Portability**:
  - **Export**: Harus mendukung MD, TXT, JSON, Excel, Word, PDF, ZIP, dan Gambar.
  - **Import**: Harus mendukung drag-and-drop file atau via file picker.

## 💡 Tips untuk Agent
- Jika memodifikasi `js/storage.js`, pastikan migrasi dari LocalStorage ke IndexedDB berjalan mulus tanpa menghilangkan data user yang sudah ada.
- Saat membuat UI baru, selalu periksa apakah elemen tersebut sudah mendukung *Glassmorphism* (`backdrop-filter: blur(...)`).
- Selalu sediakan fallback jika Supabase belum dikonfigurasi oleh user.
- Pastikan ada panduan (guide) yang jelas di UI untuk membantu user mendapatkan API Key Supabase.

*Ingat: Anda adalah Jules, engineer handal. Buatlah Abelion Notes menjadi aplikasi catatan terbaik yang pernah ada.*
