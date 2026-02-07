# 📄 Alur Kerja CRUD (Catatan & Folder)

Dokumen ini menjelaskan bagaimana Abelion Notes mengelola pembuatan, pembacaan, pembaruan, dan penghapusan data secara teknis.

## 🏗️ Arsitektur Penyimpanan

Abelion menggunakan sistem penyimpanan berlapis yang dikelola oleh `aksara/brankas.js` (`AbelionStorage`):

1.  **Memory Cache (Map):** Digunakan untuk akses instan selama sesi aktif.
2.  **IndexedDB (Primer):** Media penyimpanan utama di browser untuk performa tinggi dan data besar.
3.  **LocalStorage (Sekunder):** Digunakan untuk preferensi UI ringan dan sebagai fallback jika IndexedDB tidak tersedia.
4.  **Supabase (Cloud Sync):** Jika diaktifkan, data akan disinkronkan ke cloud.

## 🗂️ Struktur Data

### Catatan (Notes)
- **ID:** UUID (v4) unik.
- **Title:** Judul catatan (plain text).
- **Content:** Konten catatan (HTML/Rich Text).
- **ContentMarkdown:** Konten dalam format Markdown (untuk pengeditan).
- **FolderId:** ID folder tempat catatan berada (opsional).
- **UpdatedAt:** Timestamp ISO 8601.
- **Pinned:** Boolean (untuk menyematkan catatan).

### Folder
- **ID:** UUID unik.
- **Name:** Nama folder.
- **Icon:** Emoji atau ID ikon.
- **ParentId:** (Akan diimplementasikan) Untuk struktur folder bertingkat.

## 🔄 Alur Data CRUD

### 1. Create (Membuat)
- Pengguna mengklik tombol "+" atau "Catatan Baru".
- `aksara/utama.js` atau modal pembuat memanggil `AbelionStorage.setNotes()`.
- Data divalidasi dan ditambahkan ke array catatan di memori.
- `brankas.js` menyimpan array tersebut ke object store `notes` di IndexedDB.
- Indeks diperbarui (pinned, updatedAt).

### 2. Read (Membaca)
- UI memanggil `AbelionStorage.getNotes()`.
- `brankas.js` memeriksa apakah data ada di cache.
- Jika tidak, data diambil dari IndexedDB atau Supabase (jika aktif).
- Filter diterapkan (misal: hanya folder tertentu atau catatan tersemat).

### 3. Update (Memperbarui)
- Pengguna mengedit catatan di `aksara/catatan.js`.
- Setelah klik simpan, objek catatan diperbarui dengan `updatedAt` terbaru.
- `AbelionStorage.setNotes()` dipanggil.
- Jika enkripsi aktif, data dienkripsi menggunakan AES-GCM sebelum disimpan.

### 4. Delete (Menghapus)
- Catatan tidak langsung dihapus secara permanen.
- `AbelionStorage.moveToTrash(id)` dipindahkan dari tabel `notes` ke tabel `trash`.
- Data di `trash` disimpan dengan flag `deletedAt`.

## 🔐 Keamanan & Enkripsi

Jika "Kunci Vault" diaktifkan:
- Semua data sensitif (`notes`, `folders`, `profile`) dienkripsi menggunakan **AES-GCM-256**.
- Kunci enkripsi diturunkan dari passphrase pengguna menggunakan **PBKDF2** dengan 600.000 iterasi.
- Data yang tersimpan di IndexedDB dalam keadaan terenkripsi (cipher text) kecuali saat Vault dibuka.

## ☁️ Sinkronisasi Supabase

- Jika URL dan API Key Supabase dikonfigurasi, `brankas.js` akan mencoba menginisialisasi `AbelionSupabaseDB`.
- Operasi `setNotes` akan mencoba melakukan `upsert` ke tabel remote di Supabase.
- Sinkronisasi dilakukan secara "Last-Write-Wins" berdasarkan timestamp `updatedAt`.

---
*Dokumen ini bersifat teknis untuk pengembang (Jules).*
