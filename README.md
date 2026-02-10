# Abelion Notes (Arsip Digital Personal)

**Abelion Notes** adalah platform manajemen informasi dan dokumentasi modern yang mengedepankan kedaulatan data, keamanan tingkat tinggi, dan pengalaman pengguna premium ala iOS. Dirancang untuk pelestarian ide secara sistematis dengan filosofi *Local-first*.

---

## 🏛️ Visi & Karakter Utama

*   **Premium Glass App**: Antarmuka *Glassmorphism* yang dinamis dan hidup.
*   **Kedaulatan Data**: Enkripsi AES-GCM 256-bit sisi klien secara standar.
*   **Skalabilitas Enterprise**: Dirancang untuk menangani ribuan catatan dengan performa instan.
*   **Fokus Navigasi**: Layout modern berbasis navigasi bawah (Pill-style) yang konsisten di semua perangkat.

---

## 🛠️ Stack Teknologi Modern

*   **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
*   **Styling**: Tailwind CSS v4, Framer Motion.
*   **Penyimpanan**: IndexedDB (Utama), Supabase (Sync Opsional).
*   **Keamanan**: Web Crypto API (E2EE), PBKDF2 Key Derivation.
*   **Infrastruktur**: Docker & CLI Management Support.

---

## 📂 Struktur Proyek (Feature-Sliced Design)

*   `src/app`: Gerbang utama aplikasi (Routing & Pages).
*   `src/components`: Komponen modular (Atomic UI & Shareable Shells).
*   `src/lib/storage`: Jantung aplikasi—Manajemen enkripsi dan database lokal.
*   `src/lib/sync`: Jembatan sinkronisasi data ke awan.
*   `src/types`: Definisi kontrak data lintas sistem.

---

## 🚀 Persiapan Pengembangan

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/Abelion-National-Archives/Abelion-Notes.git
    cd Abelion-Notes
    bun install
    ```

2.  **Jalankan Lingkungan Pengembangan**:
    ```bash
    bun run dev
    ```

3.  **Docker & CLI**:
    Aplikasi siap dijalankan dengan Docker:
    ```bash
    docker compose up -d
    ```

---

## 🤝 Standar Kontribusi & Sintaks

Kami menjaga kualitas kode dengan standar ketat:
- Semua fungsi inti wajib memiliki penanganan error yang jelas dan ramah pengguna.
- UI harus mengikuti pedoman [Spesifikasi Teknis](./docs/specifications.md).
- Menghindari penggunaan data statis (*hardcoded*), semua harus ditarik dari sistem konfigurasi yang dinamis.

*Dikelola oleh Lembaga Arsip Digital Abelion.*
