# 🛠️ Spesifikasi Teknis

## Arsitektur Penyimpanan
- **Primary**: IndexedDB (via `aksara/brankas.js`).
- **Secondary/Cloud**: Supabase (Opsional, dikendalikan user).
- **Security**: AES-GCM-v1 untuk enkripsi catatan rahasia.

## Struktur Data Folder (Nested)
Folder akan memiliki atribut `parentId` untuk mendukung hirarki.
```json
{
  "id": "folder_uuid",
  "name": "Nama Folder",
  "icon": "📁",
  "parentId": "parent_uuid" | null,
  "createdAt": "ISO_DATE"
}
```

## Komponen UI
- Menggunakan **Glassmorphism** untuk semua modal dan overlay.
- CSS Variable terpusat di `gaya/gayanya.css`.
- Library pihak ketiga seminimal mungkin (hanya SortableJS untuk drag-and-drop).
