# Dokumentasi CLI & TUI Abelion

Panduan perintah untuk alat manajemen terminal `bin/abelion`.

## bun bin/abelion ui

Membuka antarmuka visual terminal (TUI) interaktif.

**Parameters:**
(None)

**Behavior:**
- Membersihkan terminal dan menampilkan menu pilihan.
- Memungkinkan navigasi menggunakan keyboard.

---

## bun bin/abelion status

Mengecek status kesehatan infrastruktur aplikasi.

**Parameters:**
(None)

**Response:**
- Konfirmasi kesehatan Core Logic, Security Engine, dan Storage.

---

## bun bin/abelion list

Menampilkan daftar singkat seluruh catatan (metadata).

**Parameters:**
(None)

**Response:**
- Daftar ID dan Judul catatan yang tersimpan.

---

## bun bin/abelion hapus <id>

Menghapus catatan secara permanen berdasarkan ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | ID unik catatan (EntityId) |

**Response:**
- Pesan konfirmasi penghapusan data dari arsip lokal.

---

## bun bin/abelion export

Mengekspor arsip terenkripsi ke file lokal.

**Status:** Under Construction 🚧
