# Abelion Notes

Abelion Notes adalah aplikasi catatan berbasis web dengan sentuhan gamifikasi yang membantu kamu menjaga fokus sekaligus memantau suasana hati. Aplikasi ini menghadirkan editor kaya fitur, pelacakan XP & badge, serta dukungan PWA agar catatan tetap tersedia bahkan saat offline.

## Fitur utama

- ✍️ **Editor rich text** dengan dukungan huruf tebal/miring, daftar berurut, dan heading menggunakan Quill.
- 🏷️ **Tag & pencarian cepat** untuk menemukan catatan hanya dalam beberapa detik.
- 📈 **Sistem XP dan badge** yang transparan untuk menjaga motivasi menulis.
- 😊 **Mood tracker mingguan** yang merekam suasana hati setiap kali catatan disimpan.
- 💾 **Autosave & enkripsi lokal** – draf tersimpan otomatis dan seluruh data dienkripsi sebelum disimpan di `localStorage`.
- 📦 **Ekspor Markdown** serta opsi salin cepat untuk dibagikan.
- 📱 **Progressive Web App** siap di-install dan tetap dapat diakses secara offline.

## Memulai pengembangan

1. **Klon repositori**
   ```bash
   git clone <url-repo>
   cd Notes
   ```
2. **Gunakan server statis** favoritmu (misal `npx serve` atau `python -m http.server`) untuk menyajikan folder ini.
3. Buka `http://localhost:<port>` di browser modern (Chrome, Edge, Firefox, atau Safari terbaru).

> **Catatan:** Seluruh data pengguna disimpan secara lokal di browser. Bersihkan storage browser untuk menghapus data.

## Struktur direktori

```
Notes/
├── index.html          # Landing page & board catatan
├── profile.html        # Halaman profil dan pengaturan pengguna
├── index.js            # Logika utama aplikasi catatan
├── profile.js          # Logika halaman profil
├── data.js             # Utilitas penyimpanan terenkripsi & helper
├── i18n.js             # Definisi string dan utilitas translasi
├── style.css           # Gaya global dan komponen
├── service-worker.js   # Caching aset & dukungan offline
├── manifest.json       # Konfigurasi PWA
└── default-avatar.svg  # Avatar bawaan
```

## Pengujian manual yang disarankan

- Buat catatan baru dan pastikan XP serta badge bertambah.
- Tutup modal tanpa menyimpan, muat ulang halaman, lalu pastikan draf muncul kembali.
- Buka halaman profil untuk memperbarui nama, bio, dan badge utama.
- Aktifkan mode offline di DevTools dan verifikasi halaman tetap bisa diakses dari cache.

## Deployment

Repositori ini dapat di-deploy di layanan hosting statis seperti Netlify, Vercel, Cloudflare Pages, atau GitHub Pages. Pastikan `service-worker.js` dan `manifest.json` tetap berada di root agar fitur PWA berjalan optimal.

## Lisensi

Proyek ini dibuat oleh Abelion untuk tujuan belajar. Silakan fork dan kembangkan sesuai kebutuhanmu.
