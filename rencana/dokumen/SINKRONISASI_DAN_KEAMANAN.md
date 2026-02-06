# 🔐 Perencanaan: Sinkronisasi & Keamanan

## 1. End-to-End Encryption (E2EE)
**Tujuan:** Privasi total. Data hanya bisa dibaca oleh pemilik kunci.
- **Mekanisme:**
  - Kunci enkripsi diturunkan dari *Vault Password* menggunakan PBKDF2.
  - Enkripsi simetris menggunakan AES-GCM 256-bit.
  - Data dienkripsi sebelum dikirim ke Supabase/Notion.
  - **Peringatan:** Kunci tidak disimpan di server. Lupa password = Data hilang.

## 2. Integrasi Cloud (Manual Sync)
**Tujuan:** Sinkronisasi multi-perangkat yang terkontrol.
- **Supabase:**
  - Menggunakan tabel `catatan`, `folder`, dan `user_metadata`.
  - Tombol "Sinkronkan Sekarang" di menu Setelan atau integrasi.
- **Notion:**
  - Pemetaan catatan ke Database Notion melalui Notion API.
  - Sinkronisasi satu arah atau dua arah (opsional).
- **Conflict Resolution:**
  - Strategi "Last-Write-Wins" dengan notifikasi jika ada perbedaan signifikan.

## 3. Autentikasi Tambahan
- Dukungan WebAuthn (Biometric) untuk membuka Vault jika browser mendukung.
