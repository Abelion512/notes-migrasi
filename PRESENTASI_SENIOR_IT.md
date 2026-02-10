# 📔 Abelion Notes: Technical Pitch & Engineering Review
**Tanggal:** 11 Februari 2026
**Presenter:** Jules (Lead Engineer / AI Agent)
**Audiens:** Senior IT Review Board

---

## 1. Executive Summary
Abelion Notes adalah aplikasi manajemen catatan yang mengadopsi paradigma **Local-first** dengan fokus pada **Zero-Knowledge Architecture** dan **Premium UX Engineering**. Proyek ini dirancang untuk menjawab keresahan terhadap fragmentasi privasi pada layanan cloud note-taking mainstream.

---

## 2. Technical Stack & Runtime
Kami memilih stack yang mengutamakan kecepatan eksekusi dan efisiensi memori:
- **Runtime:** Bun (Digunakan untuk build pipeline dan runtime eksekusi karena performa IO yang superior dibanding Node.js).
- **Frontend Framework:** Next.js 15 (App Router) - Memanfaatkan *Server Components* untuk optimasi SEO (pada landing) dan *Client Components* untuk aplikasi inti yang sangat interaktif.
- **State Management:** Zustand dengan `persist` middleware. Kami memilih Zustand karena overhead-nya yang minimal (atomic state) dan kemudahan sinkronisasi dengan LocalStorage.
- **Styling:** Tailwind CSS + CSS Variables. Sistem desain dibangun secara modular untuk mendukung *Glassmorphism* tanpa degradasi performa yang signifikan pada perangkat mobile.

---

## 3. Security Architecture (Deep Dive)
Sebagai aplikasi yang memprioritaskan privasi, kami tidak menyimpan kunci enkripsi di sisi server.
- **Key Derivation Function (KDF):** Menggunakan **PBKDF2** dengan **600.000 iterasi** dan hash SHA-256 (Web Crypto API).
  - *Note for Review:* Kami memilih iterasi tinggi untuk memperlambat serangan brute-force secara signifikan di sisi client.
- **Encryption Primitive:** **AES-GCM 256-bit**. Kami memilih GCM karena menyediakan *authenticated encryption*, memastikan integritas data sekaligus kerahasiaannya.
- **Initialization Vector (IV):** Menggunakan 12-byte random IV untuk setiap operasi enkripsi guna mencegah serangan *replay*.
- **Sync Model:** Data dikirim ke cloud (Supabase) dalam bentuk *Encrypted Payload*. Supabase hanya berfungsi sebagai *dumb storage*, tidak memiliki akses ke plaintext.

---

## 4. UI/UX Engineering: "Liquid Glass"
Tantangan teknis utama adalah mengimplementasikan estetika iOS 17+ (Glassmorphism) pada web:
- **Optimasi Blur:** Menggunakan `backdrop-filter: blur(20px)` dengan layer isolasi untuk mencegah *layout thrashing*.
- **Responsive Design:** Implementasi *Sheet style* dialog dan *floating navigation* yang mengikuti standar human-interface guidelines Apple namun tetap berbasis standar web.

---

## 5. Roadmap & Current Challenges (Phase 3)
Saat ini kami berada di Fase 3 (Optimasi & UX Lanjutan):
- **Virtual Scrolling:** Sedang dikembangkan untuk menangani >1000 catatan tanpa menurunkan FPS.
- **Offline Sync:** Implementasi *Background Sync API* untuk memastikan data tetap konsisten saat koneksi tidak stabil.
- **E2EE Sharing:** Eksperimen menggunakan *Asymmetric Encryption* (RSA/ECDH) untuk berbagi catatan antar pengguna tanpa membocorkan kunci utama.

---

## 6. Technical RFC (Request for Comments)
Kami mengharapkan masukan kritis dari Anda pada area berikut:
1. **KDF Strategy:** Apakah 600.000 iterasi PBKDF2 cukup optimal di browser mobile kelas menengah, atau sebaiknya kami beralih ke Argon2id (via WebAssembly)?
2. **Conflict Resolution:** Saat ini kami menggunakan *Last-Write-Wins*. Apakah Anda menyarankan implementasi CRDT (Conflict-free Replicated Data Types) untuk aplikasi catatan yang sifatnya tidak terlalu kolaboratif real-time?
3. **Storage Scaling:** Mengingat batasan LocalStorage (5MB-10MB), apakah transisi ke IndexedDB melalui Dexie.js atau OPFS (Origin Private File System) adalah prioritas mendesak saat ini?
4. **AI Integration:** Rencana implementasi Local LLM (WebLLM) untuk rangkuman catatan tanpa mengirim data ke API eksternal.

---
**Abelion Notes: Your data, your rules.**
