# Abelion Notes

Abelion Notes adalah platform arsip digital personal yang aman, berbasis local-first, dengan fokus pada kedaulatan data dan pengalaman pengguna premium.

## Quick Start

1. **Install Bun Runtime**: [bun.sh](https://bun.sh)
2. **Clone & Setup**:
   ```bash
   git clone https://github.com/Abelion-National-Archives/Abelion-Notes.git
   cd Abelion-Notes
   bun install
   ```
3. **Run Web Interface**:
   ```bash
   bun run dev
   ```
4. **Run Management TUI**:
   ```bash
   bun bin/abelion ui
   ```

## Features

- **End-to-End Encryption**: Data dienkripsi menggunakan AES-GCM 256-bit sisi klien.
- **Local-First Architecture**: Database utama menggunakan IndexedDB (via Dixie).
- **Interactive TUI/CLI**: Alat manajemen terminal yang efisien untuk developer.
- **Credential Storage**: Template khusus untuk menyimpan username, password, dan URL secara aman.
- **Gmail Camouflage**: Mode rahasia untuk menyamarkan layar kunci brankas.

## Configuration

Saat ini aplikasi dikonfigurasi melalui antarmuka **Setelan (Laras)** di dalam aplikasi.

| Fitur | Deskripsi | Default |
|-------|-----------|---------|
| Tema | Tampilan Terang, Gelap, atau Otomatis | Otomatis |
| Mode Rahasia | Penyamaran sebagai login Gmail | Mati |
| Kunci Otomatis | Durasi sebelum brankas terkunci otomatis | 1 Menit |

## Documentation

- [Manajemen CLI & API](./docs/CLI_API.md)
- [Peningkatan Masa Depan](./docs/FUTURE_IMPROVEMENTS.md)
- [Log Perubahan (Changelog)](./CHANGELOG.md)
- [Architecture Decision Records (ADR)](./docs/ADR-001_TUI_Implementation.md)

## License

MIT - Dikelola oleh Lembaga Arsip Digital Abelion.

---

## 🧠 Agent Skills

Repositori ini mendukung sistem **Agent Skills** untuk efisiensi pengembangan menggunakan AI.

1. **Setup Skills**:
   ```bash
   ./skills.sh
   ```

Tersedia skill untuk: Next.js App Router patterns, best practices, security reviews, dan advanced TypeScript.
