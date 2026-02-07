# 📜 Pedoman & Memori Pengembangan (Agent Jules)

Dokumen ini berisi kumpulan memori, pola arsitektur, dan aturan teknis yang dikumpulkan selama proses pengembangan Abelion Notes. **Agent di masa depan wajib merujuk pada dokumen ini.**

## 🏗️ Arsitektur & Teknologi

1. **Local-first Data Management**: Data utama disimpan di sisi klien (localStorage via Zustand). Sinkronisasi cloud bersifat opsional menggunakan Supabase.
2. **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand, dan Bun sebagai runtime utama.
3. **Encryption Flow**: Logika enkripsi berada di `src/aksara/kunci.ts`. Gunakan AES-GCM 256-bit. Kunci enkripsi tidak boleh meninggalkan perangkat klien.

## 🎨 Filosofi Desain (Glass OS)

1. **Estetika**: Mengikuti gaya Apple System/iOS 17+ dengan *Glassmorphism* (`backdrop-filter: blur()`).
2. **Bahasa**: Gunakan **Bahasa Indonesia Baku** yang formal namun elegan untuk teks UI, komentar kode, dan dokumentasi.
3. **Dinamis**: Hindari elemen *hardcoded*. Gunakan variabel CSS yang didefinisikan di `globals.css`.

## 🛠️ Aturan Teknis (Development Rules)

1. **Linting & Unused Variables**: Variabel, argumen, atau error yang ditangkap namun tidak digunakan **WAJIB** diberikan awalan garis bawah (`_`). ESLint telah dikonfigurasi untuk mengabaikan pola ini.
2. **Optimasi Gambar**: Selalu gunakan komponen `next/image` alih-alih tag `<img>` standar untuk memastikan performa LCP yang optimal.
3. **React State Pattern**: Untuk komponen editor atau modal yang perlu mereset state berdasarkan data yang berbeda, gunakan properti `key` pada komponen tersebut di level induk. Hindari memanggil `setState` secara sinkron di dalam `useEffect`.
4. **Build & Dev**:
   - Jalankan server pengembangan: `bun run dev` (Port 3000).
   - Bangun produksi: `bun run build`.

## 📂 Struktur Folder Utama

- `src/aksara`: Core logic, types, dan utilitas.
- `src/komponen`: Komponen UI React.
- `src/app`: Rute (pages) dan gaya global.
- `arsip_legacy`: Kode sumber versi terdahulu (arsip sejarah).

---
*Terakhir diperbarui: 7 Februari 2026*
