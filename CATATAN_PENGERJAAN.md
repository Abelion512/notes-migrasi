# Catatan Pengerjaan Abelion Notes (Developer Edition)

## 🏗️ Arsitektur & Penamaan
*   **Poetic Indonesian:** Seluruh struktur internal kode menggunakan penamaan bahasa Indonesia yang puitis (e.g., `src/aksara`, `Pundi`, `Gudang`, `Arsip`) untuk memberikan karakter unik dan menjaga konsistensi visi pengembang.
*   **Metode Sentinel (Sentinel Protocol):** Implementasi keamanan berlapis.
    *   **Argon2id:** Digunakan untuk *key derivation* dari kata sandi pengguna (19MB RAM, 2 iterations).
    *   **AES-256-GCM:** Standar enkripsi konten catatan secara lokal di perangkat.
    *   **Integritas SHA-256:** Validasi data setiap kali disimpan untuk mencegah korupsi data silent.

## 🚀 Optimasi Performa (Low-Latency Focus)
*   **Lazy Decryption:** Berbeda dari aplikasi catatan biasa, Abelion tidak melakukan dekripsi masal saat aplikasi dibuka. Dekripsi konten hanya dilakukan saat diperlukan (preview di list dan saat membuka detail), menjaga main thread tetap responsif meskipun terdapat ribuan catatan.
*   **Zustand Atomic Selectors:** Komponen hanya akan re-render jika state spesifik yang dibutuhkannya berubah, bukan setiap kali ada perubahan di store global.
*   **Responsive Desktop Layout:** Menggunakan sidebar permanen di desktop untuk efisiensi navigasi pengembang, namun tetap fluid untuk perangkat mobile.

## 🔐 Fokus Kredensial & Keamanan
*   **Structured Fields:** Input khusus untuk Username, Password, dan URL yang terenkripsi secara terpisah.
*   **Clipboard Auto-Clear:** Kredensial yang disalin akan dihapus otomatis dari clipboard sistem setelah 30 detik untuk keamanan ekstra.
*   **Secret Mode (Gmail Mask):** Penyamaran brankas sebagai halaman login Google yang identik (High-fidelity camouflage).
*   **Auto-Lock:** Brankas otomatis mengunci dalam 1 menit jika tab browser disembunyikan.

## 🛠️ Developer Experience (DX)
*   **Cmd+P (Quick Open):** Navigasi antar catatan secepat menggunakan VS Code.
*   **Ctrl+K (Command Palette):** Akses fitur tanpa menyentuh mouse.
*   **Monospace Mode:** Toggle khusus di editor untuk menulis kode atau konfigurasi dengan font yang sesuai.
*   **Double-Click to Copy:** Klik dua kali pada judul catatan di daftar untuk menyalin judul instan.

## ✅ Pekerjaan Berikutnya (Roadmap)
1.  **Sync Remote (Layanan API):** Menghubungkan gateway `Layanan.ts` ke backend untuk sinkronisasi antar perangkat.
2.  **TOTP Integration:** Mendukung kode autentikasi 2FA langsung di dalam catatan kredensial.
3.  **Vim Mode:** Pengetikan tingkat lanjut bagi developer yang terbiasa dengan Vim.
4.  **Browser Extension:** Autofill kredensial langsung dari Abelion ke situs web lain.
