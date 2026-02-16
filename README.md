# Abelion Notes (Arsip Digital Personal)

**Abelion Notes** adalah platform arsip digital personal yang aman, berbasis *local-first*, dengan fokus pada kedaulatan data dan pengalaman pengguna premium.

## 🚀 Ringkasan Aplikasi
- **Fungsi Utama**: Aplikasi ini berfungsi untuk menyimpan **kredensial** dan catatan penting secara aman.
- **Saran Penggunaan**: Agar efektif, aplikasi ini **wajib digunakan oleh developer** atau pengguna yang mengutamakan privasi dan kontrol data penuh.
- **Keamanan**: Data dienkripsi menggunakan standar AES-GCM 256-bit langsung di perangkat Anda.

---

## 🛠️ Persiapan Pengembangan (Instalasi)

Pastikan Anda memiliki **Bun** terinstal di sistem Anda.

1. **Clone Repo**:
   ```bash
   git clone https://github.com/Abelion-National-Archives/Abelion-Notes.git
   cd Abelion-Notes
   ```

2. **Install Dependensi**:
   ```bash
   bun install
   ```

3. **Jalankan Aplikasi Web (GUI)**:
   ```bash
   bun run dev
   ```
   Akses di `http://localhost:3000`. Data disimpan di browser via IndexedDB (Dexie).

---

## 💻 Manajemen Terminal (CLI & TUI)

Abelion Notes menyertakan antarmuka terminal interaktif untuk manajemen arsip yang lebih cepat bagi developer.

1. **Buka TUI Interaktif (Dashboard)**:
   ```bash
   bun bin/abelion ui
   ```

2. **Cek Status Infrastruktur**:
   ```bash
   bun bin/abelion status
   ```

3. **Operasi Catatan Cepat**:
   ```bash
   bun bin/abelion list           # Tampilkan daftar arsip
   bun bin/abelion hapus <id>     # Hapus arsip secara permanen
   ```

---

## 📂 Struktur Proyek
- `src/aksara`: Logika inti, keamanan, dan TUI (Jiwa).
- `src/komponen`: Antarmuka pengguna React/Next.js (Tubuh).
- `bin/abelion`: Entry point untuk perintah terminal.

*Dikelola oleh Lembaga Arsip Digital Abelion.*
