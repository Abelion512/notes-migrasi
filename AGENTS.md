# 🤖 AGENTS.md - Buku Pedoman Abelion Notes

Selamat datang, Agent. File ini berisi panduan utama dan filosofi pengembangan Abelion Notes. Anda **WAJIB** mengikuti instruksi di sini dalam setiap perubahan kode.

## 🌟 Prinsip Utama (Filosofi)
1. **Privasi & Kendali**: Pengguna memegang kendali penuh. Data bersifat lokal-pertama (*Local-first*). Sinkronisasi cloud (Supabase) bersifat opsional dan menggunakan konfigurasi mandiri.
2. **Estetika Glass OS / Notion**: Visual harus bersih, modern, dan premium.
   - Gunakan *Glassmorphism* (`backdrop-filter`) untuk panel dan modal.
   - Tipografi yang ketat (Inter/SF Pro).
   - Animasi mikro yang halus (*bouncy*, *smooth*).
3. **Bahasa & Istilah**: Gunakan **Bahasa Indonesia Baku** yang formal namun elegan.
   - Folder -> "Lemari" atau "Folder" (tetap umum).
   - Assets/Libs -> "Pustaka".
   - Pages -> "Lembaran".
   - Scripts -> "Aksara".
4. **Sistem Dinamis**: Kurangi elemen *hardcoded*. Semua fitur (UI, fungsi, konten) harus bersifat dinamis.

## 📂 Struktur Proyek (Vibe Arsip)
- `pustaka/`: Direktori utama untuk aset dan logika.
  - `aksara/`: Logic JavaScript (`.js`).
  - `gaya/`: Stylesheets (`.css`).
  - `citra/`: Images/Assets (`.png`, `.svg`).
- `lembaran/`: Lembaran HTML aplikasi (`.html`).

## 📋 Fitur Utama & Aturan Implementasi
- **Manajemen Catatan**:
  - Implementasikan Folder bertingkat.
  - Gunakan Rich Text Editor (Notion-style blocks).
- **Interaksi UI**:
  - **Context Menus**: Gunakan menu kustom (Glass OS styling). **Matikan klik kanan native browser.**
  - **Mobile**: Kustom menu dipicu via *long-press*.
- **Data Portability**:
  - **Export/Import**: Dukungan penuh format dokumen standar.

## 💡 Tips untuk Agent
- Saat membuat UI baru, selalu periksa dukungan *Glassmorphism*.
- Pastikan tampilan responsif sempurna di Mobile dan Desktop.
- Hormati hierarki z-index agar elemen tidak "tertimbun".

*Ingat: Anda adalah Jules, insinyur perangkat lunak. Buatlah Abelion Notes menjadi aplikasi catatan digital terbaik.*
