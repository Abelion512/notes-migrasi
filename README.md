# Abelion Notes (Arsip Digital Personal)

**Abelion Notes** adalah platform arsip digital personal yang aman, berbasis *local-first*, dengan fokus pada kedaulatan data dan pengalaman pengguna premium.

## 🚀 Ringkasan Aplikasi
- **Fungsi Utama**: Aplikasi ini berfungsi untuk menyimpan **kredensial** dan catatan penting secara aman.
- **Saran Penggunaan**: Agar efektif, aplikasi ini **wajib digunakan oleh developer** atau pengguna yang mengutamakan privasi dan kontrol data penuh.
- **Keamanan**: Data dienkripsi menggunakan standar AES-GCM 256-bit langsung di perangkat Anda.

---

## 🛠️ Persiapan Pengembangan

1. **Clone & Install**:
   ```bash
   git clone https://github.com/Abelion-National-Archives/Abelion-Notes.git
   cd Abelion-Notes
   bun install
   ```

2. **Jalankan Lingkungan Pengembangan**:
   ```bash
   bun run dev
   ```

---

## 💻 Manajemen Terminal (CLI & TUI)

Untuk efisiensi maksimal bagi para developer:

1. **Cek Status**:
   ```bash
   bun bin/abelion status
   ```

2. **Buka TUI Interaktif**:
   ```bash
   bun bin/abelion ui
   ```

3. **Operasi Catatan Cepat**:
   ```bash
   bun bin/abelion list
   bun bin/abelion hapus <id>
   ```

---

## 📂 Struktur Proyek
- `src/aksara`: Logika inti dan keamanan (Jiwa).
- `src/komponen`: Antarmuka pengguna (Tubuh).
- `bin/abelion`: Alat manajemen terminal.

*Dikelola oleh Lembaga Arsip Digital Abelion.*
