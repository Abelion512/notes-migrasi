# 🔐 Perencanaan: Sinkronisasi & Keamanan

## 1. End-to-End Encryption (E2EE) - (Selesai)
**Tujuan:** Privasi total. Data hanya bisa dibaca oleh pemilik kunci.
- **Mekanisme:**
  - Kunci enkripsi diturunkan dari *Vault Password* menggunakan PBKDF2.
  - Enkripsi simetris menggunakan AES-GCM 256-bit.
  - Data dienkripsi sebelum dikirim ke Supabase/Notion.
  - **Peringatan:** Kunci tidak disimpan di server. Lupa password = Data hilang.

## 2. Integrasi Cloud (Manual Sync & Modular) - (Selesai)
**Tujuan:** Sinkronisasi multi-perangkat yang terkontrol dengan antarmuka modular.
- **Halaman Integrasi Khusus:**
  - Lokasi: `Settings > Integrations`.
  - Desain modular menggunakan kartu untuk mempermudah penambahan layanan di masa depan.
- **Supabase:**
  - Menggunakan tabel `catatan`, `folder`, dan `user_metadata`.
  - Mengaktifkan Row Level Security (RLS) di sisi server untuk perlindungan database.
- **Notion:**
  - Pemetaan catatan ke Database Notion melalui Notion API.
- **Conflict Resolution:**
  - Strategi "Last-Write-Wins" dengan notifikasi jika ada perbedaan signifikan.

## 3. Autentikasi Tambahan
- Dukungan WebAuthn (Biometric) untuk membuka Vault jika browser mendukung.
