# Arsitektur Keamanan dan Sistem Abelion Notes

Dokumen ini menjelaskan secara teknis bagaimana Abelion Notes beroperasi dengan prinsip keamanan tinggi, kedaulatan data, dan performa lincah.

## 1. Filosofi Sistem
Abelion Notes menganut filosofi **Local-first** dan **Zero-Trust architecture**. Data pengguna adalah entitas privat yang tidak boleh diakses oleh pihak luar tanpa izin eksplisit melalui kunci dekripsi.

## 2. Lapisan Penyimpanan (Storage Layers)
Aplikasi menggunakan sistem penyimpanan berlapis untuk optimasi performa:
- **IndexedDB (Lapis Utama):** Digunakan untuk menyimpan Catatan, Folder, dan Sampah dalam volume besar.
- **LocalStorage (Lapis Preferensi):** Menyimpan pengaturan UI, tema, dan meta-data sesi.
- **In-Memory Cache:** Objek JS dalam `Map()` untuk akses instan ke data yang sering digunakan tanpa *I/O overhead*.

## 3. Keamanan Vault (E2EE)
Sistem Vault melindungi data sensitif menggunakan standar enkripsi industri:
- **Algoritma:** AES-GCM 256-bit.
- **Derivasi Kunci (Key Derivation):** Passphrase pengguna dikonversi menjadi kunci kriptografi melalui PBKDF2 dengan 600.000 iterasi dan *salt* unik 128-bit.
- **Proses:**
  1. Passphrase + Salt -> Derived Key.
  2. Data (JSON) -> Stringify -> Encrypt -> Payload (IV + Ciphertext).
- **Multi-device Sync:** *Salt* enkripsi disinkronkan ke Cloud (Supabase) secara terpisah sehingga perangkat baru dapat mengenali status Vault dan memvalidasi passphrase tanpa mengirimkan kunci asli ke server.

## 4. Infrastruktur Cloud (Hybrid Offline)
Mendukung sinkronisasi awan melalui **Supabase**:
- Data dikirim dalam bentuk terenkripsi (jika Vault aktif).
- Sinkronisasi bersifat delta (hanya mengirim perubahan) atau manual penuh.
- Mendukung mode offline total jika konfigurasi cloud tidak disediakan.

## 5. Gamifikasi dan Dokumentasi
Sistem XP dan Tier (Tingkatan) dirancang untuk memacu konsistensi pencatatan:
- **Penyusun:** Tahap awal dokumentasi.
- **Dokumentalis:** Pengelolaan informasi sistematis.
- **Arsiparis:** Fokus pada keberlangsungan data.
- **Kurator:** Pemeliharaan standar tinggi.
- **Konservator:** Penjaga warisan informasi.

---
© 2026 Lembaga Arsip Digital Abelion
